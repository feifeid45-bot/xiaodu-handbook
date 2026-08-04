// js/services/storageService.js - 本地存储与 JSON 备份导出恢复服务

const KEYS = {
  TODOS: 'butter_todos',
  HABITS: 'butter_habits',
  EXPENSES: 'butter_expenses',
  WEIGHTS: 'butter_weights',
  BUDGET: 'butter_budget',
  TARGET_WEIGHT: 'butter_target_weight'
};

export const storageService = {
  get(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`Storage get error for key ${key}:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Storage set error for key ${key}:`, e);
    }
  },

  getRaw(key, defaultValue) {
    return localStorage.getItem(key) || defaultValue;
  },

  setRaw(key, value) {
    localStorage.setItem(key, value);
  },

  exportJSON(allData, filename) {
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  clearAll() {
    localStorage.clear();
  },

  KEYS
};
