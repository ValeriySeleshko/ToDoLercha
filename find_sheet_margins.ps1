Add-Type -TypeDefinition @"
using System;
using System.Drawing;

public class BoundsFinder
{
    public static void FindBounds(string path)
    {
        using (Bitmap bmp = new Bitmap(path))
        {
            int minX = bmp.Width, maxX = 0, minY = bmp.Height, maxY = 0;
            for (int y = 0; y < bmp.Height; y++)
            {
                for (int x = 0; x < bmp.Width; x++)
                {
                    Color c = bmp.GetPixel(x, y);
                    if (c.R < 245 || c.G < 245 || c.B < 245)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            Console.WriteLine(path + ": X=[" + minX + ".." + maxX + "], Y=[" + minY + ".." + maxY + "]");
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[BoundsFinder]::FindBounds("Sticker_Cats.jpg")
[BoundsFinder]::FindBounds("Sticker_Cats1.jpg")
[BoundsFinder]::FindBounds("Sticker_Mushrooms.jpg")
[BoundsFinder]::FindBounds("Sticker_Svinki.jpg")
