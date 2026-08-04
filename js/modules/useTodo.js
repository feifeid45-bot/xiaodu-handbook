// js/modules/useTodo.js - 日历待办事项解耦 Controller

const { ref, computed } = Vue;
import { storageService } from '../services/storageService.js';

export function useTodo(todayFormatted, showToast) {
  const todayDateObj = new Date();
  const calendarYear = ref(todayDateObj.getFullYear());
  const calendarMonth = ref(todayDateObj.getMonth());
  const selectedDate = ref(todayFormatted);

  const todos = ref(storageService.get(storageService.KEYS.TODOS, []));
  const showAddTodoModal = ref(false);
  const newTodo = ref({ title: '', priority: 'normal', time: '', remark: '' });

  const calendarDays = computed(() => {
    const year = calendarYear.value;
    const month = calendarMonth.value;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ dayNum: '', inMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasTodo = todos.value.some(t => t.date === dateStr && !t.completed);
      days.push({
        dayNum: d,
        inMonth: true,
        dateStr,
        isToday: dateStr === todayFormatted,
        hasTodo
      });
    }
    return days;
  });

  const selectedDateTodos = computed(() => {
    const list = todos.value.filter(t => t.date === selectedDate.value);
    const now = new Date();
    return list.map(t => {
      let isOverdue = false;
      if (t.time && !t.completed) {
        const todoDateTime = new Date(`${t.date}T${t.time}`);
        isOverdue = todoDateTime < now;
      }
      return { ...t, isOverdue };
    });
  });

  const todoStats = computed(() => {
    const todayList = todos.value.filter(t => t.date === todayFormatted);
    const total = todayList.length;
    const completed = todayList.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { todayTotal: total, completed, pending, rate };
  });

  const selectCalendarDate = (day) => {
    if (day.inMonth) selectedDate.value = day.dateStr;
  };

  const changeMonth = (delta) => {
    let m = calendarMonth.value + delta;
    let y = calendarYear.value;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    calendarMonth.value = m;
    calendarYear.value = y;
  };

  const resetToToday = () => {
    calendarYear.value = todayDateObj.getFullYear();
    calendarMonth.value = todayDateObj.getMonth();
    selectedDate.value = todayFormatted;
  };

  const openAddTodoModal = () => {
    newTodo.value = { title: '', priority: 'normal', time: '', remark: '' };
    showAddTodoModal.value = true;
  };

  const saveTodo = () => {
    if (!newTodo.value.title.trim()) {
      showToast('请填写入事项名称哦', 'error');
      return;
    }
    todos.value.push({
      id: Date.now(),
      date: selectedDate.value,
      title: newTodo.value.title.trim(),
      priority: newTodo.value.priority,
      time: newTodo.value.time,
      remark: newTodo.value.remark.trim(),
      completed: false
    });
    storageService.set(storageService.KEYS.TODOS, todos.value);
    showAddTodoModal.value = false;
    showToast('待办事项添加成功！');
  };

  const toggleTodoStatus = (todo) => {
    todo.completed = !todo.completed;
    storageService.set(storageService.KEYS.TODOS, todos.value);
  };

  const deleteTodo = (id) => {
    todos.value = todos.value.filter(t => t.id !== id);
    storageService.set(storageService.KEYS.TODOS, todos.value);
    showToast('待办事项已删除');
  };

  const clearCompletedTodos = () => {
    todos.value = todos.value.filter(t => !(t.date === selectedDate.value && t.completed));
    storageService.set(storageService.KEYS.TODOS, todos.value);
    showToast('已清理该日期已完成待办');
  };

  return {
    calendarYear,
    calendarMonth,
    calendarDays,
    selectedDate,
    todos,
    selectedDateTodos,
    todoStats,
    showAddTodoModal,
    newTodo,
    selectCalendarDate,
    changeMonth,
    resetToToday,
    openAddTodoModal,
    saveTodo,
    toggleTodoStatus,
    deleteTodo,
    clearCompletedTodos
  };
}
