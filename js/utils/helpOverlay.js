const HelpOverlay = (function () {
  const STEPS = {
    'pt-BR': [
      { icon: '\uD83D\uDC1D', text: 'Move a abelhinha: arrasta com o dedo ou usa as setas / WASD no teclado' },
      { icon: '\uD83C\uDFAF', text: 'Leva a abelha até à resposta certa ou toca diretamente na opção' },
      { icon: '\uD83C\uDFC6', text: 'Completa fases para desbloquear as seguintes e ganhar conquistas' },
      { icon: '\uD83D\uDD13', text: 'Alterna entre modo Livre (todas as fases abertas) e Guiado (progressão por ordem)' },
      { icon: '\uD83C\uDF10', text: 'Muda de idioma: PT, EN ou ES — botão no canto superior esquerdo' },
      { icon: '\uD83D\uDD0A', text: 'Ajusta o volume ou silencia o som no botão do canto superior direito' }
    ],
    'pt-PT': [
      { icon: '\uD83D\uDC1D', text: 'Move a abelhinha: arrasta com o dedo ou usa as setas / WASD no teclado' },
      { icon: '\uD83C\uDFAF', text: 'Leva a abelha até à resposta certa ou toca diretamente na opção' },
      { icon: '\uD83C\uDFC6', text: 'Completa fases para desbloquear as seguintes e ganhar conquistas' },
      { icon: '\uD83D\uDD13', text: 'Alterna entre modo Livre (todas as fases abertas) e Guiado (progressão por ordem)' },
      { icon: '\uD83C\uDF10', text: 'Muda de idioma: PT, EN ou ES — botão no canto superior esquerdo' },
      { icon: '\uD83D\uDD0A', text: 'Ajusta o volume ou silencia o som no botão do canto superior direito' }
    ],
    en: [
      { icon: '\uD83D\uDC1D', text: 'Move the bee: drag with your finger or use arrow keys / WASD on keyboard' },
      { icon: '\uD83C\uDFAF', text: 'Guide the bee to the correct answer or tap the option directly' },
      { icon: '\uD83C\uDFC6', text: 'Complete levels to unlock the next ones and earn achievements' },
      { icon: '\uD83D\uDD13', text: 'Switch between Free mode (all levels open) and Guided mode (progressive order)' },
      { icon: '\uD83C\uDF10', text: 'Change language: PT, EN or ES — button on the top left corner' },
      { icon: '\uD83D\uDD0A', text: 'Adjust volume or mute sound using the button on the top right corner' }
    ],
    es: [
      { icon: '\uD83D\uDC1D', text: 'Mueve la abejita: arrastra con el dedo o usa las flechas / WASD en el teclado' },
      { icon: '\uD83C\uDFAF', text: 'Lleva la abeja a la respuesta correcta o toca directamente la opción' },
      { icon: '\uD83C\uDFC6', text: 'Completa niveles para desbloquear los siguientes y ganar logros' },
      { icon: '\uD83D\uDD13', text: 'Alterna entre modo Libre (todos los niveles abiertos) y Guiado (progresión ordenada)' },
      { icon: '\uD83C\uDF10', text: 'Cambia de idioma: PT, EN o ES — botón en la esquina superior izquierda' },
      { icon: '\uD83D\uDD0A', text: 'Ajusta el volumen o silencia el sonido con el botón en la esquina superior derecha' }
    ]
  };

  function getLang() {
    if (typeof Speech !== 'undefined' && Speech.getCurrentLang) {
      var lang = Speech.getCurrentLang();
      if (STEPS[lang]) return lang;
      if (lang.startsWith('pt')) return 'pt-BR';
      if (lang.startsWith('es')) return 'es';
    }
    return 'pt-BR';
  }

  function populateSteps() {
    var container = document.getElementById('help-steps');
    if (!container) return;
    var lang = getLang();
    var steps = STEPS[lang] || STEPS['pt-BR'];
    container.innerHTML = '';
    steps.forEach(function (s) {
      var step = document.createElement('div');
      step.className = 'help-step';
      var icon = document.createElement('span');
      icon.className = 'help-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = s.icon;
      var text = document.createElement('span');
      text.className = 'help-text';
      text.textContent = s.text;
      step.appendChild(icon);
      step.appendChild(text);
      container.appendChild(step);
    });
  }

  let overlay = null;
  let closeBtn = null;
  let playBtn = null;

  function init() {
    overlay = document.getElementById('help-overlay');
    closeBtn = document.getElementById('help-close');
    playBtn = document.getElementById('help-play');

    if (!overlay) return;

    closeBtn.addEventListener('click', hide);
    playBtn.addEventListener('click', hide);
    overlay.querySelector('.overlay-backdrop').addEventListener('click', hide);
  }

  function show() {
    if (!overlay) return;
    populateSteps();
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  return { init, show, hide };
})();
