package main;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class Level1Screen extends JPanel {

    private final GameWindow window;
    private final LevelManager levelManager;
    private final MazeTileManager maze;
    private final Player player;

    private boolean showSignMessage = false;

    public Level1Screen(GameWindow window, LevelManager lm) {
        this.window = window;
        this.levelManager = lm;

        setBackground(Color.BLACK);
        setFocusable(true);

        maze = new MazeTileManager();

        // Starting position (logical pixels)
        int startX = MazeTileManager.TILE_SIZE * 1;
        int startY = MazeTileManager.TILE_SIZE * 1;
        player = new Player(startX, startY);

        setupInput();

        // reveal starting area
        revealAroundPlayer();

        Timer timer = new Timer(16, e -> gameUpdate());
        timer.start();
    }

    @Override
    public void addNotify() {
        super.addNotify();
        requestFocusInWindow(); // ensure we get keyboard focus once displayed
    }

    private void setupInput() {
        addKeyListener(new KeyAdapter() {
            @Override public void keyPressed(KeyEvent e) { player.keyPressed(e); }
            @Override public void keyReleased(KeyEvent e) { player.keyReleased(e); }
        });
    }

    private void gameUpdate() {
        requestFocusInWindow(); // keep focus during gameplay
        player.update(0.016, maze);
        revealAroundPlayer();
        checkSignCollision();
        checkExit();
        repaint();
    }

    private void revealAroundPlayer() {
        Rectangle pb = player.getBounds();
        int r = pb.y / MazeTileManager.TILE_SIZE;
        int c = pb.x / MazeTileManager.TILE_SIZE;

        maze.revealTile(r, c);
        maze.revealTile(r - 1, c);
        maze.revealTile(r + 1, c);
        maze.revealTile(r, c - 1);
        maze.revealTile(r, c + 1);
    }

    private void checkSignCollision() {
        Rectangle pb = player.getBounds();
        int r = pb.y / MazeTileManager.TILE_SIZE;
        int c = pb.x / MazeTileManager.TILE_SIZE;
        if (maze.getTile(r, c) == TileType.SIGN) {
            showSignMessage = true;
        }
    }

    private void checkExit() {
        Rectangle pb = player.getBounds();
        int r = pb.y / MazeTileManager.TILE_SIZE;
        int c = pb.x / MazeTileManager.TILE_SIZE;
        if (maze.getTile(r, c) == TileType.EXIT) {
            levelManager.unlockNextLevel(1);
            window.switchToLevelSelect();
        }
    }

    @Override
    protected void paintComponent(Graphics g0) {
        super.paintComponent(g0);
        Graphics2D g = (Graphics2D) g0.create();

        // compute non-uniform scales so maze EXACTLY fills the panel
        int cols = maze.getCols();
        int rows = maze.getRows();

        double scaleX = (double) getWidth()  / (cols * MazeTileManager.TILE_SIZE);
        double scaleY = (double) getHeight() / (rows * MazeTileManager.TILE_SIZE);

        // render maze and player with scales
        maze.render(g, scaleX, scaleY);
        player.render(g, scaleX, scaleY);

        // UI message box drawn last so it's always above fog/tiles
        if (showSignMessage) drawMessageBox(g);

        g.dispose();
    }

    private void drawMessageBox(Graphics2D g) {
        int boxW = (int) (getWidth() * 0.9);
        int boxH = 90;
        int boxX = (getWidth() - boxW) / 2;
        int boxY = getHeight() - boxH - 20;

        g.setColor(new Color(0, 0, 0, 220));
        g.fillRoundRect(boxX, boxY, boxW, boxH, 20, 20);

        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 20));
        FontMetrics fm = g.getFontMetrics();
        String line1 = "Use W A S D to move around.";
        String line2 = "Reach the exit gate to finish the level!";

        int t1x = boxX + 16;
        int t1y = boxY + 30;
        int t2x = boxX + 16;
        int t2y = boxY + 56;

        g.drawString(line1, t1x, t1y);
        g.drawString(line2, t2x, t2y);
    }
}
