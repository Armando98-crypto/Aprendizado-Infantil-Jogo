const Speech = (function () {
  const STORAGE_KEY = 'preferred_lang';

  const LANGS = {
    'pt-BR': { label: 'PT-BR', flag: '🇧🇷', voiceLang: 'pt-BR', tts: 'pt-BR' },
    'pt-PT': { label: 'PT-PT', flag: '🇵🇹', voiceLang: 'pt-PT', tts: 'pt-PT' },
    'en':    { label: 'EN',    flag: '🇺🇸', voiceLang: 'en-US', tts: 'en-US' },
    'es':    { label: 'ES',    flag: '🇪🇸', voiceLang: 'es-ES', tts: 'es-ES' }
  };

  const LANG_ORDER = ['pt-BR', 'pt-PT', 'en', 'es'];

  let currentLang = _detectInitialLang();
  let cachedVoice = null;
  let _primed = false;
  let _changeListeners = [];

  function _detectInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS[saved]) return saved;

    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.startsWith('pt')) {
      if (nav === 'pt-br' || nav === 'pt') return 'pt-BR';
      return 'pt-PT';
    }
    if (nav.startsWith('es')) return 'es';
    return 'en';
  }

  function getAvailableLangs() {
    return LANG_ORDER.map((k) => ({ key: k, ...LANGS[k] }));
  }

  function getCurrentLang() {
    return currentLang;
  }

  function setLang(key) {
    if (!LANGS[key]) return;
    currentLang = key;
    localStorage.setItem(STORAGE_KEY, key);
    cachedVoice = null;
    _primed = false;
    loadVoices();
    _changeListeners.forEach((fn) => fn(key));
  }

  function onChange(fn) {
    _changeListeners.push(fn);
  }

  function getVoiceLang() {
    return LANGS[currentLang].voiceLang;
  }

  function getTTSText(text) {
    return LANGS[currentLang].tts;
  }

  function loadVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.getVoices();
    cachedVoice = null;
  }

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  function prime() {
    if (_primed || typeof speechSynthesis === 'undefined') return;
    _primed = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch (_) { /* ignore */ }
  }

  function pickVoice() {
    if (cachedVoice) return cachedVoice;

    const targetLang = LANGS[currentLang].voiceLang;
    const voices = typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : [];

    const exact = voices.filter((v) => {
      const lang = v.lang.replace('_', '-').toLowerCase();
      return lang === targetLang.toLowerCase();
    });

    const preferred = exact.find((v) => _isFemale(v)) || exact[0];
    if (preferred) {
      cachedVoice = preferred;
      return cachedVoice;
    }

    const family = voices.filter((v) =>
      v.lang.replace('_', '-').toLowerCase().startsWith(targetLang.split('-')[0])
    );
    const fallback = family.find((v) => _isFemale(v)) || family[0];
    if (fallback) {
      cachedVoice = fallback;
      return cachedVoice;
    }

    return null;
  }

  function _isFemale(voice) {
    const hint = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return /female|feminina|woman|maria|luciana|helen|samantha|google|microsoft/i.test(hint);
  }

  function _applyUtteranceSettings(utterance) {
    const lang = LANGS[currentLang].voiceLang;
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.45;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
  }

  function speak(text) {
    if (SoundSettings.isMuted()) return;
    if (typeof speechSynthesis === 'undefined') return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    _applyUtteranceSettings(utterance);

    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 50);
  }

  function speakSequence(texts) {
    if (!texts.length || SoundSettings.isMuted()) return;
    if (typeof speechSynthesis === 'undefined') return;

    setTimeout(() => {
      speechSynthesis.cancel();

      let index = 0;

      function speakNext() {
        if (index >= texts.length || SoundSettings.isMuted()) return;

        const utterance = new SpeechSynthesisUtterance(texts[index]);
        _applyUtteranceSettings(utterance);

        utterance.onend = () => {
          index += 1;
          if (index < texts.length) {
            setTimeout(speakNext, 300);
          }
        };

        speechSynthesis.speak(utterance);
      }

      speakNext();
    }, 50);
  }

  function numberToWords(n) {
    switch (currentLang) {
      case 'pt-BR': return _ptBRNumbers(n);
      case 'pt-PT': return _ptPTNumbers(n);
      case 'en':    return _enNumbers(n);
      case 'es':    return _esNumbers(n);
      default:      return String(n);
    }
  }

  function _ptBRNumbers(n) {
    const u = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
      'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    if (n === 100) return 'cem';
    if (n < 20) return u[n];
    const d = Math.floor(n / 10);
    const r = n % 10;
    const de = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    if (r === 0) return de[d];
    return `${de[d]} e ${u[r]}`;
  }

  function _ptPTNumbers(n) {
    const u = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
      'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
    if (n === 100) return 'cem';
    if (n < 20) return u[n];
    const d = Math.floor(n / 10);
    const r = n % 10;
    const de = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    if (r === 0) return de[d];
    return `${de[d]} e ${u[r]}`;
  }

  function _enNumbers(n) {
    const u = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    if (n === 100) return 'one hundred';
    if (n < 20) return u[n];
    const d = Math.floor(n / 10);
    const r = n % 10;
    const de = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (r === 0) return de[d];
    return `${de[d]}-${u[r]}`;
  }

  function _esNumbers(n) {
    const u = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
      'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    if (n === 100) return 'cien';
    if (n < 20) return u[n];
    const d = Math.floor(n / 10);
    const r = n % 10;
    const de = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    if (r === 0) return de[d];
    if (d === 2) return `veinti${u[r]}`;
    return `${de[d]} y ${u[r]}`;
  }

  function getAlphabetPhonetics() {
    const all = {
      'pt-BR': { A:'á', B:'bê', C:'cê', D:'dé', E:'é', F:'efe', G:'gê', H:'agá', I:'i', J:'jota', K:'cá', L:'ele',
        M:'eme', N:'ene', O:'ó', P:'pê', Q:'quê', R:'erre', S:'esse', T:'té', U:'u', V:'vê', W:'dáblio', X:'xis', Y:'ípsilon', Z:'zê' },
      'pt-PT': { A:'á', B:'bê', C:'cê', D:'dé', E:'é', F:'éfe', G:'gê', H:'agá', I:'i', J:'jota', K:'cá', L:'éle',
        M:'éme', N:'éne', O:'ó', P:'pê', Q:'quê', R:'érre', S:'ésse', T:'tê', U:'u', V:'vê', W:'dáblio', X:'xis', Y:'ípsilon', Z:'zê' },
      'en': { A:'ay', B:'bee', C:'see', D:'dee', E:'ee', F:'ef', G:'gee', H:'aitch', I:'eye', J:'jay', K:'kay', L:'el',
        M:'em', N:'en', O:'oh', P:'pee', Q:'cue', R:'ar', S:'ess', T:'tee', U:'you', V:'vee', W:'double-u', X:'ex', Y:'wye', Z:'zee' },
      'es': { A:'a', B:'be', C:'ce', D:'de', E:'e', F:'efe', G:'ge', H:'hache', I:'i', J:'jota', K:'ka', L:'ele',
        M:'eme', N:'ene', O:'o', P:'pe', Q:'cu', R:'erre', S:'ese', T:'te', U:'u', V:'uve', W:'uve doble', X:'equis', Y:'i griega', Z:'zeta' }
    };
    return all[currentLang] || all['en'];
  }

  return {
    speak,
    speakSequence,
    numberToWords,
    loadVoices,
    pickVoice,
    prime,
    getAvailableLangs,
    getCurrentLang,
    setLang,
    onChange,
    getAlphabetPhonetics
  };
})();