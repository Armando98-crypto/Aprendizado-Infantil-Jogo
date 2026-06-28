/**
 * AlphabetScene — ensina as 26 letras do alfabeto (A–Z).
 *
 * Mecânica: a criança move a abelhinha (arrasto ou setas) até colidir com cada letra.
 * Ao acertar: pronuncia o nome da letra e o som fonético, feedback visual e som de acerto.
 * Progresso persistido no localStorage; indicador no topo da cena.
 */

class AlphabetScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AlphabetScene' });
  }

  create() {
    SceneHelpers.createBackground(this);
    SceneHelpers.createBackButton(this, () => this.scene.start('MenuScene'));

    const { width, height } = this.scale;
    const progressKey = Progress.KEYS.alphabet;
    const totalLetters = 26;

    this.phonetics = {
      A: 'á', B: 'bê', C: 'cê', D: 'dé', E: 'é', F: 'efe',
      G: 'gê', H: 'agá', I: 'i', J: 'jota', K: 'cá', L: 'ele',
      M: 'eme', N: 'ene', O: 'ó', P: 'pê', Q: 'quê', R: 'erre',
      S: 'esse', T: 'té', U: 'u', V: 'vê', W: 'dáblio', X: 'xis',
      Y: 'ípsilon', Z: 'zê'
    };

    this.progressUI = SceneHelpers.createProgressIndicator(this, progressKey, totalLetters);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const positions = SceneHelpers.gridPositions(this, letters.length, { cols: 6, startY: 100 });

    this.targets = letters.map((letter, i) => {
      const pos = positions[i];
      return SceneHelpers.createTarget(this, pos.x, pos.y, letter, 68);
    });

    SceneHelpers.restoreSavedProgress(this.targets, progressKey);

    this.bee = new Bee(this, width / 2, height / 2);

    SceneHelpers.setupBeeCollisions(
      this,
      this.bee,
      this.targets,
      (target) => {
        const letter = target.label;
        Speech.speakSequence([letter, this.phonetics[letter]]);
      },
      () => {
        this.celebrationShown = true;
        SceneHelpers.showCelebration(this, () => this.scene.start('MenuScene'));
      },
      {
        progressKey,
        getProgressId: (t) => t.label,
        onProgressUpdate: () => this.progressUI.update()
      }
    );

    this.celebrationShown = false;

    const firstIncomplete = this.targets.find((t) => !t.completed) || this.targets[0];
    if (localStorage.getItem('tutorial_alphabet_seen') !== 'true') {
      SceneHelpers.showDragHint(this, this.bee, firstIncomplete, 'tutorial_alphabet_seen');
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) {
      this.bee.updateKeyboard(delta);
    }
  }
}
