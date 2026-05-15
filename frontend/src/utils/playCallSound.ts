export function playCallSound() {
  try {
    const ctx = new AudioContext();

    const bell = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const t = ctx.currentTime;
    bell(1047, t, 1.2);
    bell(1319, t + 0.1, 1.0);
    bell(1568, t + 0.2, 0.9);
  } catch {
    // AudioContext not available
  }
}
