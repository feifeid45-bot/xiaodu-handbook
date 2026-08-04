// js/modules/useEnglish.js - 英语学习与词汇发音解耦 Controller

const { ref } = Vue;
import { WORD_BANK } from '../config.js';
import { speechService } from '../services/speechService.js';

export function useEnglish(showToast) {
  const dailyWords = ref(WORD_BANK);
  const hideChinese = ref(false);
  const speakingWord = ref('');
  const audioAccent = ref('us');

  const toggleHideChinese = () => {
    hideChinese.value = !hideChinese.value;
  };

  const speakWord = (text) => {
    speakingWord.value = text;
    speechService.speak(
      text,
      audioAccent.value,
      () => { speakingWord.value = ''; },
      () => {
        speakingWord.value = '';
        if (showToast) showToast('音频播放失败', 'error');
      }
    );
  };

  return {
    dailyWords,
    hideChinese,
    speakingWord,
    audioAccent,
    toggleHideChinese,
    speakWord
  };
}
