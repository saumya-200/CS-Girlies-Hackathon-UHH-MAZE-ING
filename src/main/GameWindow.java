package main;

import javax.swing.*;

public class GameWindow extends JFrame {

    public LevelManager levelManager;

    public GameWindow() {

        // Window settings
        setTitle("Uhh-Maze-ing");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);

        // Load progress file
        levelManager = new LevelManager();

        // Start with intro screen
        setContentPane(new IntroScreen(this));

        pack();
        setLocationRelativeTo(null);
        setVisible(true);
    }

    // --------------------------
    // SWITCH TO LEVEL SELECT
    // --------------------------
    public void switchToLevelSelect() {
        setContentPane(new LevelSelectScreen(this, levelManager));
        revalidate();
        repaint();
    }

    // --------------------------
    // START LEVEL (LEVEL LOGIC)
    // --------------------------
    public void startLevel(int level) {
        if (level == 1) {
            setContentPane(new Level1Screen(this, levelManager));
        }
        // add more:
        // else if (level == 2) setContentPane(new Level2Screen(...));
        // else if (level == 3) ...
        revalidate();
        repaint();
    }

    // --------------------------
    // GO BACK TO INTRO (OPTIONAL)
    // --------------------------
    public void switchToIntro() {
        setContentPane(new IntroScreen(this));
        revalidate();
        repaint();
    }
}
