package main;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;

public class MazeTileManager {

    public static final int TILE_SIZE = 32;

    // Maze layout
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

    // Fog array (true = revealed)
    private boolean[][] fogRevealed;

    private BufferedImage wallImg;
    private BufferedImage floorImg;
    private BufferedImage signImg;
    private BufferedImage exitImg;

    public MazeTileManager() {

        fogRevealed = new boolean[getRows()][getCols()];

        wallImg  = loadSafe("res/tiles/brick.png", Color.RED);
        floorImg = loadSafe("res/tiles/floor.png", Color.GREEN);
        signImg  = loadSafe("res/tiles/sign.png", Color.YELLOW);
        exitImg  = loadSafe("res/tiles/exit.png", Color.BLUE);
    }

    private BufferedImage loadSafe(String path, Color fallback) {
        try {
            return ImageIO.read(new File(path));
        } catch (Exception e) {
            System.out.println("⚠ Could not load " + path);

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

    public void render(Graphics2D g) {

        for (int r = 0; r < getRows(); r++) {
            for (int c = 0; c < getCols(); c++) {

                TileType type = getTile(r, c);
                BufferedImage sprite = switch (type) {
                    case WALL -> wallImg;
                    case SIGN -> signImg;
                    case EXIT -> exitImg;
                    default -> floorImg;
                };

                boolean revealed = fogRevealed[r][c];

                // EXIT is always visible
                if (type == TileType.EXIT) {
                    revealed = true;
                }

                if (revealed) {
                    // Normal rendering
                    g.drawImage(sprite, c * TILE_SIZE, r * TILE_SIZE,
                            TILE_SIZE, TILE_SIZE, null);
                } else {
                    // FULL FOG (pitch black tile)
                    g.setColor(Color.BLACK);
                    g.fillRect(c * TILE_SIZE, r * TILE_SIZE,
                            TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
