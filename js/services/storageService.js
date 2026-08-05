// js/services/storageService.js - 本地存储与 JSON 备份导出恢复服务

const KEYS = {
  TODOS: 'butter_todos_v1',
  HABITS: 'butter_habits_v1',
  EXPENSES: 'butter_expenses_v1',
  WEIGHTS: 'butter_weights_v1',
  BUDGET: 'butter_budget_v1',
  TARGET_WEIGHT: 'butter_target_weight_v1'
};

// 兼容迁移映射：如果新 key 为空，自动检查历史所有存过的旧 key
const LEGACY_KEYS = {
  TODOS: ['butter_todos', 'xiaodu_todos', 'todos'],
  HABITS: ['butter_habits', 'xiaodu_habits', 'habits'],
  EXPENSES: ['butter_expenses', 'xiaodu_expenses', 'expenses'],
  WEIGHTS: ['butter_weights', 'xiaodu_weights', 'weights'],
  BUDGET: ['butter_budget', 'budget'],
  TARGET_WEIGHT: ['butter_target_weight', 'target_weight']
};

export const storageService = {
  get(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      if (data && data !== '[]' && data !== '{}') {
        return JSON.parse(data);
      }

      // 强力数据保障机制：若主 key 为空，全盘自动恢复历史存过的旧 Key 数据，绝不丢数据！
      const keyType = Object.keys(KEYS).find(k => KEYS[k] === key);
      if (keyType && LEGACY_KEYS[keyType]) {
        for (const oldKey of LEGACY_KEYS[keyType]) {
          const oldData = localStorage.getItem(oldKey);
          if (oldData && oldData !== '[]' && oldData !== '{}') {
            console.log(`[Storage Data Restored] 成功找回历史备份数据: ${oldKey} -> ${key}`);
            const parsed = JSON.parse(oldData);
            // 自动同步迁移到新 key 永久保存
            localStorage.setItem(key, oldData);
            return parsed;
          }
        }
      }

      return defaultValue;
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
    const val = localStorage.getItem(key);
    if (val) return val;

    const keyType = Object.keys(KEYS).find(k => KEYS[k] === key);
    if (keyType && LEGACY_KEYS[keyType]) {
      for (const oldKey of LEGACY_KEYS[keyType]) {
        const oldVal = localStorage.getItem(oldKey);
        if (oldVal) {
          localStorage.setItem(key, oldVal);
          return oldVal;
        }
      }
    }
    return defaultValue;
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
