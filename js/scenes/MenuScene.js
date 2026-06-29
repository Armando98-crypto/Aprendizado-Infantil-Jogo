/**
 * MenuScene — mapa de jornada (Journey Map) com fases ligadas por trilho.
 * Cada nó abre um nível; bloqueado/completo/desbloqueado visível de imediato.
 */

class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    var self = this;
    SceneHelpers.createBackground(this);

    var width = this.scale.width;
    var height = this.scale.height;
    var cx = width / 2;

    this.add.text(cx, 12, '\uD83D\uDC1D', { fontSize: '28px' }).setOrigin(0.5);
    this.add.text(cx, 36, 'Mapa da Abelhinha', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '20px', color: '#2d5986', fontStyle: 'bold'
    }).setOrigin(0.5);

    var stats = Progression.getStats();
    var overall = GameStats.getOverall();
    this.add.text(cx, 56, stats.completed + '/' + stats.total + ' fases  \u2022  ' + overall.accuracy + '% acertos', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#5c6bc0', fontStyle: 'bold'
    }).setOrigin(0.5);

    var isGuided = GameMode.isGuided();
    var modeLabel = isGuided ? '\uD83C\uDFAF Guiado' : '\uD83D\uDD13 Livre';
    var modeColor = isGuided ? 0x66bb6a : 0x64b5f6;

    var modeBtn = SceneHelpers.createButton(this, width - 72, 38, 118, 34, modeLabel, modeColor, function () {
      GameMode.toggle();
      self.scene.restart();
    });

    this.drawJourneyMap();

    SceneHelpers.createButton(this, 72, height - 32, 100, 34, '\uD83C\uDFC6 ' + Achievements.getUnlocked().length + '/' + Achievements.getAll().length, 0xffa726, function () {
      self.showAchievements();
    });

    SceneHelpers.createButton(this, cx, height - 32, 100, 34, '? Ajuda', 0x9575cd, function () {
      HelpOverlay.show();
    });

    SceneHelpers.createButton(this, width - 72, height - 32, 118, 34, '\u21BA Reiniciar', 0xef5350, function () {
      Progression.resetAll();
      GameStats.reset();
      self.scene.restart();
    });
  }

  drawJourneyMap() {
    var self = this;
    var width = this.scale.width;
    var height = this.scale.height;

    var GROUP_COLORS = {
      Leitura: 0x42a5f5,
      'Matemática': 0xff7043,
      Escrita: 0xab47bc,
      Extra: 0x66bb6a
    };

    var nodes = [];
    Progression.GROUPS.forEach(function (group) {
      group.levels.forEach(function (level) {
        nodes.push({
          id: level.id,
          label: level.label,
          icon: level.icon,
          group: group.name,
          color: GROUP_COLORS[group.name] || 0x90a4ae
        });
      });
    });

    var cols = 4;
    var startX = 110;
    var endX = width - 110;
    var stepX = (endX - startX) / (cols - 1);
    var startY = 108;
    var stepY = 80;

    var positions = [];
    for (var i = 0; i < nodes.length; i++) {
      var row = Math.floor(i / cols);
      var col = i % cols;
      if (row % 2 === 1) col = cols - 1 - col;
      positions.push({
        x: startX + col * stepX,
        y: startY + row * stepY
      });
    }

    var pathG = this.add.graphics().setDepth(2);
    pathG.lineStyle(6, 0xffffff, 0.55);
    for (var p = 0; p < positions.length - 1; p++) {
      pathG.beginPath();
      pathG.moveTo(positions[p].x, positions[p].y);
      pathG.lineTo(positions[p + 1].x, positions[p + 1].y);
      pathG.strokePath();
    }
    pathG.lineStyle(3, 0xffd54f, 0.7);
    for (var q = 0; q < positions.length - 1; q++) {
      pathG.beginPath();
      pathG.moveTo(positions[q].x, positions[q].y);
      pathG.lineTo(positions[q + 1].x, positions[q + 1].y);
      pathG.strokePath();
    }

    var nextIdx = -1;
    for (var n = 0; n < nodes.length; n++) {
      if (Progression.isUnlocked(nodes[n].id) && !Progression.isCompleted(nodes[n].id)) {
        nextIdx = n;
        break;
      }
    }

    nodes.forEach(function (node, idx) {
      var pos = positions[idx];
      var unlocked = Progression.isUnlocked(node.id);
      var completed = Progression.isCompleted(node.id);
      var isNext = idx === nextIdx;

      var radius = 34;
      var nodeG = self.add.graphics().setDepth(5);
      var fillColor = completed ? 0x81c784 : (unlocked ? node.color : 0xbdbdbd);
      var alpha = unlocked ? 1 : 0.55;

      nodeG.fillStyle(0x000000, 0.12);
      nodeG.fillCircle(pos.x + 2, pos.y + 3, radius + 2);
      nodeG.fillStyle(fillColor, alpha);
      nodeG.fillCircle(pos.x, pos.y, radius);
      nodeG.lineStyle(3, 0xffffff, unlocked ? 0.9 : 0.35);
      nodeG.strokeCircle(pos.x, pos.y, radius);

      if (completed) {
        var star = self.add.text(pos.x + radius * 0.55, pos.y - radius * 0.55, '\u2B50', {
          fontSize: '16px'
        }).setOrigin(0.5).setDepth(8);
      }

      if (!unlocked) {
        self.add.text(pos.x, pos.y, '\uD83D\uDD12', { fontSize: '22px' }).setOrigin(0.5).setDepth(7);
      } else {
        self.add.text(pos.x, pos.y - 2, node.icon, { fontSize: '26px' }).setOrigin(0.5).setDepth(7);
      }

      self.add.text(pos.x, pos.y + radius + 12, node.label, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '11px',
        color: unlocked ? '#37474f' : '#9e9e9e',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 80 }
      }).setOrigin(0.5, 0).setDepth(6);

      if (isNext && unlocked) {
        var pulse = self.add.circle(pos.x, pos.y, radius + 8, node.color, 0.2).setDepth(4);
        self.tweens.add({
          targets: pulse,
          scale: 1.25,
          alpha: 0,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      if (unlocked) {
        var hit = self.add.circle(pos.x, pos.y, radius + 12, 0x000000, 0)
          .setInteractive({ useHandCursor: true }).setDepth(10);
        hit.on('pointerdown', function () {
          if (GameAudio.getContext()) GameAudio.getContext().resume();
          BgmManager.resumeAfterInteraction();
          self.scene.start(node.id);
        });
      }
    });

    if (nextIdx >= 0) {
      var beePos = positions[nextIdx];
      var mapBee = new Bee(this, beePos.x - 52, beePos.y - 8, false);
      mapBee.setScale(0.55).setDepth(9);
      this.tweens.add({
        targets: mapBee,
        y: beePos.y - 14,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else if (statsCompletedAll()) {
      var lastPos = positions[positions.length - 1];
      this.add.text(lastPos.x, lastPos.y - 58, '\uD83C\uDF89', { fontSize: '32px' }).setOrigin(0.5).setDepth(9);
    }

    function statsCompletedAll() {
      return Progression.getStats().completed >= Progression.getStats().total;
    }
  }

  showAchievements() {
    var self = this;
    var width = this.scale.width;
    var height = this.scale.height;

    var overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55)
      .setDepth(200).setInteractive();

    var panel = this.add.container(width / 2, height / 2).setDepth(201);
    var panelH = Math.min(440, height - 40);

    var bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-175, -panelH / 2, 350, panelH, 24);
    bg.lineStyle(4, 0xffd54f, 1);
    bg.strokeRoundedRect(-175, -panelH / 2, 350, panelH, 24);
    panel.add(bg);

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

      panel.add(self.add.text(-130, yOff, icon + ' ' + ach.icon + ' ' + ach.label, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '14px', color: achColor, fontStyle: 'bold'
      }).setOrigin(0, 0.5));

      panel.add(self.add.text(130, yOff, ach.desc, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '10px', color: isUnlocked ? '#388e3c' : '#e0e0e0'
      }).setOrigin(1, 0.5));

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
