const GameStats = (function () {
  var STORAGE_KEY = 'game_stats';

  function _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function _save(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  function _ensure(stats, levelId) {
    if (!stats[levelId]) stats[levelId] = { plays: 0, hits: 0, mistakes: 0, totalTime: 0, bestTime: null };
  }

  function recordHit(levelId) {
    var stats = _load();
    _ensure(stats, levelId);
    stats[levelId].hits++;
    stats[levelId].plays++;
    _save(stats);
  }

  function recordMistake(levelId) {
    var stats = _load();
    _ensure(stats, levelId);
    stats[levelId].mistakes++;
    _save(stats);
  }

  function recordTime(levelId, ms) {
    var stats = _load();
    _ensure(stats, levelId);
    stats[levelId].totalTime += ms;
    if (stats[levelId].bestTime === null || ms < stats[levelId].bestTime) {
      stats[levelId].bestTime = ms;
    }
    _save(stats);
  }

  function recordPlay(levelId) {
    var stats = _load();
    _ensure(stats, levelId);
    stats[levelId].plays++;
    _save(stats);
  }

  function getLevelStats(levelId) {
    var stats = _load();
    _ensure(stats, levelId);
    return stats[levelId];
  }

  function getAll() {
    return _load();
  }

  function getOverall() {
    var data = _load();
    var totalPlays = 0, totalHits = 0, totalMistakes = 0;
    Object.keys(data).forEach(function (k) {
      totalPlays += data[k].plays || 0;
      totalHits += data[k].hits || 0;
      totalMistakes += data[k].mistakes || 0;
    });
    var accuracy = totalPlays > 0 ? Math.round((totalHits / totalPlays) * 100) : 0;
    return { totalPlays: totalPlays, totalHits: totalHits, totalMistakes: totalMistakes, accuracy: accuracy };
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { recordHit: recordHit, recordMistake: recordMistake, recordTime: recordTime, recordPlay: recordPlay, getLevelStats: getLevelStats, getAll: getAll, getOverall: getOverall, reset: reset };
})();