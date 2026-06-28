const Progression = (function () {
  const STORAGE_KEY = 'progression_v2';

  var GROUPS = [
    {
      name: 'Leitura',
      levels: [
        { id: 'AlphabetScene', label: 'Letras', icon: '🔤' },
        { id: 'WordsScene', label: 'Palavras', icon: '📖' },
        { id: 'FrasesScene', label: 'Frases', icon: '💬' }
      ]
    },
    {
      name: 'Matemática',
      levels: [
        { id: 'NumbersScene', label: 'Números', icon: '🔢' },
        { id: 'MathScene', label: 'Somar', icon: '➕' },
        { id: 'MultiplyScene', label: 'Multiplicar', icon: '✖️' }
      ]
    },
    {
      name: 'Escrita',
      levels: [
        { id: 'SyllablesScene', label: 'Sílabas', icon: '🔊' },
        { id: 'FormWordsScene', label: 'Formar Palavras', icon: '✏️' },
        { id: 'ReadScene', label: 'Ler Frases', icon: '📖' }
      ]
    },
    {
      name: 'Extra',
      unlockedByDefault: true,
      levels: [
        { id: 'AnimalsScene', label: 'Animais', icon: '🐾' },
        { id: 'ColorsScene', label: 'Cores', icon: '🎨' }
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
      if (GROUPS[g].unlockedByDefault && GROUPS[g].levels[0].id === id) return true;
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
    localStorage.removeItem('game_stats');
    localStorage.removeItem('achievements');
    localStorage.removeItem('game_mode');
    ['tutorial_alphabet_seen','tutorial_numbers_seen','tutorial_syllables_seen'].forEach(function (k) {
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

  function getNextLevelInChain(currentId) {
    var idx = ALL_IDS.indexOf(currentId);
    if (idx >= 0 && idx + 1 < ALL_IDS.length) return ALL_IDS[idx + 1];
    return null;
  }

  function getCategoryOf(id) {
    for (var g = 0; g < GROUPS.length; g++) {
      for (var l = 0; l < GROUPS[g].levels.length; l++) {
        if (GROUPS[g].levels[l].id === id) return GROUPS[g];
      }
    }
    return null;
  }

  return {
    GROUPS: GROUPS,
    isUnlocked: isUnlocked,
    isCompleted: isCompleted,
    markCompleted: markCompleted,
    resetAll: resetAll,
    getStats: getStats,
    getNextLevelInChain: getNextLevelInChain,
    getCategoryOf: getCategoryOf
  };
})();