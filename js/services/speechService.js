// js/services/speechService.js - 英语语音发音强力朗读服务 (双引擎容错 + 本地 WebSpeech 强复位)

export const speechService = {
  playWord(word, accent = 'us') {
    if (!word) return;
    const cleanWord = String(word).trim().toLowerCase();

    // 1. 网络音频引擎 (有道高音质真人音频)
    const type = accent === 'uk' ? 1 : 2;
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&type=${type}`;
    
    let isAudioPlayed = false;

    try {
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isAudioPlayed = true;
        }).catch((err) => {
          console.warn('网络 Audio 播放被拦截，切换 WebSpeech 引擎:', err);
          this.playWebSpeech(cleanWord, accent);
        });
      }
    } catch (e) {
      console.warn('Audio 对象初始化失败，切换 WebSpeech 引擎:', e);
      this.playWebSpeech(cleanWord, accent);
    }

    // 2. 超时防死锁：若网络音频 200ms 内未播放，联动触发 Web Speech 原生补响
    setTimeout(() => {
      if (!isAudioPlayed) {
        this.playWebSpeech(cleanWord, accent);
      }
    }, 200);
  },

  playWebSpeech(word, accent = 'us') {
    if (!('speechSynthesis' in window)) return;
    try {
      // 强复位：解决 iOS Safari 浏览器 speechSynthesis 挂起暂停问题
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // 终止前一次

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Web Speech API 播放异常:', err);
    }
  }
};
