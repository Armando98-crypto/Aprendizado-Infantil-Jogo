/**
 * Wrapper para a Web Speech API (SpeechSynthesisUtterance).
 * Pronuncia texto em português brasileiro sem ficheiros de áudio.
 * Tom animado e claro, adequado a crianças (pitch elevado, ritmo pausado).
 */

const Speech = (function () {
  const PREFERRED_LANG = 'pt-BR';
  const RATE = 0.9;
  const PITCH = 1.45;

  let cachedVoice = null;

  function loadVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.getVoices();
    cachedVoice = null;
  }

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  /** Indica se o nome da voz sugere voz feminina (mais acolhedora para crianças). */
  function isLikelyFemaleVoice(voice) {
    const hint = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    return /female|feminina|woman|maria|luciana|francisca|vitória|vitoria|fernanda|daniela|heloisa|heloísa|camila|google português do brasil/i.test(hint);
  }

  /** Filtra vozes estritamente pt-BR (aceita variantes de código). */
  function getPtBRVoices() {
    if (typeof speechSynthesis === 'undefined') return [];
    return speechSynthesis.getVoices().filter((v) => {
      const lang = v.lang.replace('_', '-').toLowerCase();
      return lang === 'pt-br';
    });
  }

  /**
   * Escolhe voz pt-BR; preferência por voz feminina.
   * Não recorre a vozes de outros idiomas.
   */
  function pickVoice(lang = PREFERRED_LANG) {
    if (cachedVoice) return cachedVoice;

    const ptBR = getPtBRVoices();
    if (ptBR.length) {
      cachedVoice = ptBR.find(isLikelyFemaleVoice) || ptBR[0];
      return cachedVoice;
    }

    if (typeof speechSynthesis !== 'undefined') {
      const ptFallback = speechSynthesis.getVoices().filter((v) =>
        v.lang.replace('_', '-').toLowerCase().startsWith('pt')
      );
      if (ptFallback.length) {
        console.warn('Voz pt-BR não encontrada; a usar voz pt genérica:', ptFallback[0].name);
        cachedVoice = ptFallback.find(isLikelyFemaleVoice) || ptFallback[0];
        return cachedVoice;
      }
      console.warn('Nenhuma voz portuguesa disponível neste browser.');
    }

    return null;
  }

  function applyUtteranceSettings(utterance, lang = PREFERRED_LANG) {
    utterance.lang = lang;
    utterance.rate = RATE;
    utterance.pitch = PITCH;

    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
  }

  /**
   * Pronuncia um texto. Cancela fala anterior para evitar sobreposição.
   */
  function speak(text, lang = PREFERRED_LANG) {
    if (SoundSettings.isMuted()) return;

    if (typeof speechSynthesis === 'undefined') {
      console.warn('Web Speech API não disponível neste browser.');
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    applyUtteranceSettings(utterance, lang);
    speechSynthesis.speak(utterance);
  }

  /**
   * Pronuncia vários textos em sequência (com pequena pausa entre eles).
   */
  function speakSequence(texts, lang = PREFERRED_LANG) {
    if (!texts.length || SoundSettings.isMuted()) return;

    if (typeof speechSynthesis === 'undefined') {
      console.warn('Web Speech API não disponível neste browser.');
      return;
    }

    speechSynthesis.cancel();

    let index = 0;

    function speakNext() {
      if (index >= texts.length || SoundSettings.isMuted()) return;

      const utterance = new SpeechSynthesisUtterance(texts[index]);
      applyUtteranceSettings(utterance, lang);

      utterance.onend = () => {
        index += 1;
        if (index < texts.length) {
          setTimeout(speakNext, 300);
        }
      };

      speechSynthesis.speak(utterance);
    }

    speakNext();
  }

  /**
   * Converte um número (0–100) para palavras em português.
   */
  function numberToWords(n) {
    const unidades = [
      'zero', 'um', 'dois', 'três', 'quatro', 'cinco',
      'seis', 'sete', 'oito', 'nove', 'dez',
      'onze', 'doze', 'treze', 'catorze', 'quinze',
      'dezesseis', 'dezessete', 'dezoito', 'dezenove'
    ];

    if (n === 100) return 'cem';
    if (n < 20) return unidades[n];

    const dezena = Math.floor(n / 10);
    const unidade = n % 10;

    const dezenas = [
      '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
      'sessenta', 'setenta', 'oitenta', 'noventa'
    ];

    if (unidade === 0) return dezenas[dezena];
    return `${dezenas[dezena]} e ${unidades[unidade]}`;
  }

  return {
    speak,
    speakSequence,
    numberToWords,
    loadVoices,
    pickVoice
  };
})();
