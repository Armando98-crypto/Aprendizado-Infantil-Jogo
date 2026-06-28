/**
 * Abelhinha controlável — forma geométrica colorida com asas animadas.
 * Suporta arrasto (mouse/touch) e teclado (setas + WASD).
 * Hit-box generosa para facilitar o uso por crianças.
 */

class Bee extends Phaser.GameObjects.Container {
  constructor(scene, x, y, interactive = true) {
    super(scene, x, y);

    this.scene = scene;
    this.hitRadius = 44;
    this.moveSpeed = 280;
    this.isDragging = false;
    this.interactive = interactive;
    this._floatTween = null;

    this._buildVisuals();

    scene.add.existing(this);

    if (interactive) {
      scene.physics.add.existing(this);
      const body = this.body;
      body.setCircle(this.hitRadius);
      body.setOffset(-this.hitRadius, -this.hitRadius);
      body.setCollideWorldBounds(true);
      body.setImmovable(true);
      body.setAllowGravity(false);

      this._setupInput();
    }

    this._setupKeyboard();
  }

  _buildVisuals() {
    const wingLeft = this.scene.add.ellipse(-18, -8, 22, 14, 0xffffff, 0.75);
    const wingRight = this.scene.add.ellipse(18, -8, 22, 14, 0xffffff, 0.75);

    const bodyShape = this.scene.add.ellipse(0, 2, 36, 44, 0xffd54f);
    const stripe1 = this.scene.add.rectangle(0, -4, 30, 6, 0x3e2723, 0.7);
    const stripe2 = this.scene.add.rectangle(0, 8, 30, 6, 0x3e2723, 0.7);

    const head = this.scene.add.circle(0, -22, 14, 0xffd54f);
    const eyeLeft = this.scene.add.circle(-5, -24, 4, 0x1a1a1a);
    const eyeRight = this.scene.add.circle(5, -24, 4, 0x1a1a1a);
    const eyeShineL = this.scene.add.circle(-4, -25, 1.5, 0xffffff);
    const eyeShineR = this.scene.add.circle(6, -25, 1.5, 0xffffff);

    const stinger = this.scene.add.triangle(0, 26, -4, 0, 4, 0, 0, 10, 0x5d4037);

    this.add([
      wingLeft, wingRight,
      bodyShape, stripe1, stripe2,
      head, eyeLeft, eyeRight, eyeShineL, eyeShineR,
      stinger
    ]);

    this.wingLeft = wingLeft;
    this.wingRight = wingRight;

    this.scene.tweens.add({
      targets: [wingLeft, wingRight],
      scaleY: { from: 1, to: 0.35 },
      duration: 90,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this._startFloatTween();
  }

  _startFloatTween() {
    if (this._floatTween) {
      this._floatTween.stop();
      this._floatTween = null;
    }
    this._floatTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  _stopFloatTween() {
    if (this._floatTween) {
      this._floatTween.stop();
      this._floatTween = null;
    }
  }

  _setupInput() {
    this.setInteractive(new Phaser.Geom.Circle(0, 0, this.hitRadius), Phaser.Geom.Circle.Contains);
    this.scene.input.setDraggable(this);

    this.on('dragstart', () => {
      this.isDragging = true;
      this.setScale(1.08);
      this._stopFloatTween();
    });

    this.on('drag', (pointer, dragX, dragY) => {
      this.setPosition(dragX, dragY);
      if (this.body) this.body.updateFromGameObject();
    });

    this.on('dragend', () => {
      this.isDragging = false;
      this.setScale(1);
      this._startFloatTween();
    });
  }

  _setupKeyboard() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  updateKeyboard(delta) {
    if (!this.interactive || this.isDragging || !this.body) return;

    const speed = (this.moveSpeed * delta) / 1000;
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (!up && !down && !left && !right) {
      if (!this._floatTween) this._startFloatTween();
    }

    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;

    if (vx !== 0 || vy !== 0) {
      if (this._floatTween) this._stopFloatTween();
      this.x += vx;
      this.y += vy;
      if (this.body) this.body.updateFromGameObject();
    }
  }

  setInputEnabled(enabled) {
    if (!this.interactive) return;

    if (enabled) {
      this.setInteractive(new Phaser.Geom.Circle(0, 0, this.hitRadius), Phaser.Geom.Circle.Contains);
      this.scene.input.setDraggable(this);
    } else {
      this.isDragging = false;
      this.setScale(1);
      this._stopFloatTween();
      this.scene.input.setDraggable(this, false);
      this.disableInteractive();
    }
  }

  playHappyBounce() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }
}
