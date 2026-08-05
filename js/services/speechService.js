// js/services/speechService.js - 英语语音发音强力朗读服务 (Web Speech 原生 + 网易双引擎)

export const speechService = {
  playWord(word, accent = 'us') {
    if (!word) return;
    const cleanWord = String(word).trim().toLowerCase();

    // 1. 优先使用浏览器原生 Web Speech API (零网络延迟、iOS/Android 完美原生发音)
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // 终止前一次朗读
        const utterance = new SpeechSynthesisUtterance(cleanWord);
        utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
        utterance.rate = 0.85; // 稍微放慢，听得更清晰
        utterance.pitch = 1.0;
        
        // 绑定播放事件
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Web Speech API 播放降级:', err);
      }
    }

    // 2. 网络备用音频方案
    const type = accent === 'uk' ? 1 : 2;
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&type=${type}`;
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.warn('Audio.play 被浏览器拦截或请求失败:', e);
      });
    } catch (e) {
      console.warn('Audio 实例化异常:', e);
    }
  }
};
