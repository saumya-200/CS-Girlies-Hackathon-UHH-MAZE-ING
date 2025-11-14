package main;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.image.BufferedImage;
import java.io.File;

public class Player {

    // logical position (pixels in logical coordinate system)
    private double x, y;
    private double speed = 120.0; // logical pixels per second

    private boolean up, down, left, right;

    private BufferedImage sprite;

    public Player(int startX, int startY) {
        this.x = startX;
        this.y = startY;

        try {
            sprite = ImageIO.read(new File("res/player/player.png"));
            if (sprite == null) throw new Exception("ImageIO returned null");
        } catch (Exception e) {
            System.out.println("⚠ Could not load res/player/player.png — using fallback.");
            sprite = new BufferedImage(MazeTileManager.TILE_SIZE, MazeTileManager.TILE_SIZE, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = sprite.createGraphics();
            g.setColor(Color.CYAN);
            g.fillRect(0, 0, MazeTileManager.TILE_SIZE, MazeTileManager.TILE_SIZE);
            g.dispose();
        }
    }

    public void keyPressed(KeyEvent e) {
        switch (e.getKeyCode()) {
            case KeyEvent.VK_W, KeyEvent.VK_UP -> up = true;
            case KeyEvent.VK_S, KeyEvent.VK_DOWN -> down = true;
            case KeyEvent.VK_A, KeyEvent.VK_LEFT -> left = true;
            case KeyEvent.VK_D, KeyEvent.VK_RIGHT -> right = true;
        }
    }

    public void keyReleased(KeyEvent e) {
        switch (e.getKeyCode()) {
            case KeyEvent.VK_W, KeyEvent.VK_UP -> up = false;
            case KeyEvent.VK_S, KeyEvent.VK_DOWN -> down = false;
            case KeyEvent.VK_A, KeyEvent.VK_LEFT -> left = false;
            case KeyEvent.VK_D, KeyEvent.VK_RIGHT -> right = false;
        }
    }

    /**
     * Update player's logical position (not scaled).
     * Collision is checked using logical tile size.
     */
    public void update(double dt, MazeTileManager maze) {
        double dx = 0, dy = 0;
        if (up) dy -= 1;
        if (down) dy += 1;
        if (left) dx -= 1;
        if (right) dx += 1;

        double len = Math.sqrt(dx * dx + dy * dy);
        if (len == 0) return;

        dx /= len;
        dy /= len;

        double nx = x + dx * speed * dt;
        double ny = y + dy * speed * dt;

        // collision check: check center point after movement
        if (!collides(nx, y, maze)) x = nx;
        if (!collides(x, ny, maze)) y = ny;
    }

    private boolean collides(double px, double py, MazeTileManager maze) {
        int c = (int) (px / MazeTileManager.TILE_SIZE);
        int r = (int) (py / MazeTileManager.TILE_SIZE);
        return maze.getTile(r, c) == TileType.WALL;
    }

    public Rectangle getBounds() {
        return new Rectangle((int) Math.round(x), (int) Math.round(y), MazeTileManager.TILE_SIZE, MazeTileManager.TILE_SIZE);
    }

    /**
     * Render using scaleX/scaleY so the player is drawn proportional to the filled window.
     */
    public void render(Graphics2D g, double scaleX, double scaleY) {
        int drawX = (int) Math.round(x * scaleX);
        int drawY = (int) Math.round(y * scaleY);
        int drawW = (int) Math.round(MazeTileManager.TILE_SIZE * scaleX);
        int drawH = (int) Math.round(MazeTileManager.TILE_SIZE * scaleY);

        g.drawImage(sprite, drawX, drawY, drawW, drawH, null);
    }
}
