class WordsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WordsScene' });
  }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.wordIndex = 0;
    this.letterIndex = 0;
    this.foundLetters = [];

    var lang = Speech.getCurrentLang();
    var langKey = lang.startsWith('pt') ? 'pt' : lang;
    this.words = WORDS_DATA[langKey] || WORDS_DATA.en;

    this.bee = new Bee(this, 60, this.scale.height / 2);

    var { width, height } = this.scale;
    this.add.text(width / 2, 18, '📖 Forme a Palavra', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '18px',
      color: '#37474f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.wordText = this.add.text(width / 2, 46, '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '28px',
      color: '#1b5e20',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.letterTargets = [];
    this.collider = null;

    SceneHelpers.createBackButton(this, () => this.scene.start('MenuScene'));

    this.buildWord();
  }

  buildWord() {
    if (this.collider) this.collider.destroy();
    this.letterTargets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.letterTargets = [];
    this.foundLetters = [];
    this.letterIndex = 0;

    var wordData = this.words[this.wordIndex];
    if (!wordData) {
      this.celebrationShown = true;
      Progression.markCompleted('WordsScene');
      Achievements.checkSceneComplete('WordsScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, () => this.scene.start('MenuScene'));
      return;
    }

    var { width, height } = this.scale;
    var letters = wordData.word.split('');
    var cx = width / 2;

    this.wordText.setText('_ '.repeat(letters.length).trim());
    this.currentWord = wordData.word;

    var hintText = this.add.text(cx, 68, wordData.hint || '', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '13px',
      color: '#78909c',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    Speech.speak(wordData.word);

    var positions = [];
    var cols = Math.min(letters.length, 6);
    var spacing = Math.min(70, (width - 60) / cols);
    var startX = cx - (spacing * (cols - 1)) / 2;
    var rowY = height - 100;

    for (var i = 0; i < letters.length; i++) {
      var lx, ly;
      if (i < cols) {
        lx = startX + i * spacing;
        ly = rowY + Phaser.Math.Between(-40, 40);
      } else {
        lx = startX + (i - cols) * spacing;
        ly = rowY + 90 + Phaser.Math.Between(-20, 20);
      }

      var target = this.add.text(lx, ly, letters[i].toUpperCase(), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#5c6bc0',
        padding: { x: 14, y: 8 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(20);
      target.body.setOffset(-2, -4);
      target.found = false;
      target.letter = letters[i];
      target.index = i;

      this.tweens.add({
        targets: target,
        y: ly + Phaser.Math.Between(-8, 8),
        duration: 1200 + Math.random() * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.letterTargets.push(target);
    }

    var self = this;
    this.collider = this.physics.add.overlap(this.bee.sprite, this.letterTargets, function (bee, letter) {
      if (self.celebrationShown || letter.found) return;
      self.onLetterOverlap(letter);
    });
  }

  onLetterOverlap(target) {
    var expected = this.currentWord[this.letterIndex];
    if (target.letter === expected) {
      target.found = true;
      this.foundLetters.push(target.letter);
      this.letterIndex++;

      target.setStyle({ backgroundColor: '#81c784', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.4, duration: 150, yoyo: true });

      var display = '';
      for (var i = 0; i < this.currentWord.length; i++) {
        display += this.foundLetters[i] ? this.foundLetters[i].toUpperCase() : '_';
        display += ' ';
      }
      this.wordText.setText(display.trim());

      GameAudio.playPop();
      Speech.speak(expected);

      if (this.letterIndex >= this.currentWord.length) {
        this.wordText.setColor('#2e7d32');
        setTimeout(function (self) {
          Speech.speak(self.currentWord);
          self.wordIndex += 1;
          self.buildWord();
        }, 900, this);
      }
    } else {
      GameAudio.playHit();
      this.tweens.add({ targets: this.wordText, x: this.scale.width / 2 + 6, duration: 50, yoyo: true, repeat: 3 });
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) {
      this.bee.updateKeyboard(delta);
    }
  }
}

var WORDS_DATA = {
  en: [
    { word: 'cat', hint: 'A small furry pet' },
    { word: 'dog', hint: 'Man\'s best friend' },
    { word: 'sun', hint: 'It shines during the day' },
    { word: 'fish', hint: 'Swims in water' },
    { word: 'bird', hint: 'It can fly' },
    { word: 'book', hint: 'You read it' },
    { word: 'star', hint: 'Shines at night' },
    { word: 'tree', hint: 'Has leaves and roots' },
    { word: 'ball', hint: 'You play with it' },
    { word: 'apple', hint: 'A red fruit' }
  ],
  pt: [
    { word: 'gato', hint: 'Animal que mia' },
    { word: 'casa', hint: 'Onde moramos' },
    { word: 'bola', hint: 'Brincamos com ela' },
    { word: 'pato', hint: 'Animal que faz quá' },
    { word: 'rato', hint: 'Pequeno roedor' },
    { word: 'sapo', hint: 'Animal verde que pula' },
    { word: 'vaca', hint: 'Dá leite' },
    { word: 'lua', hint: 'Brilha à noite' },
    { word: 'pipa', hint: 'Sobe no céu' },
    { word: 'foca', hint: 'Animal que vive na água' }
  ],
  es: [
    { word: 'sol', hint: 'Brilla en el cielo' },
    { word: 'luna', hint: 'Brilla de noche' },
    { word: 'casa', hint: 'Donde vivimos' },
    { word: 'perro', hint: 'Mejor amigo del hombre' },
    { word: 'pato', hint: 'Animal que hace cuac' },
    { word: 'gato', hint: 'Animal que maúlla' },
    { word: 'pez', hint: 'Vive en el agua' },
    { word: 'flor', hint: 'Planta con colores' },
    { word: 'pipa', hint: 'Vuela en el cielo' },
    { word: 'oso', hint: 'Animal grande y peludo' }
  ]
};