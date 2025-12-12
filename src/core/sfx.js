const defaultSfxSettings = {
  sfxEnabled: true,
  sfxVolume: 0.6,
};

export const sfxMap = {
  'ui:click': { frequency: 880, duration: 0.08, type: 'square' },
  'ui:navigate': { frequency: 620, duration: 0.1, type: 'sine' },
  'timer:start': { frequency: 520, duration: 0.12, type: 'triangle' },
  'timer:stop': { frequency: 420, duration: 0.08, type: 'sine' },
  'timer:complete': { frequency: 760, duration: 0.15, type: 'sawtooth', volume: 0.8 },
};

let audioContext;
let masterGain;
let unlocked = false;
let settings = { ...defaultSfxSettings };

const ensureContext = () => {
  if (audioContext) return;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = settings.sfxVolume;
  masterGain.connect(audioContext.destination);
};

const applyVolume = () => {
  if (masterGain) {
    masterGain.gain.value = settings.sfxVolume;
  }
};

const unlockAudio = async () => {
  ensureContext();
  if (!audioContext) return;

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      return;
    }
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(masterGain);
  osc.start();
  osc.stop(audioContext.currentTime + 0.01);
  unlocked = true;
};

const primeUnlockListeners = () => {
  const onFirstInput = () => {
    unlockAudio();
    ['pointerdown', 'keydown'].forEach((eventName) => {
      document.removeEventListener(eventName, onFirstInput);
    });
  };

  ['pointerdown', 'keydown'].forEach((eventName) => {
    document.addEventListener(eventName, onFirstInput);
  });
};

const createEnvelope = (osc, duration, volume = 1) => {
  const gain = audioContext.createGain();
  const attack = 0.01;
  const decay = Math.max(duration - attack, 0.01);

  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attack);
  gain.gain.linearRampToValueAtTime(0.0001, audioContext.currentTime + attack + decay);

  osc.connect(gain).connect(masterGain);
};

export const initSfx = (store) => {
  settings = { ...settings, ...store.getSettings() };
  primeUnlockListeners();

  store.subscribe((next) => {
    settings = { ...settings, ...next };
    applyVolume();
  });
};

export const playSfx = (key) => {
  const tone = sfxMap[key];
  if (!tone) return;
  if (!settings.sfxEnabled) return;

  ensureContext();
  if (!audioContext || (audioContext.state === 'suspended' && !unlocked)) return;

  const duration = tone.duration ?? 0.1;
  const osc = audioContext.createOscillator();
  osc.type = tone.type || 'sine';
  osc.frequency.value = tone.frequency;

  createEnvelope(osc, duration, tone.volume ?? 1);

  const stopAt = audioContext.currentTime + duration;
  osc.start();
  osc.stop(stopAt);
};
