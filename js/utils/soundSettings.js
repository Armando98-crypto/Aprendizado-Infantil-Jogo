/**
 * Preferência global de som (voz TTS + bips Web Audio).
 * Persistida no localStorage.
 */

const SoundSettings = (function () {
  const STORAGE_KEY = 'sound_muted';
  let muted = localStorage.getItem(STORAGE_KEY) === 'true';
  const listeners = [];

  function isMuted() {
    return muted;
  }

  function setMuted(value) {
    muted = !!value;
    localStorage.setItem(STORAGE_KEY, String(muted));
    listeners.forEach((fn) => fn(muted));
    if (muted && typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }

  function toggle() {
    setMuted(!muted);
    return muted;
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  return { isMuted, setMuted, toggle, onChange };
})();
