package main;

import javax.swing.*;
import java.awt.*;

public class IntroScreen extends JPanel {

    public IntroScreen(GameWindow window) {
        setPreferredSize(new Dimension(800, 600));  // intro screen size
        setLayout(new GridBagLayout()); // center title + button
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;

        // ---- GAME TITLE ----
        JLabel title = new JLabel("Uhh-Maze-ing");
        title.setFont(new Font("SansSerif", Font.BOLD, 48));
        title.setForeground(Color.WHITE);

        // ---- PLAY BUTTON ----
        JButton playBtn = new JButton("Play");
        playBtn.setFont(new Font("SansSerif", Font.BOLD, 28));
        playBtn.setFocusPainted(false);
        playBtn.setBackground(new Color(80, 140, 255));
        playBtn.setForeground(Color.WHITE);

        playBtn.addActionListener(e -> {
            window.switchToLevelSelect();   // go to level map
        });

        // spacing for title
        gbc.gridy = 0;
        gbc.insets = new Insets(0, 0, 40, 0);
        add(title, gbc);

        // spacing for button
        gbc.gridy = 1;
        gbc.insets = new Insets(0, 0, 0, 0);
        add(playBtn, gbc);

        // ---- BACKGROUND COLOR ----
        setBackground(new Color(20, 20, 20));
    }
}
