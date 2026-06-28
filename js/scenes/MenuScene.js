class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    var self = this;
    SceneHelpers.createBackground(this);

    var { width, height } = this.scale;
    var cx = width / 2;

    this.add.text(cx, 40, '🐝', { fontSize: '40px' }).setOrigin(0.5);
    this.add.text(cx, 75, 'Abelhinha Alfabeto', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      color: '#2d5986',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    var stats = Progression.getStats();
    this.add.text(cx, 100, stats.completed + ' de ' + stats.total + ' concluídos', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '15px',
      color: '#5c6bc0'
    }).setOrigin(0.5);

    var groups = Progression.GROUPS;
    var groupGap = 14;
    var levelGap = 8;
    var startY = 130;
    var btnW = 220;
    var btnH = 46;

    function drawGroup(scene, group, y) {
      var label = scene.add.text(cx, y, group.name, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '15px',
        color: '#78909c',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      var cy = y + 26;

      group.levels.forEach(function (level) {
        var unlocked = Progression.isUnlocked(level.id);
        var completed = Progression.isCompleted(level.id);

        var color = 0xb0bec5;
        if (completed) color = 0x81c784;
        else if (unlocked) color = 0x64b5f6;

        var btn = scene.add.container(cx, cy);

        var bg = scene.add.rectangle(0, 0, btnW, btnH, color, unlocked ? 1 : 0.35);
        bg.setStrokeStyle(3, 0xffffff, 0.8);
        if (unlocked) bg.setInteractive({ useHandCursor: true });

        var text = level.icon + ' ' + level.label;
        if (completed) text = '✓ ' + text;

        var txt = scene.add.text(0, 0, text, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '17px',
          color: completed ? '#1b5e20' : '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, txt]);

        if (unlocked) {
          bg.on('pointerover', function () { bg.setFillStyle(color, 0.8); });
          bg.on('pointerout', function () { bg.setFillStyle(color, 1); });
          bg.on('pointerdown', function () {
            if (GameAudio.getContext()) GameAudio.getContext().resume();
            scene.scene.start(level.id);
          });
        }

        cy += btnH + levelGap;
      });

      return cy + groupGap - levelGap;
    }

    var nextY = startY;
    groups.forEach(function (group) {
      nextY = drawGroup(this, group, nextY);
    }, this);

    var helpY = Math.min(nextY + 16, height - 40);
    var helpBtn = SceneHelpers.createButton(
      this, cx, helpY, 120, 44, '? Ajuda',
      0x9575cd,
      function () { HelpOverlay.show(); }
    );

    var resetY = helpY + 54;
    if (resetY < height - 16) {
      var resetBtn = SceneHelpers.createButton(
        this, cx, resetY, 140, 38, '↺ Reiniciar',
        0xef5350,
        function () {
          Progression.resetAll();
          self.scene.restart();
        }
      );
    }
  }
}