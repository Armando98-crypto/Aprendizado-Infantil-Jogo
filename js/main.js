/**
 * Configuração principal do Phaser — regista todas as cenas e inicia o jogo.
 */

const GAME_WIDTH = 900;
const GAME_HEIGHT = 640;

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

HelpOverlay.init();
VolumeControl.init();
LanguageSelector.init();

document.addEventListener('pointerdown', () => {
  if (GameAudio.getContext()) GameAudio.getContext().resume();
  Speech.loadVoices();
  Speech.prime();
}, { once: true });
