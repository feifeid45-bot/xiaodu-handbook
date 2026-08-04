// js/services/speechService.js - 单词发音与语音服务

export const speechService = {
  speak(text, accent = 'us', onEnd = () => {}, onError = () => {}) {
    const type = accent === 'uk' ? 1 : 2;
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${type}`;
    const audio = new Audio(audioUrl);

    audio.play().then(() => {
      audio.onended = onEnd;
    }).catch(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
        utterance.rate = 0.9;
        utterance.onend = onEnd;
        utterance.onerror = onError;
        window.speechSynthesis.speak(utterance);
      } else {
        onError();
      }
    });
  }
};
