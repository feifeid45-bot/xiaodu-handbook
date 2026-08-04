// js/modules/useHabit.js - 每日计划打卡解耦 Controller

const { ref, computed } = Vue;
import { DEFAULT_HABITS } from '../config.js';
import { storageService } from '../services/storageService.js';

export function useHabit(todayFormatted, showToast) {
  const habits = ref(storageService.get(storageService.KEYS.HABITS, DEFAULT_HABITS));
  const showAddHabitModal = ref(false);
  const newHabit = ref({ name: '', icon: '🎯', duration: 30 });

  habits.value.forEach(h => {
    h.completedToday = h.lastCheckDate === todayFormatted;
  });

  const habitStats = computed(() => {
    const completed = habits.value.filter(h => h.completedToday).length;
    const total = habits.value.length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { todayCompleted: completed, rate };
  });

  const toggleHabitCheck = (habit) => {
    if (habit.completedToday) {
      habit.completedToday = false;
      habit.lastCheckDate = '';
      if (habit.streak > 0) habit.streak--;
      showToast('已取消打卡');
    } else {
      habit.completedToday = true;
      habit.lastCheckDate = todayFormatted;
      habit.streak++;
      showToast('打卡成功！太棒啦 🎉');
    }
    storageService.set(storageService.KEYS.HABITS, habits.value);
  };

  const openAddHabitModal = () => {
    newHabit.value = { name: '', icon: '🎯', duration: 30 };
    showAddHabitModal.value = true;
  };

  const saveHabit = () => {
    if (!newHabit.value.name.trim()) {
      showToast('请输入计划名称', 'error');
      return;
    }
    habits.value.push({
      id: Date.now(),
      name: newHabit.value.name.trim(),
      icon: newHabit.value.icon || '🎯',
      duration: newHabit.value.duration || 30,
      streak: 0,
      lastCheckDate: '',
      completedToday: false
    });
    storageService.set(storageService.KEYS.HABITS, habits.value);
    showAddHabitModal.value = false;
    showToast('自定义计划创建成功！');
  };

  const deleteHabit = (id) => {
    habits.value = habits.value.filter(h => h.id !== id);
    storageService.set(storageService.KEYS.HABITS, habits.value);
    showToast('计划已移除');
  };

  return {
    habits,
    habitStats,
    showAddHabitModal,
    newHabit,
    toggleHabitCheck,
    openAddHabitModal,
    saveHabit,
    deleteHabit
  };
}
