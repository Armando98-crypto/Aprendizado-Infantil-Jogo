/**
 * Persistência de progresso no localStorage.
 * Guarda letras, números e sílabas já completados entre sessões.
 */

const Progress = (function () {
  const KEYS = {
    alphabet: 'progress_alphabet',
    numbers: 'progress_numbers',
    syllables: 'progress_syllables'
  };

  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  function isCompleted(key, id) {
    return load(key).includes(String(id));
  }

  function markCompleted(key, id) {
    const items = load(key);
    const value = String(id);
    if (!items.includes(value)) {
      items.push(value);
      save(key, items);
      return true;
    }
    return false;
  }

  function getCount(key) {
    return load(key).length;
  }

  return { KEYS, load, save, isCompleted, markCompleted, getCount };
})();
