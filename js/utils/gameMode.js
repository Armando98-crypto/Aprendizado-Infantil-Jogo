const GameMode = (function () {
  var STORAGE_KEY = 'game_mode';
  var MODE_FREE = 'free';
  var MODE_GUIDED = 'guided';

  function get() {
    return localStorage.getItem(STORAGE_KEY) || MODE_FREE;
  }

  function set(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function toggle() {
    var current = get();
    var next = current === MODE_FREE ? MODE_GUIDED : MODE_FREE;
    set(next);
    return next;
  }

  function isGuided() { return get() === MODE_GUIDED; }
  function isFree() { return get() === MODE_FREE; }

  return { MODE_FREE: MODE_FREE, MODE_GUIDED: MODE_GUIDED, get: get, set: set, toggle: toggle, isGuided: isGuided, isFree: isFree };
})();