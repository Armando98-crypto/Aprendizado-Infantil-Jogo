class FormWordsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FormWordsScene' });
  }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.wordIndex = 0;
    this.syllableIndex = 0;

    var lang = Speech.getCurrentLang();
    var langKey = lang.startsWith('pt') ? 'pt' : lang;
    this.words = FORM_WORDS_DATA[langKey] || FORM_WORDS_DATA.pt;

    this.bee = new Bee(this, 60, this.scale.height / 2);

    var { width, height } = this.scale;
    this.add.text(width / 2, 18, '✏️ Formar Palavras', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#37474f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.hintImage = this.add.text(width / 2, 50, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '40px',
      color: '#37474f'
    }).setOrigin(0.5);

    this.wordDisplay = this.add.text(width / 2, 80, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      color: '#1b5e20',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.syllableTargets = [];
    this.collider = null;

    SceneHelpers.createBackButton(this, () => this.scene.start('MenuScene'));

    this.buildWord();
  }

  buildWord() {
    if (this.collider) this.collider.destroy();
    this.syllableTargets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.syllableTargets = [];
    this.foundSyllables = [];
    this.syllableIndex = 0;

    var wordData = this.words[this.wordIndex];
    if (!wordData) {
      this.celebrationShown = true;
      Progression.markCompleted('FormWordsScene');
      Achievements.checkSceneComplete('FormWordsScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, () => this.scene.start('MenuScene'));
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    this.hintImage.setText(wordData.emoji || '');
    this.currentSyllables = wordData.syllables;
    this.currentWordLabel = wordData.label || '';
    Speech.speak(wordData.label);

    var display = '';
    for (var i = 0; i < this.currentSyllables.length; i++) {
      display += '_ ';
    }
    this.wordDisplay.setText(display.trim());

    var positions = [];
    for (var i = 0; i < this.currentSyllables.length; i++) {
      var sy = this.currentSyllables[i];
      var lx, ly;

      if (i < this.currentSyllables.length / 2) {
        lx = cx - 80 + i * 100;
        ly = 150;
      } else {
        lx = cx - 80 + (i - Math.ceil(this.currentSyllables.length / 2)) * 100;
        ly = 230;
      }

      var sylText = sy.toUpperCase();

      var target = this.add.text(lx, ly, sylText, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#00897b',
        padding: { x: 16, y: 8 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(22);
      target.body.setOffset(0, -4);
      target.found = false;
      target.syllable = sy;
      target.index = i;

      this.tweens.add({
        targets: target,
        y: ly + Phaser.Math.Between(-6, 6),
        duration: 1300 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.syllableTargets.push(target);
    }

    var self = this;
    this.collider = this.physics.add.overlap(this.bee, this.syllableTargets, function (bee, syl) {
      if (self.celebrationShown || syl.found) return;
      self.onSyllableOverlap(syl);
    });
  }

  onSyllableOverlap(target) {
    var expected = this.currentSyllables[this.syllableIndex];
    if (target.syllable === expected) {
      GameStats.recordHit('FormWordsScene');
      target.found = true;
      this.foundSyllables.push(target.syllable);
      this.syllableIndex++;

      target.setStyle({ backgroundColor: '#81c784', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.3, duration: 150, yoyo: true });

      var display = '';
      for (var i = 0; i < this.currentSyllables.length; i++) {
        display += this.foundSyllables[i] ? this.foundSyllables[i].toUpperCase() + ' ' : '_ ';
      }
      this.wordDisplay.setText(display.trim());

      GameAudio.playPop();
      Speech.speak(target.syllable);

      if (this.syllableIndex >= this.currentSyllables.length) {
        this.wordDisplay.setText(this.currentWordLabel.toUpperCase()).setColor('#2e7d32');
        setTimeout(function (self) {
          Speech.speak(self.currentWordLabel);
          self.wordIndex += 1;
          self.buildWord();
        }, 1000, this);
      }
    } else {
      GameAudio.playHit();
      var w = this.scale.width;
      this.tweens.add({ targets: this.wordDisplay, x: w / 2 + 6, duration: 50, yoyo: true, repeat: 3 });
      this.wordDisplay.setX(this.scale.width / 2);
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) {
      this.bee.updateKeyboard(delta);
    }
  }
}

var FORM_WORDS_DATA = {
  pt: [
    { syllables: ['ga', 'to'], label: 'gato', emoji: '🐱' },
    { syllables: ['ca', 'sa'], label: 'casa', emoji: '🏠' },
    { syllables: ['bo', 'la'], label: 'bola', emoji: '⚽' },
    { syllables: ['pa', 'to'], label: 'pato', emoji: '🦆' },
    { syllables: ['sa', 'po'], label: 'sapo', emoji: '🐸' },
    { syllables: ['va', 'ca'], label: 'vaca', emoji: '🐮' },
    { syllables: ['ca', 'va', 'lo'], label: 'cavalo', emoji: '🐴' },
    { syllables: ['ga', 'li', 'nha'], label: 'galinha', emoji: '🐔' },
    { syllables: ['bor', 'bo', 'le', 'ta'], label: 'borboleta', emoji: '🦋' },
    { syllables: ['gi', 'ra', 'fa'], label: 'girafa', emoji: '🦒' }
  ],
  en: [
    { syllables: ['ca', 't'], label: 'cat', emoji: '🐱' },
    { syllables: ['do', 'g'], label: 'dog', emoji: '🐕' },
    { syllables: ['bi', 'rd'], label: 'bird', emoji: '🐦' },
    { syllables: ['fi', 'sh'], label: 'fish', emoji: '🐟' },
    { syllables: ['ba', 'll'], label: 'ball', emoji: '⚽' },
    { syllables: ['boo', 'k'], label: 'book', emoji: '📖' },
    { syllables: ['an', 'gry'], label: 'angry', emoji: '😤' }
  ],
  es: [
    { syllables: ['ga', 'to'], label: 'gato', emoji: '🐱' },
    { syllables: ['ca', 'sa'], label: 'casa', emoji: '🏠' },
    { syllables: ['pe', 'rro'], label: 'perro', emoji: '🐕' },
    { syllables: ['pa', 'to'], label: 'pato', emoji: '🦆' },
    { syllables: ['so', 'l'], label: 'sol', emoji: '☀️' },
    { syllables: ['lu', 'na'], label: 'luna', emoji: '🌙' },
    { syllables: ['es', 'tre', 'lla'], label: 'estrella', emoji: '⭐' },
    { syllables: ['ma', 'ri', 'po', 'sa'], label: 'mariposa', emoji: '🦋' }
  ]
};