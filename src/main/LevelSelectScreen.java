package main;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class LevelSelectScreen extends JPanel {

    private final GameWindow window;
    private final LevelManager levelManager;

    private final int LEVEL_COUNT = 12;
    private Rectangle[] levelButtons = new Rectangle[LEVEL_COUNT];

    private int hoveredIndex = -1;

    public LevelSelectScreen(GameWindow window, LevelManager lm) {
        this.window = window;
        this.levelManager = lm;

        setPreferredSize(new Dimension(800, 600));
        setBackground(new Color(25, 25, 25));

        createButtons();
        setupMouse();
    }

    private void createButtons() {
        int cols = 4;
        int spacingX = 150;
        int spacingY = 130;

        int startX = 90;
        int startY = 120;

        int index = 0;

        for (int r = 0; r < 3; r++) {
            for (int c = 0; c < cols; c++) {
                if (index >= LEVEL_COUNT) return;

                int x = startX + c * spacingX;
                int y = startY + r * spacingY;

                levelButtons[index] = new Rectangle(x, y, 80, 80);
                index++;
            }
        }
    }

    private void setupMouse() {

        // Hover highlight
        addMouseMotionListener(new MouseMotionAdapter() {
            @Override
            public void mouseMoved(MouseEvent e) {
                hoveredIndex = -1;
                Point p = e.getPoint();

                for (int i = 0; i < LEVEL_COUNT; i++) {
                    if (levelButtons[i].contains(p)) {
                        hoveredIndex = i;
                        break;
                    }
                }
                repaint();
            }
        });

        // Click to load level
        addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                Point p = e.getPoint();

                for (int i = 0; i < LEVEL_COUNT; i++) {
                    if (levelButtons[i].contains(p)) {

                        int level = i + 1;

                        if (!levelManager.isUnlocked(level)) {
                            System.out.println("Level " + level + " is locked!");
                            return;
                        }

                        // START LEVEL
                        window.startLevel(level);
                        return;
                    }
                }
            }
        });
    }

    @Override
    protected void paintComponent(Graphics g0) {
        super.paintComponent(g0);

        Graphics2D g = (Graphics2D) g0;

        // Title
        g.setFont(new Font("SansSerif", Font.BOLD, 50));
        g.setColor(Color.WHITE);
        g.drawString("Select Level", 240, 80);

        // Draw each level node
        for (int i = 0; i < LEVEL_COUNT; i++) {

            Rectangle r = levelButtons[i];
            int level = i + 1;

            boolean unlocked = levelManager.isUnlocked(level);
            boolean hover = (i == hoveredIndex);

            // Bubble background
            if (!unlocked) {
                g.setColor(new Color(90, 90, 90)); // locked grey
            } else if (hover) {
                g.setColor(new Color(120, 180, 255)); // hover blue
            } else {
                g.setColor(new Color(100, 200, 120)); // normal green
            }

            g.fillRoundRect(r.x, r.y, r.width, r.height, 20, 20);

            // Outline
            g.setColor(Color.BLACK);
            g.drawRoundRect(r.x, r.y, r.width, r.height, 20, 20);

            // Text
            g.setFont(new Font("SansSerif", Font.BOLD, 28));
            g.setColor(Color.WHITE);

            if (unlocked) {
                String num = String.valueOf(level);
                int tx = r.x + (r.width / 2) - g.getFontMetrics().stringWidth(num) / 2;
                int ty = r.y + (r.height / 2) + 10;
                g.drawString(num, tx, ty);
            } else {
                String lock = "🔒";
                int tx = r.x + (r.width / 2) - 12;
                int ty = r.y + (r.height / 2) + 10;
                g.drawString(lock, tx, ty);
            }
        }
    }
}
