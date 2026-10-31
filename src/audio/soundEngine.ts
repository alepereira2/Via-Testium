// Web Audio API Procedural Sound Engine
// Zero external asset dependencies — plays reliably in any modern browser.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Dual pulse heartbeat: Thump-thump
  public playHeartbeat(bpm: number = 70) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playThump = (time: number, freq: number, gainVal: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.15);
    };

    // First thump (lub)
    playThump(now, 75, 0.45);
    // Second thump (dub)
    playThump(now + 0.12, 60, 0.35);
  }

  // The Rooster's Crow (Cocorocó)
  public playRoosterCrow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { freq: 440, start: 0.0, dur: 0.25 }, // Co-
      { freq: 554, start: 0.26, dur: 0.25 }, // co-
      { freq: 659, start: 0.52, dur: 0.3 },  // ro-
      { freq: 880, start: 0.83, dur: 0.9 },  // cóóó!
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + n.start;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, now);
      // vibrato
      osc.frequency.linearRampToValueAtTime(n.freq * 1.03, now + n.dur * 0.5);
      osc.frequency.linearRampToValueAtTime(n.freq, now + n.dur);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + n.dur + 0.05);
    });
  }

  // Divine Shekinah Celestial Glory (Damascus teofania)
  public playShekinahGlory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const freqs = [196, 293.66, 392, 587.33, 783.99, 1174.66]; // G major chord overtones
    const now = this.ctx.currentTime;

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      // subtle shimmer
      osc.frequency.linearRampToValueAtTime(f * 1.008, now + 1.5 + idx * 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 / freqs.length, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 4.2);
    });
  }

  // Solemn Bronze Bell Toll
  public playBellToll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const harmonics = [110, 220, 335, 442, 660];
    const now = this.ctx.currentTime;

    harmonics.forEach((h, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(h, now);

      const amp = 0.25 / (i + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.1);
    });
  }

  // Charcoal Brazier Crackle (Pátio de Caifás)
  public playBrazierCrackle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 800;
    filter.Q.value = 4;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Dialog Choice Click / Parchment Sound
  public playParchmentClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const soundEngine = new SoundEngine();
