Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class PerfectStickerExtractor
{
    public static void Extract(string sourcePath, string outputDir)
    {
        using (Bitmap src = new Bitmap(sourcePath))
        {
            int w = src.Width;
            int h = src.Height;
            
            int[] colCenters = { 260, 510, 760, 1005, 1250, 1495, 1740 };
            int[] rowCenters = { 265, 510, 765, 1010, 1255, 1500, 1750 };
            
            int halfW = 122;
            int halfH = 122;
            
            int id = 1;
            
            for (int r = 0; r < 7; r++)
            {
                for (int c = 0; c < 7; c++)
                {
                    int cx = colCenters[c];
                    int cy = rowCenters[r];
                    
                    int startX = Math.Max(0, cx - halfW);
                    int endX = Math.Min(w - 1, cx + halfW);
                    int startY = Math.Max(0, cy - halfH);
                    int endY = Math.Min(h - 1, cy + halfH);
                    
                    int cropW = endX - startX + 1;
                    int cropH = endY - startY + 1;
                    
                    using (Bitmap sticker = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
                    {
                        for (int y = 0; y < cropH; y++)
                        {
                            for (int x = 0; x < cropW; x++)
                            {
                                sticker.SetPixel(x, y, src.GetPixel(startX + x, startY + y));
                            }
                        }
                        
                        // 1. Flood-fill transparency from all outer borders
                        bool[,] visited = new bool[cropW, cropH];
                        Queue<Point> queue = new Queue<Point>();
                        
                        for (int x = 0; x < cropW; x++)
                        {
                            CheckAndEnqueue(sticker, x, 0, visited, queue);
                            CheckAndEnqueue(sticker, x, cropH - 1, visited, queue);
                        }
                        for (int y = 0; y < cropH; y++)
                        {
                            CheckAndEnqueue(sticker, 0, y, visited, queue);
                            CheckAndEnqueue(sticker, cropW - 1, y, visited, queue);
                        }
                        
                        while (queue.Count > 0)
                        {
                            Point pt = queue.Dequeue();
                            sticker.SetPixel(pt.X, pt.Y, Color.FromArgb(0, 0, 0, 0));
                            
                            int[] dx = { 1, -1, 0, 0 };
                            int[] dy = { 0, 0, 1, -1 };
                            
                            for (int i = 0; i < 4; i++)
                            {
                                int nx = pt.X + dx[i];
                                int ny = pt.Y + dy[i];
                                
                                if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH && !visited[nx, ny])
                                {
                                    Color col = sticker.GetPixel(nx, ny);
                                    // Background is very bright or light shadow cutoff
                                    if (col.R >= 244 && col.G >= 244 && col.B >= 244)
                                    {
                                        visited[nx, ny] = true;
                                        queue.Enqueue(new Point(nx, ny));
                                    }
                                }
                            }
                        }
                        
                        // 2. Connected component analysis to find the main central cat sticker and remove any neighbor specks
                        bool[,] compVisited = new bool[cropW, cropH];
                        List<List<Point>> components = new List<List<Point>>();
                        
                        for (int y = 0; y < cropH; y++)
                        {
                            for (int x = 0; x < cropW; x++)
                            {
                                if (sticker.GetPixel(x, y).A > 0 && !compVisited[x, y])
                                {
                                    List<Point> currentComp = new List<Point>();
                                    Queue<Point> cq = new Queue<Point>();
                                    cq.Enqueue(new Point(x, y));
                                    compVisited[x, y] = true;
                                    
                                    while (cq.Count > 0)
                                    {
                                        Point p = cq.Dequeue();
                                        currentComp.Add(p);
                                        
                                        for (int dy = -1; dy <= 1; dy++)
                                        {
                                            for (int dx = -1; dx <= 1; dx++)
                                            {
                                                int nx = p.X + dx;
                                                int ny = p.Y + dy;
                                                if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH)
                                                {
                                                    if (sticker.GetPixel(nx, ny).A > 0 && !compVisited[nx, ny])
                                                    {
                                                        compVisited[nx, ny] = true;
                                                        cq.Enqueue(new Point(nx, ny));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    components.Add(currentComp);
                                }
                            }
                        }
                        
                        // Keep only the largest component (the main cat sticker)
                        if (components.Count > 1)
                        {
                            components.Sort((a, b) => b.Count.CompareTo(a.Count));
                            for (int k = 1; k < components.Count; k++)
                            {
                                foreach (Point p in components[k])
                                {
                                    sticker.SetPixel(p.X, p.Y, Color.FromArgb(0, 0, 0, 0));
                                }
                            }
                        }
                        
                        // 3. Trim transparent edges
                        int trimMinX = cropW, trimMaxX = 0, trimMinY = cropH, trimMaxY = 0;
                        for (int y = 0; y < cropH; y++)
                        {
                            for (int x = 0; x < cropW; x++)
                            {
                                if (sticker.GetPixel(x, y).A > 0)
                                {
                                    if (x < trimMinX) trimMinX = x;
                                    if (x > trimMaxX) trimMaxX = x;
                                    if (y < trimMinY) trimMinY = y;
                                    if (y > trimMaxY) trimMaxY = y;
                                }
                            }
                        }
                        
                        if (trimMinX <= trimMaxX && trimMinY <= trimMaxY)
                        {
                            int pad = 4;
                            trimMinX = Math.Max(0, trimMinX - pad);
                            trimMinY = Math.Max(0, trimMinY - pad);
                            trimMaxX = Math.Min(cropW - 1, trimMaxX + pad);
                            trimMaxY = Math.Min(cropH - 1, trimMaxY + pad);
                            
                            int finalW = trimMaxX - trimMinX + 1;
                            int finalH = trimMaxY - trimMinY + 1;
                            
                            using (Bitmap finalBmp = new Bitmap(finalW, finalH, PixelFormat.Format32bppArgb))
                            {
                                for (int fy = 0; fy < finalH; fy++)
                                {
                                    for (int fx = 0; fx < finalW; fx++)
                                    {
                                        finalBmp.SetPixel(fx, fy, sticker.GetPixel(trimMinX + fx, trimMinY + fy));
                                    }
                                }
                                
                                string filename = string.Format("cat_{0:D2}.png", id);
                                string outPath = Path.Combine(outputDir, filename);
                                finalBmp.Save(outPath, ImageFormat.Png);
                                Console.WriteLine("Saved: " + filename + " (" + finalW + "x" + finalH + ")");
                                id++;
                            }
                        }
                    }
                }
            }
        }
    }
    
    private static void CheckAndEnqueue(Bitmap bmp, int x, int y, bool[,] visited, Queue<Point> queue)
    {
        if (visited[x, y]) return;
        Color c = bmp.GetPixel(x, y);
        if (c.R >= 244 && c.G >= 244 && c.B >= 244)
        {
            visited[x, y] = true;
            queue.Enqueue(new Point(x, y));
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[PerfectStickerExtractor]::Extract("Sticker_Cats.jpg", "assets\stickers")
