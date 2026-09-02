Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class FaunaExtractor
{
    public static void Extract(string sourcePath, string outputDir, string prefix, int rows, int cols, double minX, double maxX, double minY, double maxY)
    {
        if (!Directory.Exists(outputDir))
        {
            Directory.CreateDirectory(outputDir);
        }

        using (Bitmap src = new Bitmap(sourcePath))
        {
            int w = src.Width;
            int h = src.Height;
            
            double cellW = (maxX - minX) / cols;
            double cellH = (maxY - minY) / rows;
            
            int id = 1;
            
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    double cx = minX + cellW * c + cellW / 2.0;
                    double cy = minY + cellH * r + cellH / 2.0;
                    
                    int halfW = (int)(cellW * 0.58);
                    int halfH = (int)(cellH * 0.58);
                    
                    int startX = Math.Max(0, (int)cx - halfW);
                    int endX = Math.Min(w - 1, (int)cx + halfW);
                    int startY = Math.Max(0, (int)cy - halfH);
                    int endY = Math.Min(h - 1, (int)cy + halfH);
                    
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
                        
                        // 1. Flood fill transparency from borders
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
                                    if (col.R >= 244 && col.G >= 244 && col.B >= 244)
                                    {
                                        visited[nx, ny] = true;
                                        queue.Enqueue(new Point(nx, ny));
                                    }
                                }
                            }
                        }
                        
                        // 2. Component analysis: keep main component
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
                                        
                                        for (int dy2 = -1; dy2 <= 1; dy2++)
                                        {
                                            for (int dx2 = -1; dx2 <= 1; dx2++)
                                            {
                                                int nx = p.X + dx2;
                                                int ny = p.Y + dy2;
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
                        
                        // 3. Trim bounding box
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
                                
                                string filename = string.Format("{0}_{1:D2}.png", prefix, id);
                                string outPath = Path.Combine(outputDir, filename);
                                finalBmp.Save(outPath, ImageFormat.Png);
                                id++;
                            }
                        }
                    }
                }
            }
            Console.WriteLine("Extracted " + (id - 1) + " stickers for " + prefix);
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

[FaunaExtractor]::Extract("Sticker_Fauna.jpg", "assets\stickers\fauna", "fauna", 7, 7, 28, 2021, 30, 2023)
