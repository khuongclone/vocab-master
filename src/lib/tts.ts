// Browser Web Speech API TTS
export function speakWord(word: string, lang: string = 'en-US'): void {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;
  
  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
    || voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) utterance.voice = englishVoice;
  
  window.speechSynthesis.speak(utterance);
}
