package main;

import java.io.*;

public class LevelManager {

    private static final String SAVE_FILE = "progress.dat";
    private int highestUnlocked = 1; // default

    public LevelManager() {
        load();
    }

    public int getHighestUnlocked() {
        return highestUnlocked;
    }

    public boolean isUnlocked(int level) {
        return level <= highestUnlocked;
    }

    public void unlockNextLevel(int completedLevel) {
        if (completedLevel >= highestUnlocked) {
            highestUnlocked = completedLevel + 1;
            save();
        }
    }

    // --- Save to progress.dat ---
    private void save() {
        try (FileWriter fw = new FileWriter(SAVE_FILE)) {
            fw.write(String.valueOf(highestUnlocked));
        } catch (IOException ignored) {}
    }

    // --- Load progress.dat ---
    private void load() {
        File f = new File(SAVE_FILE);
        if (!f.exists()) return;
        try (BufferedReader br = new BufferedReader(new FileReader(f))) {
            highestUnlocked = Integer.parseInt(br.readLine().trim());
        } catch (Exception ignored) {}
    }
}
