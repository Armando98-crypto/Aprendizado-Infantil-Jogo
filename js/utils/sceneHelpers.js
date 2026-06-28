/**
 * Helpers partilhados entre as cenas de jogo (fundo, botões, celebração).
 */

const SceneHelpers = (function () {
  const PALETTE = {
    skyTop: 0xb8e6ff,
    skyBottom: 0xe8f8ff,
    grass: 0x7ec850,
    grassDark: 0x5a9e38,
    btnBack: 0xff8a65,
    btnNav: 0x81c784,
    btnMenu1: 0xffb74d,
    btnMenu2: 0x64b5f6,
    btnMenu3: 0xce93d8,
    targetDefault: 0xffffff,
    targetDone: 0xa5d6a7,
    targetBorder: 0x4fc3f7,
    star: 0xffd54f
  };

  /** Desenha um fundo gradiente céu + relva. */
  function createBackground(scene) {
    const { width, height } = scene.scale;

    const sky = scene.add.graphics();
    sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    sky.fillRect(0, 0, width, height * 0.78);

    const grass = scene.add.graphics();
    grass.fillStyle(PALETTE.grass, 1);
    grass.fillRect(0, height * 0.78, width, height * 0.22);
    grass.fillStyle(PALETTE.grassDark, 0.35);
    grass.fillEllipse(width * 0.2, height * 0.82, 120, 40);
    grass.fillEllipse(width * 0.7, height * 0.85, 160, 50);

    return { sky, grass };
  }

  /**
   * Botão grande e colorido (mínimo 60px).
   */
  function createButton(scene, x, y, width, height, label, color, onClick) {
    const container = scene.add.container(x, y);

    const bg = scene.add.rectangle(0, 0, width, height, color, 1);
    bg.setStrokeStyle(4, 0xffffff, 0.9);
    bg.setInteractive({ useHandCursor: true });

    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: Math.min(28, height * 0.35) + 'px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    container.add([bg, text]);

    bg.on('pointerover', () => bg.setFillStyle(color, 0.85));
    bg.on('pointerout', () => bg.setFillStyle(color, 1));
    bg.on('pointerdown', () => {
      bg.setScale(0.95);
      if (GameAudio.getContext()) GameAudio.getContext().resume();
    });
    bg.on('pointerup', () => {
      bg.setScale(1);
      onClick();
    });

    return container;
  }

  /** Botão "Voltar" no canto superior esquerdo. */
  function createBackButton(scene, callback) {
    return createButton(scene, 70, 40, 100, 60, '←', PALETTE.btnBack, callback);
  }

  /**
   * Cria um alvo interativo (letra, número ou sílaba).
   * Retorna um objeto com container, hitZone e métodos de estado.
   */
  function createTarget(scene, x, y, label, size = 72) {
    const container = scene.add.container(x, y);
    const radius = size / 2;

    const circle = scene.add.circle(0, 0, radius, PALETTE.targetDefault, 1);
    circle.setStrokeStyle(4, PALETTE.targetBorder, 1);

    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: size * 0.45 + 'px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const check = scene.add.text(radius * 0.55, -radius * 0.55, '✓', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#2e7d32'
    }).setOrigin(0.5).setVisible(false);

    container.add([circle, text, check]);

    const hitZone = scene.add.circle(x, y, radius + 16, 0x000000, 0);
    scene.physics.add.existing(hitZone);
    hitZone.body.setCircle(radius + 16);
    hitZone.body.setImmovable(true);
    hitZone.body.setAllowGravity(false);

    const target = {
      container,
      circle,
      text,
      check,
      hitZone,
      label,
      completed: false,

      markComplete() {
        if (this.completed) return false;
        this.completed = true;
        this._applyDoneVisual();
        return true;
      },

      /** Restaura estado completo a partir do localStorage (sem animação). */
      restoreComplete() {
        if (this.completed) return;
        this.completed = true;
        this._applyDoneVisual();
      },

      _applyDoneVisual() {
        this.circle.setFillStyle(PALETTE.targetDone, 1);
        this.circle.setStrokeStyle(4, 0x2e7d32, 1);
        this.check.setVisible(true);
      }
    };

    return target;
  }

  /** Animação de feedback ao acertar um alvo. */
  function playHitFeedback(scene, target) {
    scene.tweens.add({
      targets: target.container,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 180,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    scene.tweens.add({
      targets: target.circle,
      alpha: { from: 1, to: 0.6 },
      duration: 100,
      yoyo: true,
      repeat: 2
    });

    spawnStars(scene, target.container.x, target.container.y);
  }

  /** Pequenas estrelas de confete no ponto de colisão. */
  function spawnStars(scene, x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const star = scene.add.text(x, y, '★', {
        fontSize: Phaser.Math.Between(16, 28) + 'px',
        color: '#ffd54f'
      }).setOrigin(0.5);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(40, 90);

      scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  /**
   * Overlay de celebração quando todos os alvos são completados.
   */
  function showCelebration(scene, onBackToMenu) {
    const { width, height } = scene.scale;

    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);
    overlay.setDepth(100);

    const panel = scene.add.container(width / 2, height / 2);
    panel.setDepth(101);

    const panelBg = scene.add.rectangle(0, 0, 340, 260, 0xffffff, 1);
    panelBg.setStrokeStyle(6, PALETTE.star, 1);

    const emoji = scene.add.text(0, -70, '🎉', { fontSize: '64px' }).setOrigin(0.5);
    const msg = scene.add.text(0, 10, 'Muito bem!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '36px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    panel.add([panelBg, emoji, msg]);

    scene.tweens.add({
      targets: panel,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    for (let i = 0; i < 12; i++) {
      spawnStars(scene, Phaser.Math.Between(80, width - 80), Phaser.Math.Between(80, height - 80), 1);
    }

    GameAudio.playCelebration();

    const btn = createButton(scene, width / 2, height / 2 + 90, 220, 64, 'Voltar ao Menu', PALETTE.btnMenu2, onBackToMenu);
    btn.setDepth(102);

    return { overlay, panel, btn };
  }

  /**
   * Configura colisão entre abelhinha e lista de alvos.
   * Chama onHit quando um alvo novo é completado.
   * Opcionalmente persiste progresso no localStorage.
   */
  function setupBeeCollisions(scene, bee, targets, onHit, onAllComplete, options = {}) {
    const { progressKey, getProgressId, onProgressUpdate } = options;

    targets.forEach((target) => {
      scene.physics.add.overlap(bee, target.hitZone, () => {
        if (target.completed) return;

        if (target.markComplete()) {
          if (progressKey && getProgressId) {
            Progress.markCompleted(progressKey, getProgressId(target));
          }
          if (onProgressUpdate) onProgressUpdate();

          playHitFeedback(scene, target);
          GameAudio.playSuccess();
          bee.playHappyBounce();
          onHit(target);

          if (targets.every((t) => t.completed)) {
            scene.time.delayedCall(800, onAllComplete);
          }
        }
      });
    });
  }

  /** Marca alvos já completados numa sessão anterior. */
  function restoreSavedProgress(targets, progressKey, getProgressId = (t) => t.label) {
    targets.forEach((target) => {
      if (Progress.isCompleted(progressKey, getProgressId(target))) {
        target.restoreComplete();
      }
    });
  }

  /**
   * Indicador de progresso no topo da cena (texto + barra).
   * Reforça visibilidade de evolução para criança/adulto.
   */
  function createProgressIndicator(scene, progressKey, total) {
    const { width } = scene.scale;
    const barWidth = Math.min(260, width - 200);
    const container = scene.add.container(width / 2, 36);
    container.setDepth(20);

    const label = scene.add.text(0, -14, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '17px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const barBg = scene.add.rectangle(0, 10, barWidth, 14, 0xffffff, 0.85);
    barBg.setStrokeStyle(2, 0x4fc3f7, 0.8);

    const barFill = scene.add.rectangle(-barWidth / 2, 10, 0, 10, 0x66bb6a, 1);
    barFill.setOrigin(0, 0.5);

    container.add([barBg, barFill, label]);

    function update() {
      const count = Progress.getCount(progressKey);
      label.setText(`${count} de ${total}`);
      const ratio = Math.min(count / total, 1);
      barFill.width = barWidth * ratio;
    }

    update();
    return { container, update };
  }

  /**
   * Dica contextual: mão fantasma simula arrastar a abelhinha até ao primeiro alvo.
   * Mostrada apenas na primeira visita (flag no localStorage).
   * Cancelável se a criança tocar/arrastar antes do fim.
   */
  function showDragHint(scene, bee, target, storageKey) {
    if (localStorage.getItem(storageKey) === 'true') {
      return { cancel() {} };
    }

    localStorage.setItem(storageKey, 'true');

    let cancelled = false;
    let handTween = null;
    let pathTween = null;

    bee.setInputEnabled(false);

    const startX = bee.x;
    const startY = bee.y;
    const endX = target.container.x;
    const endY = target.container.y;

    const hand = scene.add.text(startX + 30, startY + 20, '👆', {
      fontSize: '44px'
    }).setOrigin(0.5).setAlpha(0.85).setDepth(50);

    const trail = scene.add.graphics().setDepth(49);
    trail.lineStyle(3, 0xffffff, 0.45);
    trail.strokeCircle(startX, startY, 8);
    trail.lineBetween(startX, startY, endX, endY);
    trail.strokeCircle(endX, endY, 10);

    function finish() {
      if (cancelled) return;
      cancelled = true;
      if (handTween) handTween.stop();
      if (pathTween) pathTween.stop();
      hand.destroy();
      trail.destroy();
      scene.input.off('pointerdown', finish);
      if (bee) {
        bee.off('dragstart', finish);
        bee.setInputEnabled(true);
      }
    }

    scene.input.on('pointerdown', finish);
    bee.on('dragstart', finish);

    handTween = scene.tweens.add({
      targets: hand,
      x: endX + 30,
      y: endY + 20,
      duration: 1400,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onComplete: finish
    });

    pathTween = scene.tweens.add({
      targets: bee,
      x: endX,
      y: endY,
      duration: 1400,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        if (bee.body) bee.body.updateFromGameObject();
      }
    });

    return { cancel: finish };
  }

  /** Posições em grelha para distribuir alvos na tela. */
  function gridPositions(scene, count, options = {}) {
    const {
      startY = 110,
      marginX = 60,
      marginBottom = 100,
      cols = null
    } = options;

    const { width, height } = scene.scale;
    const columnCount = cols || Math.ceil(Math.sqrt(count * (width / height)));
    const rows = Math.ceil(count / columnCount);

    const usableW = width - marginX * 2;
    const usableH = height - startY - marginBottom;
    const cellW = usableW / columnCount;
    const cellH = usableH / rows;

    const positions = [];
    for (let i = 0; i < count; i++) {
      const col = i % columnCount;
      const row = Math.floor(i / columnCount);
      positions.push({
        x: marginX + cellW * col + cellW / 2,
        y: startY + cellH * row + cellH / 2
      });
    }
    return positions;
  }

  return {
    PALETTE,
    createBackground,
    createButton,
    createBackButton,
    createTarget,
    playHitFeedback,
    spawnStars,
    showCelebration,
    setupBeeCollisions,
    restoreSavedProgress,
    createProgressIndicator,
    showDragHint,
    gridPositions
  };
})();
