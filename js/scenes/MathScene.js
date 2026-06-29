class MathScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MathScene' });
  }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.questionIndex = 0;
    this.questions = this.generateQuestions();

    var { width } = this.scale;
    this.add.text(width / 2, 18, '➕ Vamos Somar!', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#37474f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.questionText = this.add.text(width / 2, 48, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '26px',
      color: '#e65100',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.bee = new Bee(this, 60, this.scale.height / 2);

    this.optionTargets = [];
    this.collider = null;

    SceneHelpers.createBackButton(this, () => this.scene.start('MenuScene'));

    this.buildQuestion();
  }

  generateQuestions() {
    var qs = [];
    for (var i = 0; i < 10; i++) {
      var a = Phaser.Math.Between(1, 5);
      var b = Phaser.Math.Between(0, 5);
      var answer = a + b;
      qs.push({ a: a, b: b, answer: answer });
    }
    return qs;
  }

  buildQuestion() {
    var self = this;
    if (this.collider) this.collider.destroy();
    this.optionTargets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.optionTargets = [];

    var q = this.questions[this.questionIndex];
    if (!q) {
      this.celebrationShown = true;
      Progression.markCompleted('MathScene');
      Achievements.checkSceneComplete('MathScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, () => this.scene.start('MenuScene'));
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    this.questionText.setText(q.a + ' + ' + q.b + ' = ?');
    this.currentAnswer = q.answer;

    var lang = Speech.getCurrentLang();
    var plus = '+';
    if (lang.startsWith('pt')) plus = 'mais';
    else if (lang === 'es') plus = 'más';
    else plus = 'plus';
    Speech.speakSequence([Speech.numberToWords(q.a), plus, Speech.numberToWords(q.b)]);

    var wrongAnswers = [];
    while (wrongAnswers.length < 3) {
      var w = Phaser.Math.Between(0, 12);
      if (w !== q.answer && wrongAnswers.indexOf(w) < 0) {
        wrongAnswers.push(w);
      }
    }

    var options = [q.answer].concat(wrongAnswers);
    Phaser.Utils.Array.Shuffle(options);

    var radius = Math.min(width * 0.32, 140);
    var angleStep = (Math.PI * 2) / options.length;

    for (var i = 0; i < options.length; i++) {
      var angle = angleStep * i - Math.PI / 2;
      var ox = cx + Math.cos(angle) * radius;
      var oy = 220 + Math.sin(angle) * radius + height * 0.08;

      var target = this.add.text(ox, oy, String(options[i]), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#7e57c2',
        padding: { x: 18, y: 10 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(22);
      target.body.setOffset(0, -2);
      target.val = options[i];
      target.found = false;

      (function (t) {
        t.setInteractive();
        t.on('pointerdown', function () {
          if (self.celebrationShown || t.found) return;
          self.onOptionOverlap(t);
        });
      })(target);

      this.tweens.add({
        targets: target,
        y: oy + Phaser.Math.Between(-10, 10),
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.optionTargets.push(target);
    }

    this.collider = this.physics.add.overlap(this.bee, this.optionTargets, function (bee, opt) {
      if (self.celebrationShown || opt.found) return;
      self.onOptionOverlap(opt);
    });
  }

  onOptionOverlap(target) {
    target.found = true;

    if (target.val === this.currentAnswer) {
      GameStats.recordHit('MathScene');
      GameAudio.playPop();
      target.setStyle({ backgroundColor: '#66bb6a', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.6, duration: 200, yoyo: true });

      this.questionText.setText(this.currentAnswer + ' ✓').setColor('#2e7d32');
      Speech.speak(Speech.numberToWords(this.currentAnswer));

      setTimeout(function (self) {
        self.questionIndex += 1;
        self.buildQuestion();
      }, 1000, this);
    } else {
      GameStats.recordMistake('MathScene');
      GameAudio.playHit();
      target.setStyle({ backgroundColor: '#ef5350', color: '#ffffff' });
      var tx = target.x;
      this.tweens.add({ targets: target, x: tx + 8, duration: 60, yoyo: true, repeat: 3 });

      setTimeout(function (self, t) {
        t.setStyle({ backgroundColor: '#7e57c2', color: '#ffffff' });
        t.found = false;
      }, 500, this, target);
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) {
      this.bee.updateKeyboard(delta);
    }
  }
}