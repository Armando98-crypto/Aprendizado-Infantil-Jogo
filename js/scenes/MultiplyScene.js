class MultiplyScene extends Phaser.Scene {
  constructor() { super({ key: 'MultiplyScene' }); }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.questionIndex = 0;
    this.questions = this.generateQuestions();

    var { width } = this.scale;
    this.add.text(width / 2, 18, '✖️ Multiplicar', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '18px', color: '#37474f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.questionText = this.add.text(width / 2, 48, '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '26px', color: '#e65100', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.bee = new Bee(this, 60, this.scale.height / 2);
    this.targets = [];
    this.collider = null;

    SceneHelpers.createBackButton(this, function () { self.scene.start('MenuScene'); });
    var self = this;
    this.buildQuestion();
  }

  generateQuestions() {
    var qs = [];
    for (var i = 0; i < 10; i++) {
      var a = Phaser.Math.Between(1, 5);
      var b = Phaser.Math.Between(1, 5);
      qs.push({ a: a, b: b, answer: a * b });
    }
    return qs;
  }

  buildQuestion() {
    var self = this;
    if (this.collider) this.collider.destroy();
    this.targets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.targets = [];

    var q = this.questions[this.questionIndex];
    if (!q) {
      this.celebrationShown = true;
      Progression.markCompleted('MultiplyScene');
      Achievements.checkSceneComplete('MultiplyScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, function () { self.scene.start('MenuScene'); });
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    this.questionText.setText(q.a + ' × ' + q.b + ' = ?');
    this.currentAnswer = q.answer;

    var wrong = [];
    while (wrong.length < 3) {
      var w = Phaser.Math.Between(1, 30);
      if (w !== q.answer && wrong.indexOf(w) < 0) wrong.push(w);
    }
    var options = [q.answer].concat(wrong);
    Phaser.Utils.Array.Shuffle(options);

    var radius = Math.min(width * 0.3, 130);
    var angleStep = (Math.PI * 2) / options.length;

    for (var i = 0; i < options.length; i++) {
      var angle = angleStep * i - Math.PI / 2;
      var ox = cx + Math.cos(angle) * radius;
      var oy = 150 + Math.sin(angle) * radius + height * 0.08;

      var target = this.add.text(ox, oy, String(options[i]), {
        fontFamily: 'Fredoka, sans-serif', fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#e65100', padding: { x: 18, y: 10 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(22);
      target.body.setOffset(0, -2);
      target.val = options[i];
      target.found = false;

      this.tweens.add({
        targets: target, y: oy + Phaser.Math.Between(-8, 8),
        duration: 1500 + Math.random() * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      this.targets.push(target);
    }

    var lang = Speech.getCurrentLang();
    var times = lang === 'pt-BR' || lang === 'pt-PT' ? 'vezes' : (lang === 'es' ? 'por' : 'times');
    Speech.speakSequence([Speech.numberToWords(q.a), times, Speech.numberToWords(q.b)]);

    var self = this;
    this.collider = this.physics.add.overlap(this.bee.sprite, this.targets, function (bee, opt) {
      if (self.celebrationShown || opt.found) return;
      self.onOptionOverlap(opt);
    });
  }

  onOptionOverlap(target) {
    target.found = true;
    if (target.val === this.currentAnswer) {
      GameAudio.playPop();
      target.setStyle({ backgroundColor: '#66bb6a', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.6, duration: 200, yoyo: true });
      this.questionText.setText(this.currentAnswer + ' ✓').setColor('#2e7d32');
      Speech.speak(Speech.numberToWords(this.currentAnswer));
      setTimeout(function (self) { self.questionIndex += 1; self.buildQuestion(); }, 1000, this);
    } else {
      GameAudio.playHit();
      target.setStyle({ backgroundColor: '#ef5350', color: '#ffffff' });
      this.tweens.add({ targets: target, x: target.x + 8, duration: 60, yoyo: true, repeat: 3 });
      setTimeout(function (self, t) { t.setStyle({ backgroundColor: '#e65100', color: '#ffffff' }); t.found = false; }, 500, this, target);
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) this.bee.updateKeyboard(delta);
  }
}