class ReadScene extends Phaser.Scene {
  constructor() { super({ key: 'ReadScene' }); }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.phraseIndex = 0;
    this.currentMissingIdx = 0;

    var lang = Speech.getCurrentLang();
    var langKey = lang.startsWith('pt') ? 'pt' : (lang === 'es' ? 'es' : 'en');
    this.phrases = READ_DATA[langKey] || READ_DATA.pt;

    var { width, height } = this.scale;
    this.add.text(width / 2, 18, '📖 Ler Frases', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '18px', color: '#37474f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.hintText = this.add.text(width / 2, 46, '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '38px', color: '#37474f'
    }).setOrigin(0.5);

    this.sentenceText = this.add.text(width / 2, 80, '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '22px', color: '#1565c0', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.bee = new Bee(this, 60, height / 2);
    this.targets = [];
    this.collider = null;

    var self = this;
    SceneHelpers.createBackButton(this, function () { self.scene.start('MenuScene'); });
    this.buildQuestion();
  }

  buildQuestion() {
    var self = this;
    if (this.collider) this.collider.destroy();
    this.targets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.targets = [];
    this.currentMissingIdx = 0;

    var phrase = this.phrases[this.phraseIndex];
    if (!phrase) {
      this.celebrationShown = true;
      Progression.markCompleted('ReadScene');
      Achievements.checkSceneComplete('ReadScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, function () { self.scene.start('MenuScene'); });
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    this.hintText.setText(phrase.emoji || '');
    this.fullPhrase = phrase.full;
    this.missingWords = phrase.missing;

    var display = phrase.full;
    this.missingWords.forEach(function (w) {
      var blanks = '_ '.repeat(w.length).trim();
      display = display.replace(w, blanks);
    });
    this.sentenceText.setText(display);

    Speech.speak(phrase.full);

    var positions = [];
    var cols = Math.min(this.missingWords.length, 4);
    var spacing = Math.min(140, (width - 80) / cols);
    var startX = cx - (spacing * (cols - 1)) / 2;
    var yBase = 140;

    for (var i = 0; i < this.missingWords.length; i++) {
      var wx = startX + i * spacing;
      var wy = yBase + Phaser.Math.Between(-15, 15);

      var target = this.add.text(wx, wy, this.missingWords[i], {
        fontFamily: 'Fredoka, sans-serif', fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#6a1b9a', padding: { x: 12, y: 8 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(22);
      target.body.setOffset(0, -4);
      target.found = false;
      target.word = this.missingWords[i];
      target.index = i;

      this.tweens.add({
        targets: target, y: wy + Phaser.Math.Between(-5, 5),
        duration: 1200 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      this.targets.push(target);
    }

    this.collider = this.physics.add.overlap(this.bee, this.targets, function (bee, t) {
      if (self.celebrationShown || t.found) return;
      self.onMissingOverlap(t);
    });
  }

  onMissingOverlap(target) {
    var expected = this.missingWords[this.currentMissingIdx];
    if (target.word === expected) {
      GameStats.recordHit('ReadScene');
      target.found = true;
      this.currentMissingIdx++;

      target.setStyle({ backgroundColor: '#81c784', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.3, duration: 150, yoyo: true });

      var display = this.sentenceText.text;
      display = display.replace('_ '.repeat(expected.length).trim(), expected);
      this.sentenceText.setText(display);

      GameAudio.playPop();
      Speech.speak(target.word);

      if (this.currentMissingIdx >= this.missingWords.length) {
        this.sentenceText.setColor('#2e7d32');
        setTimeout(function (self) {
          Speech.speak(self.fullPhrase);
          self.phraseIndex += 1;
          self.buildQuestion();
        }, 1000, this);
      }
    } else {
      GameAudio.playHit();
      this.tweens.add({ targets: this.sentenceText, x: this.scale.width / 2 + 6, duration: 50, yoyo: true, repeat: 3 });
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) this.bee.updateKeyboard(delta);
  }
}

var READ_DATA = {
  pt: [
    { full: 'O gato bebe leite', missing: ['gato', 'leite'], emoji: '🐱🥛' },
    { full: 'A abelha voa na flor', missing: ['abelha', 'flor'], emoji: '🐝🌸' },
    { full: 'O cão corre no parque', missing: ['cão', 'parque'], emoji: '🐕🌳' },
    { full: 'A menina lê um livro', missing: ['menina', 'livro'], emoji: '👧📖' },
    { full: 'O sol está quente', missing: ['sol', 'quente'], emoji: '☀️🔥' },
    { full: 'O peixe nada no rio', missing: ['peixe', 'rio'], emoji: '🐟🌊' },
    { full: 'A flor é bonita', missing: ['flor', 'bonita'], emoji: '🌸' },
    { full: 'O pássaro canta na árvore', missing: ['pássaro', 'árvore'], emoji: '🐦🌳' },
    { full: 'Eu gosto de jogar bola', missing: ['gosto', 'bola'], emoji: '⚽' },
    { full: 'A casa tem três portas', missing: ['casa', 'portas'], emoji: '🏠🚪' }
  ],
  en: [
    { full: 'The cat drinks milk', missing: ['cat', 'milk'], emoji: '🐱🥛' },
    { full: 'The bee flies on the flower', missing: ['bee', 'flower'], emoji: '🐝🌸' },
    { full: 'The dog runs in the park', missing: ['dog', 'park'], emoji: '🐕🌳' },
    { full: 'The girl reads a book', missing: ['girl', 'book'], emoji: '👧📖' },
    { full: 'The fish swims in the river', missing: ['fish', 'river'], emoji: '🐟🌊' },
    { full: 'The bird sings on the tree', missing: ['bird', 'tree'], emoji: '🐦🌳' },
    { full: 'The flower is pretty', missing: ['flower', 'pretty'], emoji: '🌸' },
    { full: 'I like to play ball', missing: ['like', 'ball'], emoji: '⚽' },
    { full: 'The house has three doors', missing: ['house', 'doors'], emoji: '🏠🚪' }
  ],
  es: [
    { full: 'El gato bebe leche', missing: ['gato', 'leche'], emoji: '🐱🥛' },
    { full: 'La abeja vuela en la flor', missing: ['abeja', 'flor'], emoji: '🐝🌸' },
    { full: 'El perro corre en el parque', missing: ['perro', 'parque'], emoji: '🐕🌳' },
    { full: 'La niña lee un libro', missing: ['niña', 'libro'], emoji: '👧📖' },
    { full: 'El sol está caliente', missing: ['sol', 'caliente'], emoji: '☀️🔥' },
    { full: 'El pez nada en el río', missing: ['pez', 'río'], emoji: '🐟🌊' },
    { full: 'La flor es bonita', missing: ['flor', 'bonita'], emoji: '🌸' },
    { full: 'El pájaro canta en el árbol', missing: ['pájaro', 'árbol'], emoji: '🐦🌳' },
    { full: 'Me gusta jugar a la pelota', missing: ['gusta', 'pelota'], emoji: '⚽' },
    { full: 'La casa tiene tres puertas', missing: ['casa', 'puertas'], emoji: '🏠🚪' }
  ]
};