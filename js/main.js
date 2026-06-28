/**
 * Configuração principal do Phaser — regista todas as cenas e inicia o jogo.
 */

const GAME_WIDTH = 900;
const GAME_HEIGHT = 640;

(function hookSceneBgm() {
  var proto = Phaser.Scenes.SceneManager.prototype;
  var originalStart = proto.start;
  proto.start = function (key, data, data2) {
    var result = originalStart.call(this, key, data, data2);
    if (typeof BgmManager !== 'undefined') {
      BgmManager.playForScene(key);
    }
    return result;
  };
})();

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#b8e6ff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [MenuScene, AlphabetScene, WordsScene, FrasesScene, NumbersScene, MathScene, MultiplyScene, SyllablesScene, FormWordsScene, ReadScene, AnimalsScene, ColorsScene]
};

const game = new Phaser.Game(config);

BgmManager.init();
HelpOverlay.init();
VolumeControl.init();
LanguageSelector.init();

document.addEventListener('pointerdown', function () {
  if (GameAudio.getContext()) GameAudio.getContext().resume();
  Speech.loadVoices();
  Speech.prime();
  BgmManager.resumeAfterInteraction();
}, { once: true });

game.events.once('ready', function () {
  BgmManager.playForScene('MenuScene');
});
