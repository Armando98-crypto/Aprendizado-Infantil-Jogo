/**
 * SyllablesScene — famílias silábicas do português.
 *
 * Cada página mostra uma família (ex: ba-be-bi-bo-bu).
 * Ao acertar: pronuncia a sílaba e uma palavra-exemplo.
 * Navegação entre famílias com ‹ ›.
 * Celebração ao completar cada família; celebração final no fim de todas.
 */

class SyllablesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SyllablesScene' });
  }

  create() {
    // Famílias silábicas com palavras-exemplo por sílaba
    this.families = [
      {
        name: 'B',
        syllables: [
          { syl: 'ba', word: 'bola' },
          { syl: 'be', word: 'besouro' },
          { syl: 'bi', word: 'bicicleta' },
          { syl: 'bo', word: 'bolo' },
          { syl: 'bu', word: 'buzina' }
        ]
      },
      {
        name: 'C',
        syllables: [
          { syl: 'ca', word: 'casa' },
          { syl: 'ce', word: 'cebola' },
          { syl: 'ci', word: 'cidade' },
          { syl: 'co', word: 'coelho' },
          { syl: 'cu', word: 'curva' }
        ]
      },
      {
        name: 'D',
        syllables: [
          { syl: 'da', word: 'dado' },
          { syl: 'de', word: 'dedo' },
          { syl: 'di', word: 'dino' },
          { syl: 'do', word: 'doce' },
          { syl: 'du', word: 'duplo' }
        ]
      },
      {
        name: 'F',
        syllables: [
          { syl: 'fa', word: 'fada' },
          { syl: 'fe', word: 'festa' },
          { syl: 'fi', word: 'fio' },
          { syl: 'fo', word: 'fogo' },
          { syl: 'fu', word: 'futebol' }
        ]
      },
      {
        name: 'G',
        syllables: [
          { syl: 'ga', word: 'gato' },
          { syl: 'ge', word: 'gelo' },
          { syl: 'gi', word: 'girafa' },
          { syl: 'go', word: 'gota' },
          { syl: 'gu', word: 'guarda' }
        ]
      },
      {
        name: 'J',
        syllables: [
          { syl: 'ja', word: 'janela' },
          { syl: 'je', word: 'geleia' },
          { syl: 'ji', word: 'jipe' },
          { syl: 'jo', word: 'jogo' },
          { syl: 'ju', word: 'juba' }
        ]
      },
      {
        name: 'L',
        syllables: [
          { syl: 'la', word: 'lata' },
          { syl: 'le', word: 'leite' },
          { syl: 'li', word: 'livro' },
          { syl: 'lo', word: 'lobo' },
          { syl: 'lu', word: 'lua' }
        ]
      },
      {
        name: 'M',
        syllables: [
          { syl: 'ma', word: 'mala' },
          { syl: 'me', word: 'mesa' },
          { syl: 'mi', word: 'mico' },
          { syl: 'mo', word: 'mola' },
          { syl: 'mu', word: 'mundo' }
        ]
      },
      {
        name: 'N',
        syllables: [
          { syl: 'na', word: 'nada' },
          { syl: 'ne', word: 'nene' },
          { syl: 'ni', word: 'ninho' },
          { syl: 'no', word: 'nove' },
          { syl: 'nu', word: 'nuvem' }
        ]
      },
      {
        name: 'P',
        syllables: [
          { syl: 'pa', word: 'pato' },
          { syl: 'pe', word: 'peixe' },
          { syl: 'pi', word: 'pipa' },
          { syl: 'po', word: 'pote' },
          { syl: 'pu', word: 'pulga' }
        ]
      },
      {
        name: 'R',
        syllables: [
          { syl: 'ra', word: 'rato' },
          { syl: 're', word: 'rede' },
          { syl: 'ri', word: 'risco' },
          { syl: 'ro', word: 'roda' },
          { syl: 'ru', word: 'rua' }
        ]
      },
      {
        name: 'QU',
        syllables: [
          { syl: 'qua', word: 'quatro' },
          { syl: 'que', word: 'queijo' },
          { syl: 'qui', word: 'quilo' },
          { syl: 'quô', word: 'quórum' },
          { syl: 'quo', word: 'quota' }
        ]
      },
      {
        name: 'T',
        syllables: [
          { syl: 'ta', word: 'tatu' },
          { syl: 'te', word: 'tela' },
          { syl: 'ti', word: 'tigre' },
          { syl: 'to', word: 'touro' },
          { syl: 'tu', word: 'tubo' }
        ]
      },
      {
        name: 'V',
        syllables: [
          { syl: 'va', word: 'vaca' },
          { syl: 've', word: 'vela' },
          { syl: 'vi', word: 'vila' },
          { syl: 'vo', word: 'vovó' },
          { syl: 'vu', word: 'vulcão' }
        ]
      },
      {
        name: 'Z',
        syllables: [
          { syl: 'za', word: 'zebra' },
          { syl: 'ze', word: 'zero' },
          { syl: 'zi', word: 'zinco' },
          { syl: 'zo', word: 'zona' },
          { syl: 'zu', word: 'zumbido' }
        ]
      },
      {
        name: 'Ç',
        syllables: [
          { syl: 'ça', word: 'caça' },
          { syl: 'ce', word: 'cereja' },
          { syl: 'ci', word: 'ciranda' },
          { syl: 'co', word: 'coçar' },
          { syl: 'cu', word: 'cuia' }
        ]
      },
      {
        name: 'CH',
        syllables: [
          { syl: 'cha', word: 'chave' },
          { syl: 'che', word: 'chefe' },
          { syl: 'chi', word: 'chicote' },
          { syl: 'cho', word: 'chocolate' },
          { syl: 'chu', word: 'chuva' }
        ]
      },
      {
        name: 'LH',
        syllables: [
          { syl: 'lha', word: 'lhama' },
          { syl: 'lhe', word: 'telha' },
          { syl: 'lhi', word: 'milho' },
          { syl: 'lho', word: 'coelho' },
          { syl: 'lhu', word: 'olho' }
        ]
      },
      {
        name: 'NH',
        syllables: [
          { syl: 'nha', word: 'nhanha' },
          { syl: 'nhe', word: 'neném' },
          { syl: 'nhi', word: 'anhinha' },
          { syl: 'nho', word: 'banho' },
          { syl: 'nhu', word: 'nhoque' }
        ]
      },
      {
        name: 'QU',
        syllables: [
          { syl: 'qua', word: 'quatro' },
          { syl: 'que', word: 'queijo' },
          { syl: 'qui', word: 'quilo' },
          { syl: 'quô', word: 'quórum' },
          { syl: 'quo', word: 'quota' }
        ]
      }
    ];

    this.currentFamily = 0;
    this.celebrationShown = false;
    this.progressKey = Progress.KEYS.syllables;
    this.totalSyllables = this.families.reduce((sum, f) => sum + f.syllables.length, 0);

    SceneHelpers.createBackground(this);
    SceneHelpers.createBackButton(this, () => this.scene.start('MenuScene'));

    this.progressUI = SceneHelpers.createProgressIndicator(this, this.progressKey, this.totalSyllables);

    this.buildFamily();
  }

  /** ID único para progresso (evita colisão entre famílias com sílabas iguais). */
  getSyllableProgressId(target) {
    const family = this.families[this.currentFamily];
    return `${family.name}_${target.label}`;
  }

  buildFamily() {
    if (this.pageObjects) {
      this.pageObjects.forEach((obj) => {
        if (obj && obj.destroy) obj.destroy();
      });
    }
    this.pageObjects = [];

    const { width, height } = this.scale;
    const family = this.families[this.currentFamily];

    // Indicador visual da família (letra grande decorativa)
    const familyLabel = this.add.text(width / 2, 95, family.name, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '32px',
      color: '#5c6bc0',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.5);
    this.pageObjects.push(familyLabel);

    const positions = SceneHelpers.gridPositions(this, family.syllables.length, {
      cols: family.syllables.length,
      startY: 160,
      marginBottom: 130
    });

    this.targets = family.syllables.map((item, i) => {
      const pos = positions[i];
      const target = SceneHelpers.createTarget(this, pos.x, pos.y, item.syl, 72);
      target.syllableData = item;
      this.pageObjects.push(target.container, target.hitZone);
      return target;
    });

    SceneHelpers.restoreSavedProgress(
      this.targets,
      this.progressKey,
      (t) => this.getSyllableProgressId(t)
    );
    this.progressUI.update();

    if (this.bee) this.bee.destroy();
    this.bee = new Bee(this, width / 2, height / 2);
    this.pageObjects.push(this.bee);

    SceneHelpers.setupBeeCollisions(
      this,
      this.bee,
      this.targets,
      (target) => {
        const { syl, word } = target.syllableData;
        Speech.speakSequence([syl, word]);
      },
      () => this.onFamilyComplete(),
      {
        progressKey: this.progressKey,
        getProgressId: (t) => this.getSyllableProgressId(t),
        onProgressUpdate: () => this.progressUI.update()
      }
    );

    this.createFamilyNav();

    if (this.currentFamily === 0 && localStorage.getItem('tutorial_syllables_seen') !== 'true') {
      const firstIncomplete = this.targets.find((t) => !t.completed) || this.targets[0];
      SceneHelpers.showDragHint(this, this.bee, firstIncomplete, 'tutorial_syllables_seen');
    }
  }

  createFamilyNav() {
    const { width, height } = this.scale;
    const family = this.families[this.currentFamily];

    if (this.navContainer) this.navContainer.destroy();
    this.navContainer = this.add.container(0, 0);

    const dots = this.families.length;
    const spacing = 14;
    const startX = width / 2 - ((dots - 1) * spacing) / 2;

    for (let i = 0; i < dots; i++) {
      const dot = this.add.circle(
        startX + i * spacing,
        height - 85,
        4,
        i === this.currentFamily ? 0xce93d8 : 0xb0bec5
      );
      this.navContainer.add(dot);
    }

    this.pageObjects.push(this.navContainer);

    if (this.currentFamily > 0) {
      const prevBtn = SceneHelpers.createButton(
        this, 55, height - 45, 70, 60, '‹',
        SceneHelpers.PALETTE.btnNav,
        () => {
          this.currentFamily -= 1;
          this.celebrationShown = false;
          this.buildFamily();
        }
      );
      this.pageObjects.push(prevBtn);
    }

    if (this.currentFamily < this.families.length - 1) {
      const nextBtn = SceneHelpers.createButton(
        this, width - 55, height - 45, 70, 60, '›',
        SceneHelpers.PALETTE.btnNav,
        () => {
          this.currentFamily += 1;
          this.celebrationShown = false;
          this.buildFamily();
        }
      );
      this.pageObjects.push(nextBtn);
    }
  }

  onFamilyComplete() {
    this.celebrationShown = true;
    const isLast = this.currentFamily === this.families.length - 1;

    if (isLast) {
      Progression.markCompleted('SyllablesScene');
      SceneHelpers.showCelebration(this, () => this.scene.start('MenuScene'));
      return;
    }

    const { width, height } = this.scale;
    const star = this.add.text(width / 2, height / 2 - 40, '⭐', { fontSize: '48px' }).setOrigin(0.5);
    GameAudio.playCelebration();

    this.tweens.add({
      targets: star,
      scale: 1.5,
      alpha: 0,
      duration: 900,
      onComplete: () => {
        star.destroy();
        this.currentFamily += 1;
        this.celebrationShown = false;
        this.buildFamily();
      }
    });
  }

  update(_time, delta) {
    if (!this.celebrationShown) {
      this.bee.updateKeyboard(delta);
    }
  }
}
