// Browser Web Speech API TTS
export function speakWord(word: string, lang: string = 'en-US'): void {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;
  
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.startsWith('en-GB') ? 'en-GB' : 'en-US';
  const voice = voices.find(v => v.lang === langPrefix && v.name.includes('Google'))
    || voices.find(v => v.lang === langPrefix)
    || voices.find(v => v.lang.startsWith('en'));
  if (voice) utterance.voice = voice;
  
  window.speechSynthesis.speak(utterance);
}
