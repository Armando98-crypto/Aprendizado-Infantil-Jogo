class ColorsScene extends Phaser.Scene {
  constructor() { super({ key: 'ColorsScene' }); }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.colorIndex = 0;

    var lang = Speech.getCurrentLang();
    var langKey = lang.startsWith('pt') ? 'pt' : (lang === 'es' ? 'es' : 'en');
    this.colors = COLORS_DATA[langKey] || COLORS_DATA.pt;

    var { width, height } = this.scale;
    this.add.text(width / 2, 18, '🎨 Cores', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '18px', color: '#37474f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.colorDisplay = this.add.text(width / 2, 55, '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
      backgroundColor: '#000000', padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.bee = new Bee(this, 60, height / 2);
    this.targets = [];
    this.collider = null;

    var self = this;
    SceneHelpers.createBackButton(this, function () { self.scene.start('MenuScene'); });
    this.buildColor();
  }

  buildColor() {
    var self = this;
    if (this.collider) this.collider.destroy();
    this.targets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.targets = [];

    var color = this.colors[this.colorIndex];
    if (!color) {
      this.celebrationShown = true;
      Progression.markCompleted('ColorsScene');
      Achievements.checkSceneComplete('ColorsScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, function () { self.scene.start('MenuScene'); });
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    this.colorDisplay.setText(color.name.toUpperCase());
    this.colorDisplay.setStyle({ backgroundColor: color.hex });
    this.currentColorName = color.name;

    Speech.speak(color.name);

    var wrong = [];
    var allColors = this.colors;
    for (var i = 0; i < allColors.length; i++) {
      if (allColors[i].name !== color.name && wrong.length < 3) {
        wrong.push(allColors[i].name);
      }
    }
    while (wrong.length < 3) { wrong.push('???'); }

    var options = [color.name].concat(wrong);
    Phaser.Utils.Array.Shuffle(options);

    var radius = Math.min(width * 0.32, 140);
    var angleStep = (Math.PI * 2) / options.length;

    for (var i = 0; i < options.length; i++) {
      var angle = angleStep * i - Math.PI / 2;
      var ox = cx + Math.cos(angle) * radius;
      var oy = 190 + Math.sin(angle) * radius + height * 0.08;

      var bgColor = '#78909c';
      for (var j = 0; j < allColors.length; j++) {
        if (allColors[j].name === options[i]) { bgColor = allColors[j].hex; break; }
      }

      var target = this.add.text(ox, oy, options[i].toUpperCase(), {
        fontFamily: 'Fredoka, sans-serif', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: bgColor, padding: { x: 14, y: 10 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(24);
      target.body.setOffset(0, -4);
      target.val = options[i];
      target.found = false;

      (function (t) {
        t.setInteractive();
        t.on('pointerdown', function () {
          if (self.celebrationShown || t.found) return;
          self.onColorOverlap(t);
        });
      })(target);

      this.tweens.add({
        targets: target, y: oy + Phaser.Math.Between(-8, 8),
        duration: 1400 + Math.random() * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      this.targets.push(target);
    }

    this.collider = this.physics.add.overlap(this.bee, this.targets, function (bee, t) {
      if (self.celebrationShown || t.found) return;
      self.onColorOverlap(t);
    });
  }

  onColorOverlap(target) {
    target.found = true;
    if (target.val === this.currentColorName) {
      GameStats.recordHit('ColorsScene');
      GameAudio.playPop();
      target.setStyle({ backgroundColor: '#66bb6a', color: '#ffffff' });
      this.tweens.add({ targets: target, scale: 1.5, duration: 200, yoyo: true });
      this.colorDisplay.setText('✓ ' + this.currentColorName.toUpperCase());
      Speech.speak(this.currentColorName);
      setTimeout(function (self) { self.colorIndex += 1; self.buildColor(); }, 1000, this);
    } else {
      GameStats.recordMistake('ColorsScene');
      GameAudio.playHit();
      target.setStyle({ backgroundColor: '#ef5350', color: '#ffffff' });
      this.tweens.add({ targets: target, x: target.x + 8, duration: 60, yoyo: true, repeat: 3 });
      setTimeout(function (self, t) {
        var bgColor = '#78909c';
        var allColors = self.colors;
        for (var j = 0; j < allColors.length; j++) {
          if (allColors[j].name === t.val) { bgColor = allColors[j].hex; break; }
        }
        t.setStyle({ backgroundColor: bgColor, color: '#ffffff' });
        t.found = false;
      }, 500, this, target);
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) this.bee.updateKeyboard(delta);
  }
}

var COLORS_DATA = {
  pt: [
    { name: 'vermelho', hex: '#e53935' },
    { name: 'azul', hex: '#1e88e5' },
    { name: 'verde', hex: '#43a047' },
    { name: 'amarelo', hex: '#fdd835' },
    { name: 'roxo', hex: '#8e24aa' },
    { name: 'laranja', hex: '#fb8c00' },
    { name: 'rosa', hex: '#ec407a' },
    { name: 'marrom', hex: '#6d4c41' },
    { name: 'cinza', hex: '#78909c' },
    { name: 'preto', hex: '#212121' }
  ],
  en: [
    { name: 'red', hex: '#e53935' },
    { name: 'blue', hex: '#1e88e5' },
    { name: 'green', hex: '#43a047' },
    { name: 'yellow', hex: '#fdd835' },
    { name: 'purple', hex: '#8e24aa' },
    { name: 'orange', hex: '#fb8c00' },
    { name: 'pink', hex: '#ec407a' },
    { name: 'brown', hex: '#6d4c41' },
    { name: 'gray', hex: '#78909c' },
    { name: 'black', hex: '#212121' }
  ],
  es: [
    { name: 'rojo', hex: '#e53935' },
    { name: 'azul', hex: '#1e88e5' },
    { name: 'verde', hex: '#43a047' },
    { name: 'amarillo', hex: '#fdd835' },
    { name: 'morado', hex: '#8e24aa' },
    { name: 'naranja', hex: '#fb8c00' },
    { name: 'rosa', hex: '#ec407a' },
    { name: 'marrón', hex: '#6d4c41' },
    { name: 'gris', hex: '#78909c' },
    { name: 'negro', hex: '#212121' }
  ]
};