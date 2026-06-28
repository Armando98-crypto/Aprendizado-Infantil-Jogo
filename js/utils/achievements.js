const Achievements = (function () {
  var STORAGE_KEY = 'achievements';

  var ALL = [
    { id: 'first_steps', label: 'Primeiros Passos', icon: '👶', desc: 'Complete o Alfabeto' },
    { id: 'word_master', label: 'Mestre das Palavras', icon: '📖', desc: 'Complete Palavras' },
    { id: 'phrases_done', label: 'Contador de Histórias', icon: '💬', desc: 'Complete Frases' },
    { id: 'number_star', label: 'Estrela dos Números', icon: '🔢', desc: 'Complete Números' },
    { id: 'math_star', label: 'Mestre da Matemática', icon: '⭐', desc: 'Complete Somar' },
    { id: 'multi_hero', label: 'Herói da Multiplicação', icon: '🦸', desc: 'Complete Multiplicar' },
    { id: 'syllable_starter', label: 'Aprendiz de Sílabas', icon: '🔊', desc: 'Complete Sílabas' },
    { id: 'syllable_pro', label: 'Prof das Sílabas', icon: '🎯', desc: 'Complete Formar Palavras' },
    { id: 'reader', label: 'Leitor', icon: '📚', desc: 'Complete Ler Frases' },
    { id: 'zoo_keeper', label: 'Zelador do Zoo', icon: '🐘', desc: 'Complete Animais' },
    { id: 'painter', label: 'Pintor', icon: '🎨', desc: 'Complete Cores' },
    { id: 'collector', label: 'Colecionador', icon: '🏆', desc: 'Complete todas as fases' },
    { id: 'persistent', label: 'Persistente', icon: '💪', desc: 'Jogue 20 vezes' }
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function save(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function isUnlocked(id) {
    return load().indexOf(id) >= 0;
  }

  function unlock(id) {
    var list = load();
    if (list.indexOf(id) >= 0) return false;
    list.push(id);
    save(list);
    return true;
  }

  function checkSceneComplete(sceneId) {
    var map = {
      'AlphabetScene': 'first_steps',
      'WordsScene': 'word_master',
      'FrasesScene': 'phrases_done',
      'NumbersScene': 'number_star',
      'MathScene': 'math_star',
      'MultiplyScene': 'multi_hero',
      'SyllablesScene': 'syllable_starter',
      'FormWordsScene': 'syllable_pro',
      'ReadScene': 'reader',
      'AnimalsScene': 'zoo_keeper',
      'ColorsScene': 'painter'
    };
    var achId = map[sceneId];
    if (achId) return unlock(achId);
    return false;
  }

  function checkAllComplete() {
    var allSceneIds = [];
    Progression.GROUPS.forEach(function (g) {
      g.levels.forEach(function (l) { allSceneIds.push(l.id); });
    });
    var allDone = allSceneIds.every(function (id) { return Progression.isCompleted(id); });
    if (allDone) return unlock('collector');
    return false;
  }

  function getUnlocked() {
    var list = load();
    return ALL.filter(function (a) { return list.indexOf(a.id) >= 0; });
  }

  function getLocked() {
    var list = load();
    return ALL.filter(function (a) { return list.indexOf(a.id) < 0; });
  }

  function getAll() { return ALL; }

  return { ALL: ALL, isUnlocked: isUnlocked, unlock: unlock, checkSceneComplete: checkSceneComplete, checkAllComplete: checkAllComplete, getUnlocked: getUnlocked, getLocked: getLocked, getAll: getAll };
})();