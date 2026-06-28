class AnimalsScene extends Phaser.Scene {
  constructor() { super({ key: 'AnimalsScene' }); }

  create() {
    SceneHelpers.createBackground(this);
    this.celebrationShown = false;
    this.animalIndex = 0;
    this.letterIndex = 0;
    this.foundLetters = [];

    var lang = Speech.getCurrentLang();
    var langKey = lang.startsWith('pt') ? 'pt' : (lang === 'es' ? 'es' : 'en');
    this.animals = ANIMALS_DATA[langKey] || ANIMALS_DATA.pt;

    var { width, height } = this.scale;
    this.add.text(width / 2, 18, '🐾 Animais', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '18px', color: '#37474f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.emojiText = this.add.text(width / 2, 50, '', {
      fontSize: '48px'
    }).setOrigin(0.5);

    this.nameDisplay = this.add.text(width / 2, 82, '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '22px', color: '#1b5e20', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.bee = new Bee(this, 60, height / 2);
    this.targets = [];
    this.collider = null;

    SceneHelpers.createBackButton(this, function () { self.scene.start('MenuScene'); });
    var self = this;
    this.buildAnimal();
  }

  buildAnimal() {
    var self = this;
    if (this.collider) this.collider.destroy();
    this.targets.forEach(function (t) { if (t && t.destroy) t.destroy(); });
    this.targets = [];
    this.foundLetters = [];
    this.letterIndex = 0;

    var animal = this.animals[this.animalIndex];
    if (!animal) {
      this.celebrationShown = true;
      Progression.markCompleted('AnimalsScene');
      Achievements.checkSceneComplete('AnimalsScene');
      Achievements.checkAllComplete();
      SceneHelpers.showCelebration(this, function () { self.scene.start('MenuScene'); });
      return;
    }

    var { width, height } = this.scale;
    var cx = width / 2;

    this.emojiText.setText(animal.emoji || '');
    this.currentAnimal = animal.name;
    var letters = animal.name.split('');

    var display = '';
    for (var i = 0; i < letters.length; i++) {
      display += '_ ';
    }
    this.nameDisplay.setText(display.trim());

    Speech.speak(animal.name);

    var cols = Math.min(letters.length, 6);
    var spacing = Math.min(70, (width - 60) / cols);
    var startX = cx - (spacing * (cols - 1)) / 2;
    var rowY = height - 100;
    var hint = this.add.text(cx, 104, animal.hint || '', {
      fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#78909c', fontStyle: 'italic'
    }).setOrigin(0.5);

    for (var i = 0; i < letters.length; i++) {
      var lx, ly;
      if (i < cols) {
        lx = startX + i * spacing;
        ly = rowY + Phaser.Math.Between(-30, 30);
      } else {
        lx = startX + (i - cols) * spacing;
        ly = rowY + 80 + Phaser.Math.Between(-15, 15);
      }

      var target = this.add.text(lx, ly, letters[i].toUpperCase(), {
        fontFamily: 'Fredoka, sans-serif', fontSize: '36px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#e91e63', padding: { x: 14, y: 8 }
      }).setOrigin(0.5);

      this.physics.add.existing(target);
      target.body.setCircle(20);
      target.body.setOffset(-2, -4);
      target.found = false;
      target.letter = letters[i];
      target.index = i;

      this.tweens.add({
        targets: target, y: ly + Phaser.Math.Between(-6, 6),
        duration: 1200 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      this.targets.push(target);
    }

    this.collider = this.physics.add.overlap(this.bee, this.targets, function (bee, t) {
      if (self.celebrationShown || t.found) return;
      self.onLetterOverlap(t);
    });
  }

  onLetterOverlap(target) {
    var expected = this.currentAnimal[this.letterIndex];
    if (target.letter === expected) {
      target.found = true;
      this.foundLetters.push(target.letter);
      this.letterIndex++;

      target.setStyle({ backgroundColor: '#81c784', color: '#1b5e20' });
      this.tweens.add({ targets: target, scale: 1.4, duration: 150, yoyo: true });

      var display = '';
      for (var i = 0; i < this.currentAnimal.length; i++) {
        display += this.foundLetters[i] ? this.foundLetters[i].toUpperCase() : '_';
        display += ' ';
      }
      this.nameDisplay.setText(display.trim());

      GameAudio.playPop();
      Speech.speak(expected);

      if (this.letterIndex >= this.currentAnimal.length) {
        this.nameDisplay.setColor('#2e7d32');
        setTimeout(function (self) {
          Speech.speak(self.currentAnimal);
          self.animalIndex += 1;
          self.buildAnimal();
        }, 1000, this);
      }
    } else {
      GameAudio.playHit();
      this.tweens.add({ targets: this.nameDisplay, x: this.scale.width / 2 + 6, duration: 50, yoyo: true, repeat: 3 });
    }
  }

  update(_time, delta) {
    if (!this.celebrationShown) this.bee.updateKeyboard(delta);
  }
}

var ANIMALS_DATA = {
  pt: [
    { name: 'gato', emoji: '🐱', hint: 'Animal que mia' },
    { name: 'cão', emoji: '🐕', hint: 'Melhor amigo do homem' },
    { name: 'pato', emoji: '🦆', hint: 'Faz quá quá' },
    { name: 'sapo', emoji: '🐸', hint: 'Verde e pula' },
    { name: 'vaca', emoji: '🐮', hint: 'Dá leite' },
    { name: 'peixe', emoji: '🐟', hint: 'Vive na água' },
    { name: 'abelha', emoji: '🐝', hint: 'Faz mel' },
    { name: 'cavalo', emoji: '🐴', hint: 'Corre rápido' },
    { name: 'galinha', emoji: '🐔', hint: 'Faz có có' },
    { name: 'elefante', emoji: '🐘', hint: 'Maior animal terrestre' }
  ],
  en: [
    { name: 'cat', emoji: '🐱', hint: 'Says meow' },
    { name: 'dog', emoji: '🐕', hint: 'Best friend' },
    { name: 'duck', emoji: '🦆', hint: 'Says quack' },
    { name: 'fish', emoji: '🐟', hint: 'Swims in water' },
    { name: 'bee', emoji: '🐝', hint: 'Makes honey' },
    { name: 'horse', emoji: '🐴', hint: 'Runs fast' },
    { name: 'bird', emoji: '🐦', hint: 'Can fly' },
    { name: 'elephant', emoji: '🐘', hint: 'Biggest land animal' },
    { name: 'lion', emoji: '🦁', hint: 'King of animals' },
    { name: 'monkey', emoji: '🐵', hint: 'Loves bananas' }
  ],
  es: [
    { name: 'gato', emoji: '🐱', hint: 'Dice miau' },
    { name: 'perro', emoji: '🐕', hint: 'Mejor amigo' },
    { name: 'pato', emoji: '🦆', hint: 'Hace cuac' },
    { name: 'rana', emoji: '🐸', hint: 'Verde y salta' },
    { name: 'vaca', emoji: '🐮', hint: 'Da leche' },
    { name: 'pez', emoji: '🐟', hint: 'Vive en el agua' },
    { name: 'abeja', emoji: '🐝', hint: 'Hace miel' },
    { name: 'caballo', emoji: '🐴', hint: 'Corre rápido' },
    { name: 'elefante', emoji: '🐘', hint: 'El animal más grande' },
    { name: 'león', emoji: '🦁', hint: 'Rey de los animales' }
  ]
};