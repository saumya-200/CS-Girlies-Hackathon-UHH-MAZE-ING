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

        setPreferredSize(new Dimension(800, 600));
        setBackground(Color.BLACK);

        maze = new MazeTileManager();

        int startX = MazeTileManager.TILE_SIZE * 1;
        int startY = MazeTileManager.TILE_SIZE * 1;
        player = new Player(startX, startY);

        setupInput();

        Timer timer = new Timer(16, e -> gameUpdate());
        timer.start();
    }

    private void setupInput() {
        setFocusable(true);
        requestFocusInWindow();

        addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                player.keyPressed(e);
            }

            @Override
            public void keyReleased(KeyEvent e) {
                player.keyReleased(e);
            }
        });
    }

    private void gameUpdate() {
        player.update(0.016, maze);
        checkSignCollision();
        checkExit();
        repaint();
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
            System.out.println("LEVEL 1 COMPLETE!");
            levelManager.unlockNextLevel(1);
            window.switchToLevelSelect();
        }
    }

    @Override
    protected void paintComponent(Graphics g0) {
        super.paintComponent(g0);
        Graphics2D g = (Graphics2D) g0;

        maze.render(g);
        player.render(g);

        if (showSignMessage) {
            g.setColor(new Color(0, 0, 0, 180));
            g.fillRoundRect(100, 450, 600, 120, 20, 20);

            g.setColor(Color.WHITE);
            g.setFont(new Font("SansSerif", Font.BOLD, 22));
            g.drawString("Use W A S D to move around.", 150, 500);
            g.drawString("Reach the exit gate to finish the level!", 150, 540);
        }
    }
}
