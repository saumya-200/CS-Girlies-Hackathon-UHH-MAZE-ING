package main;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.image.BufferedImage;
import java.io.File;

public class Player {

    private double x, y;
    private double speed = 120;

    private boolean up, down, left, right;

    private BufferedImage sprite;

    public Player(int startX, int startY) {
        this.x = startX;
        this.y = startY;

        try {
            sprite = ImageIO.read(new File("res/player/player.png"));
        } catch (Exception e) {
            System.out.println("⚠ Could not load player.png, using fallback color");
            sprite = new BufferedImage(32, 32, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = sprite.createGraphics();
            g.setColor(Color.CYAN);
            g.fillRect(0, 0, 32, 32);
            g.dispose();
        }
    }

    public void keyPressed(KeyEvent e) {
        switch (e.getKeyCode()) {
            case KeyEvent.VK_W -> up = true;
            case KeyEvent.VK_S -> down = true;
            case KeyEvent.VK_A -> left = true;
            case KeyEvent.VK_D -> right = true;
        }
    }

    public void keyReleased(KeyEvent e) {
        switch (e.getKeyCode()) {
            case KeyEvent.VK_W -> up = false;
            case KeyEvent.VK_S -> down = false;
            case KeyEvent.VK_A -> left = false;
            case KeyEvent.VK_D -> right = false;
        }
    }

    public void update(double dt, MazeTileManager maze) {

        double dx = 0, dy = 0;

        if (up) dy -= 1;
        if (down) dy += 1;
        if (left) dx -= 1;
        if (right) dx += 1;

        double len = Math.sqrt(dx*dx + dy*dy);

        if (len != 0) {
            dx /= len;
            dy /= len;

            double nx = x + dx * speed * dt;
            double ny = y + dy * speed * dt;

            if (!collides(nx, y, maze)) x = nx;
            if (!collides(x, ny, maze)) y = ny;
        }
    }

    private boolean collides(double px, double py, MazeTileManager maze) {
        int r = (int)(py / MazeTileManager.TILE_SIZE);
        int c = (int)(px / MazeTileManager.TILE_SIZE);
        return maze.getTile(r, c) == TileType.WALL;
    }

    public Rectangle getBounds() {
        return new Rectangle((int)x, (int)y, 32, 32);
    }

    public void render(Graphics2D g) {
    g.drawImage(
            sprite,
            (int)x,
            (int)y,
            MazeTileManager.TILE_SIZE,   // width = 32
            MazeTileManager.TILE_SIZE,   // height = 32
            null
    );
}
}
