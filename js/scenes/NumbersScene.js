/**
 * NumbersScene — ensina números de 0 a 100 em páginas.
 * Progresso global persistido; indicador mostra avanço total (ex: 45 de 101).
 */

class NumbersScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NumbersScene' });
  }

  create() {
    this.currentPage = 0;
    this.pages = [
      { start: 0, end: 20 },
      { start: 21, end: 40 },
      { start: 41, end: 60 },
      { start: 61, end: 80 },
      { start: 81, end: 100 }
    ];

    this.progressKey = Progress.KEYS.numbers;
    this.totalNumbers = 101;
    this.completedPages = new Set();
    this.celebrationShown = false;
    this.tutorialShown = false;

    SceneHelpers.createBackground(this);
    SceneHelpers.createBackButton(this, () => this.scene.start('MenuScene'));

    this.progressUI = SceneHelpers.createProgressIndicator(this, this.progressKey, this.totalNumbers);

    this.buildPage();
  }

  buildPage() {
    if (this.pageObjects) {
      this.pageObjects.forEach((obj) => obj.destroy());
    }
    this.pageObjects = [];

    const { width } = this.scale;
    const page = this.pages[this.currentPage];
    const numbers = [];
    for (let n = page.start; n <= page.end; n++) numbers.push(n);

    const positions = SceneHelpers.gridPositions(this, numbers.length, {
      cols: page.end - page.start <= 20 ? 7 : 5,
      startY: 105,
      marginBottom: 120
    });

    this.targets = numbers.map((num, i) => {
      const pos = positions[i];
      const target = SceneHelpers.createTarget(this, pos.x, pos.y, String(num), 64);
      this.pageObjects.push(target.container, target.hitZone);
      return target;
    });

    SceneHelpers.restoreSavedProgress(this.targets, this.progressKey, (t) => t.label);
    this.progressUI.update();

    if (this.bee) this.bee.destroy();
    this.bee = new Bee(this, width / 2, this.scale.height / 2);
    this.pageObjects.push(this.bee);

    SceneHelpers.setupBeeCollisions(
      this,
      this.bee,
      this.targets,
      (target) => {
        Speech.speak(Speech.numberToWords(parseInt(target.label, 10)));
      },
      () => this.onPageComplete(),
      {
        progressKey: this.progressKey,
        getProgressId: (t) => t.label,
        onProgressUpdate: () => this.progressUI.update(),
        sceneKey: 'NumbersScene'
      }
    );

    this.createPageNav();

    if (!this.tutorialShown) {
      this.tutorialShown = true;
      const firstIncomplete = this.targets.find((t) => !t.completed) || this.targets[0];
      if (localStorage.getItem('tutorial_numbers_seen') !== 'true') {
        SceneHelpers.showDragHint(this, this.bee, firstIncomplete, 'tutorial_numbers_seen');
      }
    }
  }

  createPageNav() {
    const { width, height } = this.scale;
    const page = this.pages[this.currentPage];

    if (this.navContainer) this.navContainer.destroy();

    this.navContainer = this.add.container(0, 0);

    const label = this.add.text(width / 2, height - 45, `${page.start} – ${page.end}`, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.navContainer.add(label);
    this.pageObjects.push(this.navContainer);

    if (this.currentPage > 0) {
      const prevBtn = SceneHelpers.createButton(
        this, 55, height - 45, 70, 60, '‹',
        SceneHelpers.PALETTE.btnNav,
        () => {
          this.currentPage -= 1;
          this.celebrationShown = false;
          this.buildPage();
        }
      );
      this.pageObjects.push(prevBtn);
    }

    if (this.currentPage < this.pages.length - 1) {
      const nextBtn = SceneHelpers.createButton(
        this, width - 55, height - 45, 70, 60, '›',
        SceneHelpers.PALETTE.btnNav,
        () => {
          this.currentPage += 1;
          this.celebrationShown = false;
          this.buildPage();
        }
      );
      this.pageObjects.push(nextBtn);
    }

    const dotY = height - 85;
    const total = this.pages.length;
    const spacing = 22;
    const startX = width / 2 - ((total - 1) * spacing) / 2;

    for (let i = 0; i < total; i++) {
      const dot = this.add.circle(startX + i * spacing, dotY, 6, i === this.currentPage ? 0x4fc3f7 : 0xb0bec5);
      this.navContainer.add(dot);
    }
  }

  onPageComplete() {
    this.celebrationShown = true;
    this.completedPages.add(this.currentPage);

    const isLastPage = this.currentPage === this.pages.length - 1;

    if (isLastPage) {
      Progression.markCompleted('NumbersScene');
      Achievements.checkSceneComplete('NumbersScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, () => this.scene.start('MenuScene'));
      return;
    }

    const { width, height } = this.scale;
    const msg = this.add.text(width / 2, height / 2 - 40, '⭐', { fontSize: '48px' }).setOrigin(0.5);
    GameAudio.playCelebration();

    this.tweens.add({
      targets: msg,
      scale: 1.5,
      alpha: 0,
      duration: 900,
      onComplete: () => {
        msg.destroy();
        this.currentPage += 1;
        this.celebrationShown = false;
        this.buildPage();
      }
    });
  }

  update(_time, delta) {
    if (!this.celebrationShown) {
      this.bee.updateKeyboard(delta);
    }
  }
}
