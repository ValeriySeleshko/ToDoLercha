Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class StickerGridExtractor
{
    public static void Extract(string sourcePath, string outputDir)
    {
        using (Bitmap src = new Bitmap(sourcePath))
        {
            int w = src.Width;
            int h = src.Height;
            
            // 7 columns and 7 rows = 49 cats
            int[] colCenters = { 260, 510, 760, 1005, 1250, 1495, 1740 };
            int[] rowCenters = { 265, 510, 765, 1010, 1255, 1500, 1750 };
            
            int halfW = 120;
            int halfH = 120;
            
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
                    
                    // 1. Find bounding box of the sticker within this cell
                    // Colored pixels or gray contour (R < 246 || G < 246 || B < 246)
                    int minX = endX, maxX = startX, minY = endY, maxY = startY;
                    for (int y = startY; y <= endY; y++)
                    {
                        for (int x = startX; x <= endX; x++)
                        {
                            Color col = src.GetPixel(x, y);
                            if (col.R < 248 || col.G < 248 || col.B < 248)
                            {
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }
                    
                    if (minX >= maxX || minY >= maxY) continue;
                    
                    // Add padding around contour (to preserve die-cut white border)
                    int pad = 8;
                    minX = Math.Max(0, minX - pad);
                    minY = Math.Max(0, minY - pad);
                    maxX = Math.Min(w - 1, maxX + pad);
                    maxY = Math.Min(h - 1, maxY + pad);
                    
                    int cropW = maxX - minX + 1;
                    int cropH = maxY - minY + 1;
                    
                    using (Bitmap sticker = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
                    {
                        for (int y = 0; y < cropH; y++)
                        {
                            for (int x = 0; x < cropW; x++)
                            {
                                sticker.SetPixel(x, y, src.GetPixel(minX + x, minY + y));
                            }
                        }
                        
                        // Flood-fill transparency from the outer borders
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
                                    // Outer paper background is pure/near white
                                    if (col.R >= 246 && col.G >= 246 && col.B >= 246)
                                    {
                                        visited[nx, ny] = true;
                                        queue.Enqueue(new Point(nx, ny));
                                    }
                                }
                            }
                        }
                        
                        string filename = string.Format("cat_{0:D2}.png", id);
                        string outPath = Path.Combine(outputDir, filename);
                        sticker.Save(outPath, ImageFormat.Png);
                        Console.WriteLine("Saved: " + filename + " (" + cropW + "x" + cropH + ")");
                        id++;
                    }
                }
            }
        }
    }
    
    private static void CheckAndEnqueue(Bitmap bmp, int x, int y, bool[,] visited, Queue<Point> queue)
    {
        if (visited[x, y]) return;
        Color c = bmp.GetPixel(x, y);
        if (c.R >= 246 && c.G >= 246 && c.B >= 246)
        {
            visited[x, y] = true;
            queue.Enqueue(new Point(x, y));
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[StickerGridExtractor]::Extract("Sticker_Cats.jpg", "assets\stickers")
