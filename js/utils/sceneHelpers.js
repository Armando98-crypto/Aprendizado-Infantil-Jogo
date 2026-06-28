const SceneHelpers = (function () {
  var PALETTE = {
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

  function createBackground(scene) {
    var { width, height } = scene.scale;

    var sky = scene.add.graphics();
    sky.fillGradientStyle(PALETTE.skyTop, PALETTE.skyTop, PALETTE.skyBottom, PALETTE.skyBottom, 1);
    sky.fillRect(0, 0, width, height * 0.78);

    var grass = scene.add.graphics();
    grass.fillStyle(PALETTE.grass, 1);
    grass.fillRect(0, height * 0.78, width, height * 0.22);

    grass.fillStyle(PALETTE.grassDark, 0.3);
    grass.fillEllipse(width * 0.15, height * 0.82, 100, 35);
    grass.fillEllipse(width * 0.5, height * 0.88, 140, 45);
    grass.fillEllipse(width * 0.82, height * 0.84, 110, 38);

    addClouds(scene, width, height);

    return { sky, grass };
  }

  function addClouds(scene, w, h) {
    var g = scene.add.graphics().setDepth(1);
    g.fillStyle(0xffffff, 0.5);
    var cloudPositions = [
      [w * 0.12, h * 0.08, 60, 25],
      [w * 0.35, h * 0.14, 80, 30],
      [w * 0.65, h * 0.06, 70, 28],
      [w * 0.88, h * 0.12, 55, 22],
      [w * 0.5, h * 0.22, 90, 32]
    ];
    cloudPositions.forEach(function (pos) {
      var cx = pos[0], cy = pos[1], rw = pos[2], rh = pos[3];
      g.fillEllipse(cx, cy, rw, rh);
      g.fillEllipse(cx - rw * 0.3, cy + 4, rw * 0.6, rh * 0.7);
      g.fillEllipse(cx + rw * 0.3, cy + 3, rw * 0.55, rh * 0.65);
    });
  }

  function drawRoundedRect(g, x, y, w, h, r, color, alpha) {
    g.fillStyle(color, alpha || 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, r || 14);
  }

  function createButton(scene, x, y, w, h, label, color, onClick) {
    var container = scene.add.container(x, y).setDepth(10);

    var shadowG = scene.add.graphics();
    shadowG.fillStyle(0x000000, 0.18);
    shadowG.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w, h, 14);
    container.add(shadowG);

    var bgG = scene.add.graphics();
    bgG.fillStyle(color, 1);
    bgG.fillRoundedRect(-w / 2, -h / 2, w, h, 14);

    var lighter = Phaser.Display.Color.ValueToColor(color);
    lighter.lighten(25);
    bgG.fillStyle(lighter.color, 0.4);
    bgG.fillRoundedRect(-w / 2, -h / 2, w, h / 2, { tl: 14, tr: 14, bl: 0, br: 0 });

    bgG.lineStyle(3, 0xffffff, 0.7);
    bgG.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    container.add(bgG);

    var text = scene.add.text(0, 0, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: Math.min(26, h * 0.38) + 'px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    container.add(text);

    container.setSize(w + 10, h + 10);
    container.setInteractive(new Phaser.Geom.Rectangle(-(w + 10) / 2, -(h + 10) / 2, w + 10, h + 10), Phaser.Geom.Rectangle.Contains);
    if (scene.input) scene.input.setDraggable(container, false);

    container.on('pointerover', function () {
      scene.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120, ease: 'Back.easeOut' });
    });
    container.on('pointerout', function () {
      scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120, ease: 'Sine.easeOut' });
    });
    container.on('pointerdown', function () {
      scene.tweens.add({ targets: container, scaleX: 0.93, scaleY: 0.93, duration: 80, ease: 'Sine.easeIn' });
      if (GameAudio.getContext()) GameAudio.getContext().resume();
    });
    container.on('pointerup', function () {
      scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120, ease: 'Back.easeOut' });
      if (onClick) onClick();
    });

    return container;
  }

  function createBackButton(scene, callback) {
    return createButton(scene, 70, 38, 90, 52, '← Voltar', PALETTE.btnBack, callback);
  }

  function createTarget(scene, x, y, label, size) {
    if (size === undefined) size = 72;
    var radius = size / 2;
    var container = scene.add.container(x, y);

    var shadowG = scene.add.graphics();
    shadowG.fillStyle(0x000000, 0.12);
    shadowG.fillCircle(3, 3, radius + 2);
    container.add(shadowG);

    var circle = scene.add.circle(0, 0, radius, PALETTE.targetDefault, 1);
    circle.setStrokeStyle(4, PALETTE.targetBorder, 1);

    var text = scene.add.text(0, -1, label, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: size * 0.42 + 'px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    var check = scene.add.text(radius * 0.5, -radius * 0.5, '\u2713', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: '#2e7d32',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    container.add([shadowG, circle, text, check]);

    var hitZone = scene.add.circle(x, y, radius + 16, 0x000000, 0);
    scene.physics.add.existing(hitZone);
    hitZone.body.setCircle(radius + 16);
    hitZone.body.setImmovable(true);
    hitZone.body.setAllowGravity(false);

    var target = {
      container: container,
      circle: circle,
      text: text,
      check: check,
      hitZone: hitZone,
      label: label,
      completed: false,

      markComplete: function () {
        if (this.completed) return false;
        this.completed = true;
        this._applyDoneVisual();
        return true;
      },

      restoreComplete: function () {
        if (this.completed) return;
        this.completed = true;
        this._applyDoneVisual();
      },

      _applyDoneVisual: function () {
        this.circle.setFillStyle(PALETTE.targetDone, 1);
        this.circle.setStrokeStyle(4, 0x2e7d32, 1);
        this.check.setVisible(true);
      }
    };

    return target;
  }

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

  function spawnStars(scene, x, y, count) {
    if (count === undefined) count = 6;
    for (var i = 0; i < count; i++) {
      var star = scene.add.text(x, y, '\u2605', {
        fontSize: Phaser.Math.Between(16, 28) + 'px',
        color: '#ffd54f'
      }).setOrigin(0.5);

      var angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      var dist = Phaser.Math.Between(40, 90);

      scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 600,
        ease: 'Power2',
        onComplete: function () { star.destroy(); }
      });
    }
  }

  function showCelebration(scene, onBackToMenu) {
    var { width, height } = scene.scale;

    var overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
    overlay.setDepth(100).setInteractive();

    var panel = scene.add.container(width / 2, height / 2).setDepth(101);

    var panelG = scene.add.graphics();
    panelG.fillStyle(0xffffff, 1);
    panelG.fillRoundedRect(-175, -140, 350, 280, 24);
    panelG.lineStyle(5, 0xffd54f, 1);
    panelG.strokeRoundedRect(-175, -140, 350, 280, 24);

    var shadowG = scene.add.graphics();
    shadowG.fillStyle(0x000000, 0.15);
    shadowG.fillRoundedRect(-172, -137, 350, 280, 24);
    panel.add([shadowG, panelG]);

    var confetti = ['\uD83C\uDF89', '\u2B50', '\uD83C\uDF1F', '\u2728', '\uD83D\uDCAB'];
    for (var i = 0; i < 8; i++) {
      var em = scene.add.text(
        Phaser.Math.Between(-120, 120),
        Phaser.Math.Between(-110, -60),
        confetti[i % confetti.length],
        { fontSize: Phaser.Math.Between(20, 32) + 'px' }
      ).setOrigin(0.5);
      panel.add(em);
    }

    var msg = scene.add.text(0, 10, 'Muito Bem!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '34px',
      color: '#2d5986',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    panel.add(msg);

    var sub = scene.add.text(0, 42, 'Completaste esta fase!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#78909c'
    }).setOrigin(0.5);
    panel.add(sub);

    panel.setScale(0.3);
    scene.tweens.add({
      targets: panel,
      scale: 1,
      duration: 550,
      ease: 'Back.easeOut'
    });

    for (var i = 0; i < 14; i++) {
      spawnStars(scene, Phaser.Math.Between(60, width - 60), Phaser.Math.Between(60, height - 60), 1);
    }

    GameAudio.playCelebration();

    var btn = createButton(scene, width / 2, height / 2 + 100, 210, 58, 'Voltar ao Menu', PALETTE.btnMenu2, function () {
      if (onBackToMenu) onBackToMenu();
    });
    btn.setDepth(102);

    return { overlay: overlay, panel: panel, btn: btn };
  }

  var _allColliders = [];

  function setupBeeCollisions(scene, bee, targets, onHit, onAllComplete, options) {
    destroyColliders();
    if (options === undefined) options = {};
    var { progressKey, getProgressId, onProgressUpdate } = options;

    targets.forEach(function (target) {
      var collider = scene.physics.add.overlap(bee, target.hitZone, function () {
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

          if (targets.every(function (t) { return t.completed; })) {
            scene.time.delayedCall(800, onAllComplete);
          }
        }
      });
      _allColliders.push(collider);
    });
  }

  function destroyColliders() {
    _allColliders.forEach(function (c) { if (c && c.destroy) c.destroy(); });
    _allColliders = [];
  }

  function restoreSavedProgress(targets, progressKey, getProgressId) {
    if (getProgressId === undefined) getProgressId = function (t) { return t.label; };
    targets.forEach(function (target) {
      if (Progress.isCompleted(progressKey, getProgressId(target))) {
        target.restoreComplete();
      }
    });
  }

  function createProgressIndicator(scene, progressKey, total) {
    var { width } = scene.scale;
    var barWidth = Math.min(260, width - 200);
    var container = scene.add.container(width / 2, 36);
    container.setDepth(20);

    var label = scene.add.text(0, -16, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '16px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    var barBg = scene.add.graphics();
    barBg.fillStyle(0xffffff, 0.8);
    barBg.fillRoundedRect(-barWidth / 2, 0, barWidth, 16, 8);
    barBg.lineStyle(2, 0x4fc3f7, 0.7);
    barBg.strokeRoundedRect(-barWidth / 2, 0, barWidth, 16, 8);

    var barFill = scene.add.graphics();

    container.add([barBg, barFill, label]);

    function update() {
      var count = Progress.getCount(progressKey);
      label.setText(count + ' de ' + total);
      var ratio = Math.min(count / total, 1);
      barFill.clear();
      barFill.fillStyle(0x66bb6a, 1);
      barFill.fillRoundedRect(-barWidth / 2, 1, barWidth * ratio, 14, 7);
    }

    update();
    return { container: container, update: update };
  }

  function showDragHint(scene, bee, target, storageKey) {
    if (localStorage.getItem(storageKey) === 'true') {
      return { cancel: function () {} };
    }

    localStorage.setItem(storageKey, 'true');

    var cancelled = false;
    var handTween = null;
    var pathTween = null;

    bee.setInputEnabled(false);

    var startX = bee.x;
    var startY = bee.y;
    var endX = target.hitZone.x;
    var endY = target.hitZone.y;

    var hand = scene.add.text(startX + 30, startY + 20, '\uD83D\uDC46', {
      fontSize: '44px'
    }).setOrigin(0.5).setAlpha(0.85).setDepth(50);

    var trail = scene.add.graphics().setDepth(49);
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
      onUpdate: function () {
        if (bee.body) bee.body.updateFromGameObject();
      }
    });

    return { cancel: finish };
  }

  function gridPositions(scene, count, options) {
    if (options === undefined) options = {};
    var { startY, marginX, marginBottom, cols } = options;
    if (startY === undefined) startY = 110;
    if (marginX === undefined) marginX = 60;
    if (marginBottom === undefined) marginBottom = 100;
    if (cols === undefined) cols = null;

    var { width, height } = scene.scale;
    var columnCount = cols || Math.ceil(Math.sqrt(count * (width / height)));
    var rows = Math.ceil(count / columnCount);

    var usableW = width - marginX * 2;
    var usableH = height - startY - marginBottom;
    var cellW = usableW / columnCount;
    var cellH = usableH / rows;

    var positions = [];
    for (var i = 0; i < count; i++) {
      var col = i % columnCount;
      var row = Math.floor(i / columnCount);
      positions.push({
        x: marginX + cellW * col + cellW / 2,
        y: startY + cellH * row + cellH / 2
      });
    }
    return positions;
  }

  return {
    PALETTE: PALETTE,
    createBackground: createBackground,
    createButton: createButton,
    createBackButton: createBackButton,
    createTarget: createTarget,
    playHitFeedback: playHitFeedback,
    spawnStars: spawnStars,
    showCelebration: showCelebration,
    setupBeeCollisions: setupBeeCollisions,
    destroyColliders: destroyColliders,
    restoreSavedProgress: restoreSavedProgress,
    createProgressIndicator: createProgressIndicator,
    showDragHint: showDragHint,
    gridPositions: gridPositions
  };
})();