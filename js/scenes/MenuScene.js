class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    var self = this;
    SceneHelpers.createBackground(this);

    var { width, height } = this.scale;
    var cx = width / 2;

    var titleY = 14;
    this.add.text(cx, titleY, '\uD83D\uDC1D', { fontSize: '26px' }).setOrigin(0.5);
    this.add.text(cx, titleY + 22, 'Abelhinha Alfabeto', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '18px', color: '#2d5986', fontStyle: 'bold'
    }).setOrigin(0.5);

    var stats = Progression.getStats();
    var overall = GameStats.getOverall();

    var statBg = this.add.graphics();
    statBg.fillStyle(0xffffff, 0.6);
    statBg.fillRoundedRect(cx - 130, titleY + 42, 260, 20, 10);

    this.add.text(cx, titleY + 52, stats.completed + ' de ' + stats.total + ' fases  \u2022  ' + overall.accuracy + '% acertos', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '14px', color: '#5c6bc0', fontStyle: 'bold'
    }).setOrigin(0.5);

    var modeY = titleY + 70;
    var isGuided = GameMode.isGuided();
    var modeLabel = isGuided ? '\uD83C\uDFAF Guiado' : '\uD83D\uDD13 Livre';

    var modeG = this.add.graphics();
    modeG.fillStyle(isGuided ? 0x66bb6a : 0x64b5f6, 1);
    modeG.fillRoundedRect(cx - 70, modeY - 12, 140, 24, 12);
    modeG.lineStyle(2, 0xffffff, 0.8);
    modeG.strokeRoundedRect(cx - 70, modeY - 12, 140, 24, 12);

    var modeText = this.add.text(cx, modeY, modeLabel, {
      fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    var modeHit = this.add.rectangle(cx, modeY, 140, 24, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    modeHit.on('pointerdown', function () {
      GameMode.toggle();
      self.scene.restart();
    });

    var groups = Progression.GROUPS;
    var cardY = modeY + 26;
    var cardW = 250;
    var cardH = 0;
    var gapX = 16;
    var gapY = 12;

    function drawCategoryCard(scene, group, x, y, w) {
      var cardG = scene.add.graphics();
      cardG.fillStyle(0xffffff, 0.85);
      cardG.fillRoundedRect(x - w / 2, y, w, 10, 14);

      var title = scene.add.text(x, y + 14, group.name, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#546e7a', fontStyle: 'bold'
      }).setOrigin(0.5);

      var cy = y + 34;
      var cardContentH = 34;

      group.levels.forEach(function (level) {
        var unlocked = Progression.isUnlocked(level.id);
        var completed = Progression.isCompleted(level.id);

        var bgColor = unlocked ? (completed ? 0x81c784 : 0x42a5f5) : 0xbdbdbd;
        var txtColor = unlocked ? '#ffffff' : '#9e9e9e';
        var alpha = unlocked ? 1 : 0.4;

        var itemG = scene.add.graphics();
        itemG.fillStyle(bgColor, alpha);
        itemG.fillRoundedRect(x - w / 2 + 10, cy, w - 20, 30, 8);
        itemG.lineStyle(2, 0xffffff, unlocked ? 0.7 : 0.2);
        itemG.strokeRoundedRect(x - w / 2 + 10, cy, w - 20, 30, 8);

        var icon = completed ? '\u2713 ' : '';
        icon += level.icon + ' ' + level.label;

        var label = scene.add.text(x, cy + 15, icon, {
          fontFamily: 'Fredoka, sans-serif', fontSize: '14px', color: txtColor, fontStyle: 'bold'
        }).setOrigin(0.5);

        if (unlocked) {
          var hitArea = scene.add.rectangle(x, cy + 15, w - 20, 30, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
          hitArea.on('pointerover', function () {
            itemG.clear();
            itemG.fillStyle(bgColor, 0.85);
            itemG.fillRoundedRect(x - w / 2 + 10, cy, w - 20, 30, 8);
            itemG.lineStyle(2, 0xffffff, 1);
            itemG.strokeRoundedRect(x - w / 2 + 10, cy, w - 20, 30, 8);
          });
          hitArea.on('pointerout', function () {
            itemG.clear();
            itemG.fillStyle(bgColor, 1);
            itemG.fillRoundedRect(x - w / 2 + 10, cy, w - 20, 30, 8);
            itemG.lineStyle(2, 0xffffff, 0.7);
            itemG.strokeRoundedRect(x - w / 2 + 10, cy, w - 20, 30, 8);
          });
          hitArea.on('pointerdown', function () {
            if (GameAudio.getContext()) GameAudio.getContext().resume();
            scene.scene.start(level.id);
          });
        }

        cy += 36;
        cardContentH += 36;
      });

      cardG.clear();
      cardG.fillStyle(0xffffff, 0.85);
      cardG.fillRoundedRect(x - w / 2, y, w, cardContentH + 10, 14);

      cardG.lineStyle(2, 0xe0e0e0, 0.6);
      cardG.strokeRoundedRect(x - w / 2, y, w, cardContentH + 10, 14);

      var shadow = scene.add.graphics();
      shadow.fillStyle(0x000000, 0.08);
      shadow.fillRoundedRect(x - w / 2 + 2, y + 2, w, cardContentH + 10, 14);

      return cardContentH + 10;
    }

    function layoutCards() {
      var totalW = groups.length * cardW + (groups.length - 1) * gapX;
      var startX = cx - totalW / 2 + cardW / 2;

      groups.forEach(function (group, idx) {
        var x = startX + idx * (cardW + gapX);
        var h = drawCategoryCard(self, group, x, cardY, cardW);
        cardH = Math.max(cardH, h);
      });
    }

    layoutCards();

    var bottomY = cardY + cardH + 14;
    var btnAreaY = Math.min(bottomY, height - 44);

    var achCount = Achievements.getUnlocked().length;
    var achTotal = Achievements.getAll().length;
    var achLabel = '\uD83C\uDFC6 ' + achCount + '/' + achTotal;

    var achBtn = SceneHelpers.createButton(this, cx - 50 - 5, btnAreaY, 100, 36, achLabel, 0xffa726, function () {
      self.showAchievements();
    });

    var helpBtn = SceneHelpers.createButton(this, cx + 50 + 5, btnAreaY, 100, 36, '? Ajuda', 0x9575cd, function () {
      HelpOverlay.show();
    });

    var resetY = btnAreaY + 44;
    if (resetY < height - 10) {
      SceneHelpers.createButton(this, cx, resetY, 140, 32, '\u21BA Reiniciar', 0xef5350, function () {
        Progression.resetAll();
        GameStats.reset();
        self.scene.restart();
      });
    }
  }

  showAchievements() {
    var self = this;
    var { width, height } = this.scale;

    var overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
      .setDepth(200).setInteractive();

    var panel = this.add.container(width / 2, height / 2).setDepth(201);

    var panelH = Math.min(440, height - 40);

    var bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-175, -panelH / 2, 350, panelH, 24);
    bg.lineStyle(4, 0xffd54f, 1);
    bg.strokeRoundedRect(-175, -panelH / 2, 350, panelH, 24);

    var shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.12);
    shadow.fillRoundedRect(-173, -panelH / 2 + 2, 350, panelH, 24);

    panel.add([shadow, bg]);

    var title = this.add.text(0, -panelH / 2 + 28, '\uD83C\uDFC6 Conquistas', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '22px', color: '#2d5986', fontStyle: 'bold'
    }).setOrigin(0.5);
    panel.add(title);

    var allAch = Achievements.getAll();
    var unlockedAch = Achievements.getUnlocked();
    var yOff = -panelH / 2 + 62;

    allAch.forEach(function (ach) {
      var isUnlocked = unlockedAch.some(function (u) { return u.id === ach.id; });
      var icon = isUnlocked ? '\u2705' : '\uD83D\uDD12';
      var achColor = isUnlocked ? '#2e7d32' : '#bdbdbd';

      var rowBg = self.add.graphics();
      rowBg.fillStyle(isUnlocked ? 0xe8f5e9 : 0xf5f5f5, 1);
      rowBg.fillRoundedRect(-150, yOff - 12, 300, 32, 8);
      panel.add(rowBg);

      var txt = self.add.text(-130, yOff, icon + ' ' + ach.icon + ' ' + ach.label, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '14px', color: achColor, fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      panel.add(txt);

      var desc = self.add.text(130, yOff, ach.desc, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '10px', color: isUnlocked ? '#388e3c' : '#e0e0e0'
      }).setOrigin(1, 0.5);
      panel.add(desc);

      yOff += 36;
    });

    var closeBtn = SceneHelpers.createButton(self, 0, panelH / 2 - 26, 140, 34, 'Fechar', 0xef5350, function () {
      overlay.destroy();
      panel.destroy();
    });
    panel.add(closeBtn);

    panel.setScale(0.7);
    self.tweens.add({ targets: panel, scale: 1, duration: 350, ease: 'Back.easeOut' });
  }
}