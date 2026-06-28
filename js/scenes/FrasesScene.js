class FrasesScene extends Phaser.Scene {
  constructor() { super({ key: 'FrasesScene' }); }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.phraseIndex = 0;
    this.wordIndex = 0;
    this.foundWords = [];

    var lang = Speech.getCurrentLang();
    var langKey = lang.startsWith('pt') ? 'pt' : (lang === 'es' ? 'es' : 'en');
    this.phrases = PHRASES_DATA[langKey] || PHRASES_DATA.pt;

    var { width, height } = this.scale;
    this.add.text(width / 2, 18, '💬 Formar Frases', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '18px', color: '#37474f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.phraseDisplay = this.add.text(width / 2, 50, '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '24px', color: '#1b5e20', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.bee = new Bee(this, 60, height / 2);
    this.targets = [];
    this.collider = null;

    var self = this;
    SceneHelpers.createBackButton(this, function () { self.scene.start('MenuScene'); });
    this.buildPhrase();
  }

  buildPhrase() {
    var self = this;
    if (this.collider) this.collider.destroy();
    this.targets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.targets = [];
    this.foundWords = [];
    this.wordIndex = 0;

    var phrase = this.phrases[this.phraseIndex];
    if (!phrase) {
      this.celebrationShown = true;
      Progression.markCompleted('FrasesScene');
      Achievements.checkSceneComplete('FrasesScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, function () { self.scene.start('MenuScene'); });
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    var displayText = phrase.hint ? phrase.hint + ' ' : '';
    displayText += '_ '.repeat(phrase.words.length).trim();
    this.phraseDisplay.setText(displayText);
    this.currentWords = phrase.words;

    Speech.speak(phrase.full);

    var positions = [];
    var cols = Math.min(phrase.words.length, 4);
    var spacing = Math.min(130, (width - 80) / cols);
    var startX = cx - (spacing * (cols - 1)) / 2;
    var yStart = 140;

    for (var i = 0; i < phrase.words.length; i++) {
      var wx, wy;
      if (i < cols) {
        wx = startX + i * spacing;
        wy = yStart + Phaser.Math.Between(-20, 20);
      } else {
        wx = startX + (i - cols) * spacing;
        wy = yStart + 80 + Phaser.Math.Between(-10, 10);
      }

      var target = this.add.text(wx, wy, phrase.words[i], {
        fontFamily: 'Fredoka, sans-serif', fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#5c6bc0', padding: { x: 12, y: 8 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(22);
      target.body.setOffset(0, -4);
      target.found = false;
      target.word = phrase.words[i];
      target.index = i;

      this.tweens.add({
        targets: target, y: wy + Phaser.Math.Between(-6, 6),
        duration: 1300 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      this.targets.push(target);
    }

    this.collider = this.physics.add.overlap(this.bee, this.targets, function (bee, t) {
      if (self.celebrationShown || t.found) return;
      self.onWordOverlap(t);
    });
  }

  onWordOverlap(target) {
    var expected = this.currentWords[this.wordIndex];
    if (target.word === expected) {
      GameStats.recordHit('FrasesScene');
      target.found = true;
      this.foundWords.push(target.word);
      this.wordIndex++;

      target.setStyle({ backgroundColor: '#81c784', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.3, duration: 150, yoyo: true });

      var display = '';
      for (var i = 0; i < this.currentWords.length; i++) {
        display += this.foundWords[i] ? this.foundWords[i] + ' ' : '_ ';
      }
      this.phraseDisplay.setText(display.trim());

      GameAudio.playPop();
      Speech.speak(target.word);

      if (this.wordIndex >= this.currentWords.length) {
        this.phraseDisplay.setColor('#2e7d32');
        setTimeout(function (self) {
          Speech.speak(self.currentWords.join(' '));
          self.phraseIndex += 1;
          self.buildPhrase();
        }, 1000, this);
      }
    } else {
      GameAudio.playHit();
      this.tweens.add({ targets: this.phraseDisplay, x: this.scale.width / 2 + 6, duration: 50, yoyo: true, repeat: 3 });
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) this.bee.updateKeyboard(delta);
  }
}

var PHRASES_DATA = {
  pt: [
    { words: ['O', 'gato', 'bebe', 'leite'], full: 'O gato bebe leite', hint: '🐱🥛' },
    { words: ['A', 'bola', 'rola'], full: 'A bola rola', hint: '⚽' },
    { words: ['O', 'sapo', 'pula'], full: 'O sapo pula', hint: '🐸' },
    { words: ['A', 'vaca', 'dá', 'leite'], full: 'A vaca dá leite', hint: '🐮🥛' },
    { words: ['O', 'pato', 'nada'], full: 'O pato nada', hint: '🦆🌊' },
    { words: ['A', 'casa', 'é', 'grande'], full: 'A casa é grande', hint: '🏠' },
    { words: ['O', 'sol', 'brilha'], full: 'O sol brilha', hint: '☀️' },
    { words: ['A', 'lua', 'brilha', 'à', 'noite'], full: 'A lua brilha à noite', hint: '🌙' },
    { words: ['O', 'cavalo', 'corre'], full: 'O cavalo corre', hint: '🐴' },
    { words: ['A', 'abelha', 'voa'], full: 'A abelha voa', hint: '🐝' }
  ],
  en: [
    { words: ['The', 'cat', 'drinks', 'milk'], full: 'The cat drinks milk', hint: '🐱🥛' },
    { words: ['The', 'ball', 'rolls'], full: 'The ball rolls', hint: '⚽' },
    { words: ['The', 'frog', 'jumps'], full: 'The frog jumps', hint: '🐸' },
    { words: ['The', 'sun', 'shines'], full: 'The sun shines', hint: '☀️' },
    { words: ['The', 'bird', 'flies'], full: 'The bird flies', hint: '🐦' },
    { words: ['The', 'fish', 'swims'], full: 'The fish swims', hint: '🐟' },
    { words: ['The', 'dog', 'runs'], full: 'The dog runs', hint: '🐕' },
    { words: ['I', 'love', 'my', 'mom'], full: 'I love my mom', hint: '❤️👩' },
    { words: ['The', 'star', 'is', 'bright'], full: 'The star is bright', hint: '⭐' },
    { words: ['The', 'tree', 'is', 'tall'], full: 'The tree is tall', hint: '🌳' }
  ],
  es: [
    { words: ['El', 'gato', 'bebe', 'leche'], full: 'El gato bebe leche', hint: '🐱🥛' },
    { words: ['La', 'pelota', 'rueda'], full: 'La pelota rueda', hint: '⚽' },
    { words: ['La', 'rana', 'salta'], full: 'La rana salta', hint: '🐸' },
    { words: ['El', 'sol', 'brilla'], full: 'El sol brilla', hint: '☀️' },
    { words: ['El', 'pájaro', 'vuela'], full: 'El pájaro vuela', hint: '🐦' },
    { words: ['El', 'pez', 'nada'], full: 'El pez nada', hint: '🐟' },
    { words: ['El', 'perro', 'corre'], full: 'El perro corre', hint: '🐕' },
    { words: ['La', 'luna', 'brilla'], full: 'La luna brilla', hint: '🌙' },
    { words: ['La', 'flor', 'es', 'bella'], full: 'La flor es bella', hint: '🌸' },
    { words: ['El', 'árbol', 'es', 'alto'], full: 'El árbol es alto', hint: '🌳' }
  ]
};