// js/modules/useEnglish.js - 英语学习 2.0 (支持 2000+ 词库、已学习标记、已记住自动过滤屏蔽与复习本)

const { ref, computed, watch } = Vue;
import { ENGLISH_WORD_BANK_2000 } from '../data/englishWordBank.js';
import { speechService } from '../services/speechService.js';
import { storageService } from '../services/storageService.js';

const STORAGE_KEYS = {
  LEARNED: 'xiaodu_english_learned_v1',
  MASTERED: 'xiaodu_english_mastered_v1'
};

const DEFAULT_FALLBACK_WORD = {
  word: 'Learning',
  phonetic: 'ˈlɜːrnɪŋ',
  translation: '学习；知识',
  category: '核心实用',
  example: 'Continuous learning opens up new possibilities.'
};

export function useEnglish(showToast) {
  // 1. 已学习与已记住单词集合存储
  const learnedWords = ref(storageService.get(STORAGE_KEYS.LEARNED, []));
  const masteredWords = ref(storageService.get(STORAGE_KEYS.MASTERED, []));

  watch(learnedWords, (val) => storageService.set(STORAGE_KEYS.LEARNED, val), { deep: true });
  watch(masteredWords, (val) => storageService.set(STORAGE_KEYS.MASTERED, val), { deep: true });

  // 2. 基于日期与斩词过滤的 10 词推荐算法
  const getDaily10Words = () => {
    try {
      const masteredSet = new Set(masteredWords.value || []);
      const availablePool = ENGLISH_WORD_BANK_2000.filter(item => item && item.word && !masteredSet.has(item.word));

      if (availablePool.length === 0) {
        return ENGLISH_WORD_BANK_2000.slice(0, 10);
      }

      const todayStr = new Date().toISOString().substring(0, 10);
      let hash = 0;
      for (let i = 0; i < todayStr.length; i++) {
        hash = (hash << 5) - hash + todayStr.charCodeAt(i);
        hash |= 0;
      }
      const seed = Math.abs(hash);

      const totalPool = availablePool.length;
      const startIndex = seed % totalPool;

      const dailyWords = [];
      for (let i = 0; i < Math.min(10, totalPool); i++) {
        const idx = (startIndex + i * 3) % totalPool;
        dailyWords.push(availablePool[idx]);
      }
      return dailyWords.length > 0 ? dailyWords : ENGLISH_WORD_BANK_2000.slice(0, 10);
    } catch (err) {
      console.warn('getDaily10Words 异常，触发降级:', err);
      return ENGLISH_WORD_BANK_2000.slice(0, 10);
    }
  };

  const dailyWords = ref(getDaily10Words());
  const selectedWordIndex = ref(0);
  const activeTabSub = ref('study'); // 'study' 背词 | 'mastered' 已斩词库
  const isMeaningRevealed = ref(true);

  // 显式响应式切换 Tab 函数
  const switchSubTab = (tabName) => {
    activeTabSub.value = tabName;
  };

  // 强力零空指针保底 computed
  const currentWord = computed(() => {
    if (dailyWords.value && dailyWords.value.length > 0) {
      const wordObj = dailyWords.value[selectedWordIndex.value] || dailyWords.value[0];
      return wordObj || DEFAULT_FALLBACK_WORD;
    }
    return DEFAULT_FALLBACK_WORD;
  });

  const isCurrentLearned = computed(() => {
    if (!currentWord.value || !currentWord.value.word) return false;
    return learnedWords.value.includes(currentWord.value.word);
  });

  const isCurrentMastered = computed(() => {
    if (!currentWord.value || !currentWord.value.word) return false;
    return masteredWords.value.includes(currentWord.value.word);
  });

  const toggleLearned = (wordStr = null) => {
    const targetWord = wordStr || (currentWord.value ? currentWord.value.word : null);
    if (!targetWord) return;

    const idx = learnedWords.value.indexOf(targetWord);
    if (idx > -1) {
      learnedWords.value.splice(idx, 1);
      if (showToast) showToast(`已取消打卡 [${targetWord}]`);
    } else {
      learnedWords.value.push(targetWord);
      if (showToast) showToast(`📖 标记 [${targetWord}] 为今日已学习！`);
    }
  };

  const toggleMastered = (wordStr = null) => {
    const targetWord = wordStr || (currentWord.value ? currentWord.value.word : null);
    if (!targetWord) return;

    const idx = masteredWords.value.indexOf(targetWord);
    if (idx > -1) {
      masteredWords.value.splice(idx, 1);
      if (showToast) showToast(`已将 [${targetWord}] 移出斩词本，恢复推荐`);
    } else {
      masteredWords.value.push(targetWord);
      if (!learnedWords.value.includes(targetWord)) learnedWords.value.push(targetWord);
      if (showToast) showToast(`✨ 已将 [${targetWord}] 收入斩词本！以后轮询不再出现`);
      
      dailyWords.value = getDaily10Words();
      if (selectedWordIndex.value >= dailyWords.value.length) selectedWordIndex.value = 0;
    }
  };

  const prevWord = () => {
    if (selectedWordIndex.value > 0) {
      selectedWordIndex.value--;
    } else {
      selectedWordIndex.value = dailyWords.value.length - 1;
    }
    isMeaningRevealed.value = true;
  };

  const nextWord = () => {
    if (selectedWordIndex.value < dailyWords.value.length - 1) {
      selectedWordIndex.value++;
    } else {
      selectedWordIndex.value = 0;
    }
    isMeaningRevealed.value = true;
  };

  const playAudio = (type = 'us') => {
    if (!currentWord.value || !currentWord.value.word) return;
    const word = currentWord.value.word;
    speechService.playWord(word, type);
    if (showToast) {
      const typeName = type === 'us' ? '美音' : '英音';
      showToast(`📢 [${word}] (${typeName})`);
    }
  };

  const masteredWordDetails = computed(() => {
    const masteredSet = new Set(masteredWords.value || []);
    return ENGLISH_WORD_BANK_2000.filter(item => item && item.word && masteredSet.has(item.word));
  });

  return {
    dailyWords,
    selectedWordIndex,
    currentWord,
    activeTabSub,
    switchSubTab,
    isMeaningRevealed,
    learnedWords,
    masteredWords,
    masteredWordDetails,
    isCurrentLearned,
    isCurrentMastered,
    toggleLearned,
    toggleMastered,
    prevWord,
    nextWord,
    playAudio,
    totalBankCount: ENGLISH_WORD_BANK_2000.length
  };
}
