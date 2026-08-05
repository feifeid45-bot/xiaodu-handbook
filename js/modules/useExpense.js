// js/modules/useExpense.js - 极简记账解耦 Controller (支持总账单、本月账单、当月总流水与预算设置)

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

  // 1. 全站总账单金额
  const totalExpensesAmount = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return 0;
    return expenses.value.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  });

  // 2. 本月账单金额
  const currentMonthExpensesAmount = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return 0;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses.value
      .filter(item => item && item.date && item.date.startsWith(currentMonthStr))
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  });

  // 3. 当月总流水记录
  const currentMonthExpenses = computed(() => {
    if (!expenses.value || !Array.isArray(expenses.value)) return [];
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses.value.filter(item => item && item.date && item.date.startsWith(currentMonthStr));
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
    const dateStr = d.toISOString().substring(0, 10);
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

    newExpense.value.amount = '';
    newExpense.value.remark = '';

    if (showToast) showToast(`成功记一笔: ¥${item.amount} (${item.category})`);
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
    setBudget,
    addExpense,
    deleteExpense
  };
}
