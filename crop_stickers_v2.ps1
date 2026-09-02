Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class StickerExtractor
{
    public static void FindBounds(string sourcePath)
    {
        using (Bitmap src = new Bitmap(sourcePath))
        {
            int w = src.Width;
            int h = src.Height;
            
            // The 49 cats are arranged in a 7x7 grid inside the white sheet.
            // Let's find the inner active rectangle of the sheet:
            // Top-left cat is at approx x=180..400, y=180..400
            // Bottom-right cat is at approx x=1650..1900, y=1650..1900
            
            // Let's do connected component labeling on dark/colored pixels (R < 240 || G < 240 || B < 240)
            // But ignoring the outer frame (x < 130 || x > 1920 || y < 130 || y > 1920)
            
            int leftLimit = 140;
            int rightLimit = 1910;
            int topLimit = 140;
            int bottomLimit = 1910;
            
            bool[,] mask = new bool[w, h];
            for (int y = topLimit; y < bottomLimit; y++)
            {
                for (int x = leftLimit; x < rightLimit; x++)
                {
                    Color c = src.GetPixel(x, y);
                    // Colored pixel of cat or outline
                    if (c.R < 242 || c.G < 242 || c.B < 242)
                    {
                        mask[x, y] = true;
                    }
                }
            }
            
            // Find all connected components
            bool[,] visited = new bool[w, h];
            List<Rectangle> boxes = new List<Rectangle>();
            
            for (int y = topLimit; y < bottomLimit; y++)
            {
                for (int x = leftLimit; x < rightLimit; x++)
                {
                    if (mask[x, y] && !visited[x, y])
                    {
                        int minX = x, maxX = x, minY = y, maxY = y;
                        int pixelCount = 0;
                        
                        Queue<Point> q = new Queue<Point>();
                        q.Enqueue(new Point(x, y));
                        visited[x, y] = true;
                        
                        while (q.Count > 0)
                        {
                            Point pt = q.Dequeue();
                            pixelCount++;
                            if (pt.X < minX) minX = pt.X;
                            if (pt.X > maxX) maxX = pt.X;
                            if (pt.Y < minY) minY = pt.Y;
                            if (pt.Y > maxY) maxY = pt.Y;
                            
                            // 8-neighborhood
                            for (int dy = -2; dy <= 2; dy++)
                            {
                                for (int dx = -2; dx <= 2; dx++)
                                {
                                    int nx = pt.X + dx;
                                    int ny = pt.Y + dy;
                                    if (nx >= leftLimit && nx < rightLimit && ny >= topLimit && ny < bottomLimit)
                                    {
                                        if (mask[nx, ny] && !visited[nx, ny])
                                        {
                                            visited[nx, ny] = true;
                                            q.Enqueue(new Point(nx, ny));
                                        }
                                    }
                                }
                            }
                        }
                        
                        // If it's a real sticker (more than 500 pixels and decent size)
                        if (pixelCount > 400 && (maxX - minX) > 40 && (maxY - minY) > 40)
                        {
                            boxes.Add(new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1));
                        }
                    }
                }
            }
            
            Console.WriteLine("Found " + boxes.Count + " sticker components.");
            
            // Sort boxes top-to-bottom, left-to-right (by row first, then col)
            boxes.Sort((a, b) =>
            {
                int rowA = a.Y / 240;
                int rowB = b.Y / 240;
                if (rowA != rowB) return rowA.CompareTo(rowB);
                return a.X.CompareTo(b.X);
            });
            
            int id = 1;
            foreach (var b in boxes)
            {
                // Add margin around sticker border
                int pad = 16;
                int cropX = Math.Max(0, b.X - pad);
                int cropY = Math.Max(0, b.Y - pad);
                int cropW = Math.Min(w - cropX, b.Width + pad * 2);
                int cropH = Math.Min(h - cropY, b.Height + pad * 2);
                
                using (Bitmap sticker = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
                {
                    for (int cy = 0; cy < cropH; cy++)
                    {
                        for (int cx = 0; cx < cropW; cx++)
                        {
                            sticker.SetPixel(cx, cy, src.GetPixel(cropX + cx, cropY + cy));
                        }
                    }
                    
                    // Make pure white exterior transparent
                    bool[,] bgVisited = new bool[cropW, cropH];
                    Queue<Point> bgQ = new Queue<Point>();
                    
                    for (int cx = 0; cx < cropW; cx++)
                    {
                        CheckBg(sticker, cx, 0, bgVisited, bgQ);
                        CheckBg(sticker, cx, cropH - 1, bgVisited, bgQ);
                    }
                    for (int cy = 0; cy < cropH; cy++)
                    {
                        CheckBg(sticker, 0, cy, bgVisited, bgQ);
                        CheckBg(sticker, cropW - 1, cy, bgVisited, bgQ);
                    }
                    
                    while (bgQ.Count > 0)
                    {
                        Point p = bgQ.Dequeue();
                        sticker.SetPixel(p.X, p.Y, Color.FromArgb(0, 0, 0, 0));
                        
                        int[] dx = { 1, -1, 0, 0 };
                        int[] dy = { 0, 0, 1, -1 };
                        for (int k = 0; k < 4; k++)
                        {
                            int nx = p.X + dx[k];
                            int ny = p.Y + dy[k];
                            if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH && !bgVisited[nx, ny])
                            {
                                Color col = sticker.GetPixel(nx, ny);
                                // Pure/near-white sheet background
                                if (col.R >= 248 && col.G >= 248 && col.B >= 248)
                                {
                                    bgVisited[nx, ny] = true;
                                    bgQ.Enqueue(new Point(nx, ny));
                                }
                            }
                        }
                    }
                    
                    string outName = string.Format("cat_{0:D2}.png", id);
                    string outPath = Path.Combine("assets\\stickers", outName);
                    sticker.Save(outPath, ImageFormat.Png);
                    Console.WriteLine("Saved " + outName + " at " + cropX + "," + cropY + " (" + cropW + "x" + cropH + ")");
                    id++;
                }
            }
        }
    }
    
    private static void CheckBg(Bitmap bmp, int x, int y, bool[,] visited, Queue<Point> q)
    {
        if (visited[x, y]) return;
        Color c = bmp.GetPixel(x, y);
        if (c.R >= 248 && c.G >= 248 && c.B >= 248)
        {
            visited[x, y] = true;
            q.Enqueue(new Point(x, y));
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[StickerExtractor]::FindBounds("Sticker_Cats.jpg")
