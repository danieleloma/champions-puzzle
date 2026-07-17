// Web Audio API sound synthesis — no external files, works offline.
// All sounds triggered by user gestures so autoplay policy is never an issue.

const MUTE_KEY = "arsenal_puzzle_sound_muted";

let _muted: boolean | null = null;

function readMuted(): boolean {
  if (_muted !== null) return _muted;
  if (typeof window === "undefined") return false;
  _muted = window.localStorage.getItem(MUTE_KEY) === "1";
  return _muted;
}

export function isSoundMuted(): boolean {
  return readMuted();
}

export function setSoundMuted(muted: boolean) {
  _muted = muted;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  }
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!readMuted());
  return _muted as boolean;
}

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

// Schedule a single oscillator burst.
function burst(
  freq: number,
  gainPeak: number,
  duration: number,
  type: OscillatorType = "sine",
  freqEnd?: number,
  delay = 0,
) {
  if (readMuted()) return;
  const c = ctx();
  const t = c.currentTime + delay;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  }
  gain.gain.setValueAtTime(gainPeak, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

// ── Exported sounds ────────────────────────────────────────────────────────────

/** Short UI tap — buttons, cards, badges */
export function playClick() {
  burst(1000, 0.11, 0.055, "sine", 450);
}

/** Soft upward pop when lifting a puzzle tile */
export function playPickUp() {
  burst(280, 0.07, 0.09, "sine", 560);
}

/** Satisfying two-stage click when a tile snaps to its correct position */
export function playSnap() {
  burst(550, 0.16, 0.07, "sine", 880);
  burst(880, 0.10, 0.06, "sine", undefined, 0.055);
}

/** Soft low thud when two tiles are swapped but neither lands correctly */
export function playMove() {
  burst(220, 0.09, 0.09, "sine", 110);
}

/** Ascending C-major arpeggio on puzzle completion */
export function playComplete() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    burst(freq, 0.18, 0.28, "sine", undefined, i * 0.11);
  });
}
