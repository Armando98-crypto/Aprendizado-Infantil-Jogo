const Progression = (function () {
  const STORAGE_KEY = 'progression_v1';

  const GROUPS = [
    {
      name: 'Leitura',
      levels: [
        { id: 'AlphabetScene', label: 'Alfabeto', icon: '🔤' },
        { id: 'WordsScene', label: 'Palavras', icon: '📖' }
      ]
    },
    {
      name: 'Matemática',
      levels: [
        { id: 'NumbersScene', label: 'Números', icon: '🔢' },
        { id: 'MathScene', label: 'Somar', icon: '➕' }
      ]
    },
    {
      name: 'Escrita',
      levels: [
        { id: 'SyllablesScene', label: 'Sílabas', icon: '🔊' },
        { id: 'FormWordsScene', label: 'Formar Palavras', icon: '✏️' }
      ]
    }
  ];

  var ALL_IDS = [];
  GROUPS.forEach(function (g) {
    g.levels.forEach(function (l) { ALL_IDS.push(l.id); });
  });

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function isUnlocked(id) {
    var data = load();
    if (data[id] && data[id].unlocked === true) return true;
    for (var g = 0; g < GROUPS.length; g++) {
      if (GROUPS[g].levels[0].id === id) return true;
    }
    return false;
  }

  function isCompleted(id) {
    var data = load();
    return data[id] && data[id].completed === true;
  }

  function setUnlocked(id, val) {
    var data = load();
    if (!data[id]) data[id] = {};
    data[id].unlocked = val;
    save(data);
  }

  function markCompleted(id) {
    var data = load();
    if (!data[id]) data[id] = {};
    data[id].completed = true;
    data[id].completedAt = Date.now();
    save(data);
    var idx = ALL_IDS.indexOf(id);
    if (idx >= 0 && idx + 1 < ALL_IDS.length) {
      setUnlocked(ALL_IDS[idx + 1], true);
    }
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    Object.keys(Progress.KEYS).forEach(function (k) {
      localStorage.removeItem(Progress.KEYS[k]);
    });
    ['tutorial_alphabet_seen', 'tutorial_numbers_seen', 'tutorial_syllables_seen'].forEach(function (k) {
      localStorage.removeItem(k);
    });
  }

  function getStats() {
    var data = load();
    var completed = 0;
    ALL_IDS.forEach(function (id) {
      if (data[id] && data[id].completed) completed++;
    });
    return { completed: completed, total: ALL_IDS.length };
  }

  return {
    GROUPS: GROUPS,
    isUnlocked: isUnlocked,
    isCompleted: isCompleted,
    markCompleted: markCompleted,
    resetAll: resetAll,
    getStats: getStats
  };
})();