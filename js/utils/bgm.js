/**
 * Música de fundo por categoria/nível (ficheiros em Songs/).
 * Combina com TTS e bips existentes — volume mais baixo, em loop.
 */

const BgmManager = (function () {
  var VOLUME = 0.18;
  var currentAudio = null;
  var currentTrack = null;
  var pendingKey = null;

  var SCENE_TRACK = {
    MenuScene: 'Songs/Leitura.mp3',
    AlphabetScene: 'Songs/Leitura.mp3',
    WordsScene: 'Songs/Leitura.mp3',
    FrasesScene: 'Songs/Leitura.mp3',
    NumbersScene: 'Songs/Mtematica.mp3',
    MathScene: 'Songs/Mtematica.mp3',
    MultiplyScene: 'Songs/Mtematica.mp3',
    SyllablesScene: 'Songs/Escrita.mp3',
    FormWordsScene: 'Songs/Escrita.mp3',
    ReadScene: 'Songs/Escrita.mp3',
    AnimalsScene: 'Songs/Extra.mp3',
    ColorsScene: 'Songs/Extra.mp3'
  };

  function getTrackForScene(sceneKey) {
    return SCENE_TRACK[sceneKey] || null;
  }

  function stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    currentTrack = null;
  }

  function play(trackPath) {
    if (!trackPath) return;
    if (currentTrack === trackPath && currentAudio && !currentAudio.paused) return;

    stop();
    currentTrack = trackPath;
    currentAudio = new Audio(trackPath);
    currentAudio.loop = true;
    currentAudio.volume = VOLUME;

    if (!SoundSettings.isMuted()) {
      var playPromise = currentAudio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          pendingKey = trackPath;
        });
      }
    }
  }

  function playForScene(sceneKey) {
    var track = getTrackForScene(sceneKey);
    if (track) play(track);
  }

  function resumeAfterInteraction() {
    if (pendingKey) {
      play(pendingKey);
      pendingKey = null;
    } else if (currentAudio && currentAudio.paused && !SoundSettings.isMuted()) {
      currentAudio.play().catch(function () {});
    }
  }

  function onMuteChange(muted) {
    if (!currentAudio) return;
    if (muted) {
      currentAudio.pause();
    } else {
      currentAudio.play().catch(function () {});
    }
  }

  function init() {
    SoundSettings.onChange(onMuteChange);
  }

  return {
    init: init,
    playForScene: playForScene,
    stop: stop,
    resumeAfterInteraction: resumeAfterInteraction
  };
})();
