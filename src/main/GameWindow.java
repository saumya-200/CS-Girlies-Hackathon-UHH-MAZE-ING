package main;

import javax.swing.*;

public class GameWindow extends JFrame {

    public LevelManager levelManager;

    public GameWindow() {
        setTitle("Uhh-Maze-ing");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(true); // allow window resizing so maze can fill

        levelManager = new LevelManager();

        // Start with intro screen
        setContentPane(new IntroScreen(this));
        pack();

        setLocationRelativeTo(null);
        setVisible(true);

        // Start maximized so the maze will expand to fill the screen.
        // User can resize the window later; maze will scale to fit.
        setExtendedState(getExtendedState() | JFrame.MAXIMIZED_BOTH);
    }

    public void switchToLevelSelect() {
        setContentPane(new LevelSelectScreen(this, levelManager));
        revalidate();
        repaint();
    }

    public void startLevel(int level) {
        if (level == 1) {
            setContentPane(new Level1Screen(this, levelManager));
        }
        revalidate();
        repaint();
    }

    public void switchToIntro() {
        setContentPane(new IntroScreen(this));
        revalidate();
        repaint();
    }
}
