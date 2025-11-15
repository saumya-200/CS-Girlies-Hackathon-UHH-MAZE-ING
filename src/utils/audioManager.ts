// Audio manager for game sound effects using Web Audio API

class AudioManager {
  private context: AudioContext | null = null;
  private masterVolume = 0.5;
  private enabled = true;

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.init(), { once: true });
      document.addEventListener('keydown', () => this.init(), { once: true });
    }
  }

  private init() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new AudioContextClass();
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode | null {
    if (!this.enabled || !this.context) return null;
    
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    return oscillator;
  }

  private createGain(volume: number): GainNode | null {
    if (!this.context) return null;
    
    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.context.currentTime);
    return gainNode;
  }

  // Correct answer sound - pleasant upward chime
  playCorrectAnswer() {
    if (!this.context) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
    const duration = 0.15;

    notes.forEach((freq, index) => {
      const osc = this.createOscillator(freq, 'sine');
      const gain = this.createGain(0.2);
      
      if (!osc || !gain) return;

      osc.connect(gain);
      gain.connect(this.context!.destination);

      const startTime = this.context!.currentTime + index * 0.08;
      osc.start(startTime);
      osc.stop(startTime + duration);

      // Fade out
      gain.gain.exponentialRampToValueAtTime(
        0.01 * this.masterVolume,
        startTime + duration
      );
    });
  }

  // Incorrect answer sound - gentle descending tone
  playIncorrectAnswer() {
    if (!this.context) return;

    const notes = [392, 349.23]; // G4, F4 (descending)
    const duration = 0.2;

    notes.forEach((freq, index) => {
      const osc = this.createOscillator(freq, 'sine');
      const gain = this.createGain(0.15);
      
      if (!osc || !gain) return;

      osc.connect(gain);
      gain.connect(this.context!.destination);

      const startTime = this.context!.currentTime + index * 0.15;
      osc.start(startTime);
      osc.stop(startTime + duration);

      gain.gain.exponentialRampToValueAtTime(
        0.01 * this.masterVolume,
        startTime + duration
      );
    });
  }

  // Key collected sound - bright chime
  playKeyCollected() {
    if (!this.context) return;

    const osc = this.createOscillator(880, 'sine'); // A5
    const gain = this.createGain(0.25);
    
    if (!osc || !gain) return;

    osc.connect(gain);
    gain.connect(this.context.destination);

    const startTime = this.context.currentTime;
    const duration = 0.3;

    osc.start(startTime);
    osc.stop(startTime + duration);

    gain.gain.exponentialRampToValueAtTime(
      0.01 * this.masterVolume,
      startTime + duration
    );
  }

  // Door unlock sound - triumphant fanfare
  playDoorUnlock() {
    if (!this.context) return;

    const melody = [
      { freq: 523.25, time: 0 },     // C5
      { freq: 659.25, time: 0.1 },   // E5
      { freq: 783.99, time: 0.2 },   // G5
      { freq: 1046.5, time: 0.3 },   // C6
    ];

    melody.forEach(({ freq, time }) => {
      const osc = this.createOscillator(freq, 'triangle');
      const gain = this.createGain(0.2);
      
      if (!osc || !gain) return;

      osc.connect(gain);
      gain.connect(this.context!.destination);

      const startTime = this.context!.currentTime + time;
      const duration = 0.25;

      osc.start(startTime);
      osc.stop(startTime + duration);

      gain.gain.exponentialRampToValueAtTime(
        0.01 * this.masterVolume,
        startTime + duration
      );
    });
  }

  // Victory fanfare - celebratory melody
  playVictory() {
    if (!this.context) return;

    const victory = [
      { freq: 523.25, time: 0 },     // C5
      { freq: 659.25, time: 0.15 },  // E5
      { freq: 783.99, time: 0.3 },   // G5
      { freq: 1046.5, time: 0.45 },  // C6
      { freq: 1318.5, time: 0.6 },   // E6
    ];

    victory.forEach(({ freq, time }) => {
      const osc = this.createOscillator(freq, 'sine');
      const gain = this.createGain(0.25);
      
      if (!osc || !gain) return;

      osc.connect(gain);
      gain.connect(this.context!.destination);

      const startTime = this.context!.currentTime + time;
      const duration = 0.4;

      osc.start(startTime);
      osc.stop(startTime + duration);

      gain.gain.exponentialRampToValueAtTime(
        0.01 * this.masterVolume,
        startTime + duration
      );
    });
  }

  // Step sound - subtle click
  playStep() {
    if (!this.context) return;

    const osc = this.createOscillator(200, 'square');
    const gain = this.createGain(0.05);
    
    if (!osc || !gain) return;

    osc.connect(gain);
    gain.connect(this.context.destination);

    const startTime = this.context.currentTime;
    const duration = 0.05;

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Quiz tile hover/trigger sound
  playQuizTrigger() {
    if (!this.context) return;

    const osc = this.createOscillator(440, 'sine'); // A4
    const gain = this.createGain(0.15);
    
    if (!osc || !gain) return;

    osc.connect(gain);
    gain.connect(this.context.destination);

    const startTime = this.context.currentTime;
    const duration = 0.2;

    osc.start(startTime);
    osc.stop(startTime + duration);

    gain.gain.exponentialRampToValueAtTime(
      0.01 * this.masterVolume,
      startTime + duration
    );
  }

  // Life lost sound - somber tone
  playLifeLost() {
    if (!this.context) return;

    const osc = this.createOscillator(220, 'sine'); // A3
    const gain = this.createGain(0.2);
    
    if (!osc || !gain) return;

    osc.connect(gain);
    gain.connect(this.context.destination);

    const startTime = this.context.currentTime;
    const duration = 0.4;

    osc.start(startTime);
    osc.stop(startTime + duration);

    // Fade out with slight vibrato
    gain.gain.exponentialRampToValueAtTime(
      0.01 * this.masterVolume,
      startTime + duration
    );
  }

  // Control methods
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.masterVolume;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
