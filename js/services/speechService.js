// js/services/speechService.js - 英语语音朗读服务 (有道网易语音接口 + Web Speech API 备用)

export const speechService = {
  playWord(word, accent = 'us') {
    if (!word) return;
    const cleanWord = word.trim().toLowerCase();

    // 优先使用有道高音质真人音频
    const type = accent === 'uk' ? 1 : 2;
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&type=${type}`;
    
    try {
      const audio = new Audio(audioUrl);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // 备用：若网易接口受限，自动触发 Web Speech 原生发音
          this.playWebSpeech(cleanWord, accent);
        });
      }
    } catch (e) {
      this.playWebSpeech(cleanWord, accent);
    }
  },

  playWebSpeech(word, accent = 'us') {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // 清空旧队列
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Web Speech API 朗读异常:', err);
    }
  }
};
