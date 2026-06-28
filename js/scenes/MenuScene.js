/**
 * MenuScene — tela inicial com 3 modos de jogo + botão de ajuda.
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    SceneHelpers.createBackground(this);

    const { width, height } = this.scale;
    const centerX = width / 2;

    this.add.text(centerX, 70, '🐝', { fontSize: '56px' }).setOrigin(0.5);

    const btnW = Math.min(280, width - 80);
    const btnH = 72;
    const gap = 24;
    const startY = height * 0.32;

    const modes = [
      { label: 'Alfabeto', color: SceneHelpers.PALETTE.btnMenu1, scene: 'AlphabetScene' },
      { label: 'Números', color: SceneHelpers.PALETTE.btnMenu2, scene: 'NumbersScene' },
      { label: 'Sílabas', color: SceneHelpers.PALETTE.btnMenu3, scene: 'SyllablesScene' }
    ];

    modes.forEach((mode, i) => {
      SceneHelpers.createButton(
        this,
        centerX,
        startY + i * (btnH + gap),
        btnW,
        btnH,
        mode.label,
        mode.color,
        () => this.scene.start(mode.scene)
      );
    });

    SceneHelpers.createButton(
      this,
      width - 55,
      115,
      60,
      60,
      '?',
      0x9575cd,
      () => HelpOverlay.show()
    );

    const decoBee = new Bee(this, width - 100, height * 0.75, false);
    decoBee.setScale(0.85);
    this.tweens.add({
      targets: decoBee,
      x: width - 140,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
