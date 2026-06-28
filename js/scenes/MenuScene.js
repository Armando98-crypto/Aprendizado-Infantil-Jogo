class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    var self = this;
    SceneHelpers.createBackground(this);

    var { width, height } = this.scale;
    var cx = width / 2;

    this.add.text(cx, 26, '🐝', { fontSize: '30px' }).setOrigin(0.5);
    this.add.text(cx, 50, 'Abelhinha Alfabeto', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '20px', color: '#2d5986', fontStyle: 'bold'
    }).setOrigin(0.5);

    var stats = Progression.getStats();
    var overall = GameStats.getOverall();

    this.add.text(cx, 72, stats.completed + ' de ' + stats.total + ' fases  |  ' + overall.accuracy + '% acertos', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#5c6bc0'
    }).setOrigin(0.5);

    var isGuided = GameMode.isGuided();
    var modeLabel = isGuided ? '🎯 Guiado' : '🔓 Livre';
    var modeBtn = SceneHelpers.createButton(this, cx, 96, 120, 30, modeLabel, isGuided ? 0x66bb6a : 0x64b5f6, function () {
      GameMode.toggle();
      self.scene.restart();
    });

    var groups = Progression.GROUPS;
    var startY = 126;
    var btnW = 210;
    var btnH = 36;
    var groupGap = 10;
    var levelGap = 6;

    function drawGroup(scene, group, y) {
      var label = scene.add.text(cx, y, group.name, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#78909c', fontStyle: 'bold'
      }).setOrigin(0.5);

      var cy = y + 20;

      group.levels.forEach(function (level) {
        var unlocked = Progression.isUnlocked(level.id);
        var completed = Progression.isCompleted(level.id);

        var color = 0xb0bec5;
        if (completed) color = 0x81c784;
        else if (unlocked) color = 0x64b5f6;

        var btn = scene.add.container(cx, cy);
        var bg = scene.add.rectangle(0, 0, btnW, btnH, color, unlocked ? 1 : 0.3);
        bg.setStrokeStyle(2, 0xffffff, 0.7);
        if (unlocked) bg.setInteractive({ useHandCursor: true });

        var txt = completed ? '✓ ' : '';
        txt += level.icon + ' ' + level.label;

        var txtObj = scene.add.text(0, 0, txt, {
          fontFamily: 'Fredoka, sans-serif', fontSize: '14px',
          color: completed ? '#1b5e20' : '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, txtObj]);

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

    var bottomY = Math.min(nextY + 8, height - 50);

    var rowY = bottomY;
    var btnW2 = 80;

    var achBtn = SceneHelpers.createButton(this, cx - btnW2 / 2 - 5, rowY, btnW2, 30, '🏆', 0xffa726, function () {
      self.showAchievements();
    });

    var helpBtn = SceneHelpers.createButton(this, cx + btnW2 / 2 + 5, rowY, btnW2, 30, '?', 0x9575cd, function () {
      HelpOverlay.show();
    });

    var resetY = rowY + 36;
    if (resetY < height - 12) {
      SceneHelpers.createButton(this, cx, resetY, 130, 28, '↺ Reiniciar', 0xef5350, function () {
        Progression.resetAll();
        GameStats.reset();
        self.scene.restart();
      });
    }
  }

  showAchievements() {
    var self = this;
    var { width, height } = this.scale;

    var overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setDepth(200).setInteractive();
    var panel = this.add.container(width / 2, height / 2).setDepth(201);

    var bg = this.add.rectangle(0, 0, 340, Math.min(420, height - 40), 0xffffff, 1);
    bg.setStrokeStyle(4, 0xffd54f, 1);

    var title = this.add.text(0, -bg.height / 2 + 30, '🏆 Conquistas', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '22px', color: '#2d5986', fontStyle: 'bold'
    }).setOrigin(0.5);

    panel.add([bg, title]);

    var allAch = Achievements.getAll();
    var unlocked = Achievements.getUnlocked();
    var yOff = -bg.height / 2 + 70;

    allAch.forEach(function (ach) {
      var isUnlocked = unlocked.some(function (u) { return u.id === ach.id; });
      var achText = (isUnlocked ? '✅ ' : '🔒 ') + ach.icon + ' ' + ach.label;
      var achColor = isUnlocked ? '#1b5e20' : '#9e9e9e';

      var txt = self.add.text(0, yOff, achText, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '15px', color: achColor, fontStyle: 'bold'
      }).setOrigin(0.5);

      var desc = self.add.text(0, yOff + 16, ach.desc, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '11px', color: isUnlocked ? '#388e3c' : '#bdbdbd'
      }).setOrigin(0.5);

      panel.add([txt, desc]);
      yOff += 38;
    });

    var closeBtn = SceneHelpers.createButton(self, 0, bg.height / 2 - 30, 150, 36, 'Fechar', 0xef5350, function () {
      overlay.destroy();
      panel.destroy();
    });
    panel.add([closeBtn]);

    panel.setScale(0.8);
    self.tweens.add({ targets: panel, scale: 1, duration: 300, ease: 'Back.easeOut' });
  }
}