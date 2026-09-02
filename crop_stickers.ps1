Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class StickerCropper
{
    public static void ProcessSheet(string sourcePath, string outputDir)
    {
        using (Bitmap src = new Bitmap(sourcePath))
        {
            int w = src.Width;
            int h = src.Height;
            
            // Sheet is 7 columns x 7 rows = 49 stickers
            int cols = 7;
            int rows = 7;
            
            double cellW = (double)w / cols;
            double cellH = (double)h / rows;
            
            int count = 1;
            
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    int startX = (int)(c * cellW);
                    int startY = (int)(r * cellH);
                    int endX = Math.Min(w, (int)((c + 1) * cellW));
                    int endY = Math.Min(h, (int)((r + 1) * cellH));
                    
                    // 1. Find bounding box inside cell
                    int minX = endX, maxX = startX, minY = endY, maxY = startY;
                    
                    for (int y = startY; y < endY; y++)
                    {
                        for (int x = startX; x < endX; x++)
                        {
                            Color px = src.GetPixel(x, y);
                            // Background is pure or near pure white (R > 250 && G > 250 && B > 250)
                            // The sticker contour/shadow/body has lower RGB
                            if (px.R < 248 || px.G < 248 || px.B < 248)
                            {
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }
                    
                    if (minX >= maxX || minY >= maxY) continue;
                    
                    // Add padding around sticker
                    int pad = 12;
                    minX = Math.Max(0, minX - pad);
                    minY = Math.Max(0, minY - pad);
                    maxX = Math.Min(w - 1, maxX + pad);
                    maxY = Math.Min(h - 1, maxY + pad);
                    
                    int cropW = maxX - minX + 1;
                    int cropH = maxY - minY + 1;
                    
                    using (Bitmap cropped = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
                    {
                        // Copy pixels
                        for (int y = 0; y < cropH; y++)
                        {
                            for (int x = 0; x < cropW; x++)
                            {
                                Color orig = src.GetPixel(minX + x, minY + y);
                                cropped.SetPixel(x, y, orig);
                            }
                        }
                        
                        // Flood-fill transparency from the 4 corners of the cropped image
                        bool[,] visited = new bool[cropW, cropH];
                        Queue<Point> queue = new Queue<Point>();
                        
                        // Enqueue boundary edge pixels that are near-white
                        for (int x = 0; x < cropW; x++)
                        {
                            CheckAndEnqueue(cropped, x, 0, visited, queue);
                            CheckAndEnqueue(cropped, x, cropH - 1, visited, queue);
                        }
                        for (int y = 0; y < cropH; y++)
                        {
                            CheckAndEnqueue(cropped, 0, y, visited, queue);
                            CheckAndEnqueue(cropped, cropW - 1, y, visited, queue);
                        }
                        
                        while (queue.Count > 0)
                        {
                            Point pt = queue.Dequeue();
                            cropped.SetPixel(pt.X, pt.Y, Color.FromArgb(0, 255, 255, 255));
                            
                            int[] dx = { 1, -1, 0, 0 };
                            int[] dy = { 0, 0, 1, -1 };
                            
                            for (int i = 0; i < 4; i++)
                            {
                                int nx = pt.X + dx[i];
                                int ny = pt.Y + dy[i];
                                
                                if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH && !visited[nx, ny])
                                {
                                    Color p = cropped.GetPixel(nx, ny);
                                    // Background is very bright white (R>=245 && G>=245 && B>=245)
                                    if (p.R >= 246 && p.G >= 246 && p.B >= 246)
                                    {
                                        visited[nx, ny] = true;
                                        queue.Enqueue(new Point(nx, ny));
                                    }
                                }
                            }
                        }
                        
                        // Save processed transparent sticker PNG
                        string filename = string.Format("cat_{0:D2}.png", count);
                        string outPath = Path.Combine(outputDir, filename);
                        cropped.Save(outPath, ImageFormat.Png);
                        Console.WriteLine("Saved: " + filename + " (" + cropW + "x" + cropH + ")");
                        count++;
                    }
                }
            }
        }
    }
    
    private static void CheckAndEnqueue(Bitmap bmp, int x, int y, bool[,] visited, Queue<Point> queue)
    {
        if (visited[x, y]) return;
        Color c = bmp.GetPixel(x, y);
        if (c.R >= 245 && c.G >= 245 && c.B >= 245)
        {
            visited[x, y] = true;
            queue.Enqueue(new Point(x, y));
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[StickerCropper]::ProcessSheet("Sticker_Cats.jpg", "assets\stickers")
