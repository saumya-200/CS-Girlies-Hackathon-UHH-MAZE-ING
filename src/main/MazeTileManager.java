package main;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;

public class MazeTileManager {

    public static final int TILE_SIZE = 32; // logical tile size (pixels in logic)
    private final char[][] maze = {
            "WWWWWWWWWWWWWW".toCharArray(),
            "W..S.......E.W".toCharArray(),
            "W.WWWWWWWW.W.W".toCharArray(),
            "W.W.......W.W.W".toCharArray(),
            "W.W.WWWWW.W.W.W".toCharArray(),
            "W.W.W...W.W.W.W".toCharArray(),
            "W...W.W.W...W.W".toCharArray(),
            "WWWWW.W.WWWWW.W".toCharArray(),
            "W.............W".toCharArray(),
            "WWWWWWWWWWWWWW".toCharArray()
    };

    // fogRevealed[r][c] == true means tile is discovered
    private final boolean[][] fogRevealed;

    private BufferedImage wallImg;
    private BufferedImage floorImg;
    private BufferedImage signImg;
    private BufferedImage exitImg;

    public MazeTileManager() {
        fogRevealed = new boolean[getRows()][getCols()];
        wallImg  = loadSafe("res/tiles/brick.png", Color.DARK_GRAY);
        floorImg = loadSafe("res/tiles/floor.png", new Color(40, 120, 40));
        signImg  = loadSafe("res/tiles/sign.png", new Color(150, 100, 40));
        exitImg  = loadSafe("res/tiles/exit.png", new Color(100, 100, 200));
    }

    private BufferedImage loadSafe(String path, Color fallback) {
        try {
            BufferedImage img = ImageIO.read(new File(path));
            if (img == null) throw new Exception("ImageIO returned null");
            return img;
        } catch (Exception e) {
            System.out.println("⚠ Could not load " + path + " — using fallback color.");
            BufferedImage img = new BufferedImage(TILE_SIZE, TILE_SIZE, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.setColor(fallback);
            g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            g.dispose();
            return img;
        }
    }

    public int getRows() { return maze.length; }
    public int getCols() { return maze[0].length; }

    public TileType getTile(int r, int c) {
        if (r < 0 || c < 0 || r >= getRows() || c >= getCols()) return TileType.WALL;
        char ch = maze[r][c];
        return switch (ch) {
            case 'W' -> TileType.WALL;
            case 'S' -> TileType.SIGN;
            case 'E' -> TileType.EXIT;
            default -> TileType.FLOOR;
        };
    }

    public void revealTile(int r, int c) {
        if (r >= 0 && r < getRows() && c >= 0 && c < getCols()) {
            fogRevealed[r][c] = true;
        }
    }

    public boolean isRevealed(int r, int c) {
        if (r < 0 || c < 0 || r >= getRows() || c >= getCols()) return false;
        return fogRevealed[r][c];
    }

    /**
     * Render the maze using separate horizontal and vertical scales (scaleX, scaleY).
     * This allows filling the entire panel (non-uniform stretch).
     *
     * @param g graphics context
     * @param scaleX horizontal scale factor
     * @param scaleY vertical scale factor
     */
    public void render(Graphics2D g, double scaleX, double scaleY) {
        for (int r = 0; r < getRows(); r++) {
            for (int c = 0; c < getCols(); c++) {

                TileType type = getTile(r, c);
                BufferedImage img = switch (type) {
                    case WALL -> wallImg;
                    case SIGN -> signImg;
                    case EXIT -> exitImg;
                    default -> floorImg;
                };

                int drawX = (int) Math.round(c * TILE_SIZE * scaleX);
                int drawY = (int) Math.round(r * TILE_SIZE * scaleY);
                int drawW = (int) Math.round(TILE_SIZE * scaleX);
                int drawH = (int) Math.round(TILE_SIZE * scaleY);

                boolean revealed = isRevealed(r, c);

                // Exit is always visible
                if (type == TileType.EXIT) revealed = true;

                if (revealed) {
                    g.drawImage(img, drawX, drawY, drawW, drawH, null);
                } else {
                    // full black tile for true fog
                    g.setColor(Color.BLACK);
                    g.fillRect(drawX, drawY, drawW, drawH);
                }
            }
        }
    }
}
