// js/modules/useExpense.js - 极简记账与预算解耦 Controller

const { ref, computed } = Vue;
import { EXPENSE_CATEGORIES } from '../config.js';
import { storageService } from '../services/storageService.js';

export function useExpense(todayFormatted, showToast) {
  const categories = EXPENSE_CATEGORIES;
  const rawExpenses = storageService.get(storageService.KEYS.EXPENSES, []);
  
  const expenses = ref(rawExpenses.map(e => ({
    ...e,
    date: e.date || todayFormatted,
    month: e.month || todayFormatted.substring(0, 7)
  })));

  const monthlyBudget = ref(Number(storageService.getRaw(storageService.KEYS.BUDGET, '2500')));
  const newExpense = ref({ amount: null, category: '餐饮', remark: '' });

  const expenseStats = computed(() => {
    const currentMonthPrefix = todayFormatted.substring(0, 7);

    const todaySum = expenses.value
      .filter(e => e.date === todayFormatted)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const monthSum = expenses.value
      .filter(e => e.month === currentMonthPrefix || (e.date && e.date.startsWith(currentMonthPrefix)))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const budgetPercent = monthlyBudget.value > 0 ? Math.round((monthSum / monthlyBudget.value) * 100) : 0;
    const budgetOver = monthSum > monthlyBudget.value;

    return {
      today: todaySum.toFixed(2),
      month: monthSum.toFixed(2),
      budgetPercent,
      budgetOver
    };
  });

  const addExpense = () => {
    if (!newExpense.value.amount || newExpense.value.amount <= 0) {
      showToast('请输入有效消费金额', 'error');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    expenses.value.unshift({
      id: Date.now(),
      amount: Number(newExpense.value.amount),
      category: newExpense.value.category,
      remark: newExpense.value.remark.trim(),
      date: todayFormatted,
      month: todayFormatted.substring(0, 7),
      time: timeStr
    });

    storageService.set(storageService.KEYS.EXPENSES, expenses.value);
    newExpense.value = { amount: null, category: '餐饮', remark: '' };
    showToast('支出已保存！');
  };

  const deleteExpense = (id) => {
    expenses.value = expenses.value.filter(e => e.id !== id);
    storageService.set(storageService.KEYS.EXPENSES, expenses.value);
    showToast('记录已删除');
  };

  const setBudget = () => {
    const input = prompt('设置您的月度预算金额 (元):', monthlyBudget.value);
    if (input && !isNaN(input)) {
      monthlyBudget.value = Number(input);
      storageService.setRaw(storageService.KEYS.BUDGET, monthlyBudget.value);
      showToast('预算设置成功！');
    }
  };

  const getCategoryIcon = (catName) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.icon : '💸';
  };

  return {
    categories,
    expenses,
    monthlyBudget,
    newExpense,
    expenseStats,
    addExpense,
    deleteExpense,
    setBudget,
    getCategoryIcon
  };
}
