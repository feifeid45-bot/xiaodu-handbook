// js/modules/useExpense.js - 极简记账解耦 Controller (超强兼容防为空 + 宽泛月份匹配 + 显示设置)

const { ref, computed, watch } = Vue;
import { EXPENSE_CATEGORIES } from '../config.js';
import { storageService } from '../services/storageService.js';

export function useExpense(showToast) {
  const expenses = ref(storageService.get(storageService.KEYS.EXPENSES, []));
  const monthlyBudget = ref(storageService.getRaw(storageService.KEYS.BUDGET, '2000'));
  const categories = EXPENSE_CATEGORIES;

  const newExpense = ref({
    amount: '',
    category: '餐饮',
    remark: ''
  });

  watch(expenses, (val) => {
    storageService.set(storageService.KEYS.EXPENSES, val);
  }, { deep: true });

  watch(monthlyBudget, (val) => {
    storageService.setRaw(storageService.KEYS.BUDGET, val);
  });

  const getCategoryIcon = (catName) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.icon : '📦';
  };

  const selectCategory = (catName) => {
    newExpense.value.category = catName;
  };

  // 1. 全站总账单金额 (所有历史记录总和)
  const totalExpensesAmount = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return 0;
    return expenses.value.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  });

  // 2. 本月账单金额 (兼容各类日期格式 2026-08-05 / 2026/08/05)
  const currentMonthExpensesAmount = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return 0;
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    return expenses.value
      .filter(item => {
        if (!item || !item.date) return true; // 保底全算
        const dateStr = String(item.date).replace(/\//g, '-');
        const parts = dateStr.split('-');
        if (parts.length >= 2) {
          const itemYear = parseInt(parts[0]);
          const itemMonth = parseInt(parts[1]);
          return itemYear === curYear && itemMonth === curMonth;
        }
        return true;
      })
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  });

  // 3. 账单明细流水记录列表 (按时间降序倒序排列，优先展示最新的)
  const currentMonthExpenses = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return [];
    return [...expenses.value].sort((a, b) => (b.id || 0) - (a.id || 0));
  });

  const setBudget = () => {
    const val = prompt('请输入您的每月预算目标金额 (元):', monthlyBudget.value);
    if (val !== null && !isNaN(val) && Number(val) > 0) {
      monthlyBudget.value = String(val);
      if (showToast) showToast(`预算目标已设为: ¥${val}`);
    }
  };

  const addExpense = () => {
    if (!newExpense.value.amount || newExpense.value.amount <= 0) {
      if (showToast) showToast('请输入有效的支出金额', 'error');
      return;
    }

    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const item = {
      id: Date.now(),
      amount: Number(newExpense.value.amount).toFixed(2),
      category: newExpense.value.category || '餐饮',
      remark: (newExpense.value.remark || '').trim(),
      date: dateStr,
      time: timeStr
    };

    if (!Array.isArray(expenses.value)) expenses.value = [];
    expenses.value.unshift(item);

    // 重置表单
    newExpense.value.amount = '';
    newExpense.value.remark = '';

    if (showToast) showToast(`成功保存支出: ¥${item.amount} (${item.category})`);
  };

  const deleteExpense = (id) => {
    if (!Array.isArray(expenses.value)) return;
    expenses.value = expenses.value.filter(item => item.id !== id);
    if (showToast) showToast('已删除该笔支出记录');
  };

  return {
    expenses,
    monthlyBudget,
    categories,
    newExpense,
    totalExpensesAmount,
    currentMonthExpensesAmount,
    currentMonthExpenses,
    getCategoryIcon,
    selectCategory,
    setBudget,
    addExpense,
    deleteExpense
  };
}
