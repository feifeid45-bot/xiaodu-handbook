// js/modules/useEnglish.js - 英语学习解耦 Controller (支持基于当天的日期算法自动轮换每日 10 词)

const { ref, computed } = Vue;
import { EXTENDED_WORD_BANK } from '../config.js';
import { speechService } from '../services/speechService.js';

export function useEnglish(showToast) {
  // 基于当天真实日期 (YYYY-MM-DD) 计算每日专属 10 个单词的伪随机算法
  const getDaily10Words = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const totalBank = EXTENDED_WORD_BANK.length;
    const startIndex = seed % totalBank;

    const dailyWords = [];
    for (let i = 0; i < 10; i++) {
      const idx = (startIndex + i * 3) % totalBank;
      dailyWords.push(EXTENDED_WORD_BANK[idx]);
    }
    return dailyWords;
  };

  const dailyWords = ref(getDaily10Words());
  const selectedWordIndex = ref(0);

  const currentWord = computed(() => dailyWords.value[selectedWordIndex.value] || dailyWords.value[0]);

  const prevWord = () => {
    if (selectedWordIndex.value > 0) {
      selectedWordIndex.value--;
    } else {
      selectedWordIndex.value = dailyWords.value.length - 1;
    }
  };

  const nextWord = () => {
    if (selectedWordIndex.value < dailyWords.value.length - 1) {
      selectedWordIndex.value++;
    } else {
      selectedWordIndex.value = 0;
    }
  };

  const playAudio = (type = 'us') => {
    const word = currentWord.value.word;
    speechService.playWord(word, type);
    if (showToast) {
      const typeName = type === 'us' ? '美音' : '英音';
      showToast(`📢 正在朗读 [${word}] (${typeName})`);
    }
  };

  return {
    dailyWords,
    selectedWordIndex,
    currentWord,
    prevWord,
    nextWord,
    playAudio
  };
}
