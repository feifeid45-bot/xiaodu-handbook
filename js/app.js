// js/app.js - 应用主装配与生命周期入口

const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

import { NAV_ITEMS } from './config.js';
import { storageService } from './services/storageService.js';

import { useWeather } from './modules/useWeather.js';
import { useTodo } from './modules/useTodo.js';
import { useHabit } from './modules/useHabit.js';
import { useExpense } from './modules/useExpense.js';
import { useEnglish } from './modules/useEnglish.js';
import { useGold } from './modules/useGold.js';
import { useWeight } from './modules/useWeight.js';

createApp({
  setup() {
    // 全局基础控制
    const activeTab = ref('weather');
    const sidebarCollapsed = ref(false);
    const mobileMenuOpen = ref(false);
    const isDarkMode = ref(false);
    const currentTime = ref('');
    const showMobileQrModal = ref(false);
    const showBackupModal = ref(false);

    const navItems = NAV_ITEMS;
    const currentNav = computed(() => navItems.find(i => i.id === activeTab.value) || navItems[0]);

    //  Toast 消息组件 (包含首屏 3 秒静默锁，彻底消除开屏打卡弹窗)
    const isBooting = ref(true);
    setTimeout(() => { isBooting.value = false; }, 3000);

    const toast = ref({ show: false, msg: '', type: 'info' });
    const showToast = (msg, type = 'info') => {
      if (isBooting.value) return; // 开屏静默拦截，绝对零弹窗
      toast.value = { show: true, msg, type };
      setTimeout(() => { toast.value.show = false; }, 2500);
    };

    // 时间转换
    const todayDateObj = new Date();
    const todayFormatted = `${todayDateObj.getFullYear()}-${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;
    
    const updateClock = () => {
      const d = new Date();
      currentTime.value = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    setInterval(updateClock, 1000);
    updateClock();

    // 挂载 7 大子模块 Controller
    const weatherModule = useWeather(showToast);
    const todoModule = useTodo(todayFormatted, showToast);
    const habitModule = useHabit(todayFormatted, showToast);
    const expenseModule = useExpense(todayFormatted, showToast);
    const englishModule = useEnglish(showToast);
    const goldModule = useGold(showToast);
    const weightModule = useWeight(todayDateObj, showToast);

    const switchTab = (tabId) => {
      activeTab.value = tabId;
      mobileMenuOpen.value = false;
      if (tabId === 'weather') {
        setTimeout(() => weatherModule.renderHourlyChart(), 100);
      }
      if (tabId === 'weight') {
        setTimeout(() => weightModule.renderWeightChart(), 100);
      }
    };

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      nextTick(() => {
        if (activeTab.value === 'weather') weatherModule.renderHourlyChart();
        if (activeTab.value === 'weight') weightModule.renderWeightChart();
      });
    };

    // 本地数据备份与恢复
    const exportDataJSON = () => {
      const allData = {
        version: '3.5-architect',
        exportTime: new Date().toLocaleString('zh-CN'),
        todos: todoModule.todos.value,
        habits: habitModule.habits.value,
        expenses: expenseModule.expenses.value,
        weights: weightModule.weights.value,
        monthlyBudget: expenseModule.monthlyBudget.value,
        targetWeight: weightModule.targetWeight.value
      };
      storageService.exportJSON(allData, `小杜小杜_数据备份_${todayFormatted}.json`);
      showToast('数据备份文件已导出成功！');
    };

    const importDataJSON = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.todos) { todoModule.todos.value = data.todos; storageService.set(storageService.KEYS.TODOS, data.todos); }
          if (data.habits) { habitModule.habits.value = data.habits; storageService.set(storageService.KEYS.HABITS, data.habits); }
          if (data.expenses) { expenseModule.expenses.value = data.expenses; storageService.set(storageService.KEYS.EXPENSES, data.expenses); }
          if (data.weights) { weightModule.weights.value = data.weights; storageService.set(storageService.KEYS.WEIGHTS, data.weights); }
          if (data.monthlyBudget) { expenseModule.monthlyBudget.value = data.monthlyBudget; storageService.setRaw(storageService.KEYS.BUDGET, data.monthlyBudget); }
          if (data.targetWeight) { weightModule.targetWeight.value = data.targetWeight; storageService.setRaw(storageService.KEYS.TARGET_WEIGHT, data.targetWeight); }

          weightModule.renderWeightChart();
          showBackupModal.value = false;
          showToast('数据已从备份恢复成功！');
        } catch (err) {
          showToast('备份文件格式不合规，恢复失败', 'error');
        }
      };
      reader.readAsText(file);
    };

    const resetAllData = () => {
      if (confirm('确定要清空所有数据吗？建议先导出备份！')) {
        storageService.clearAll();
        location.reload();
      }
    };

    // 监听标签页切换与渲染
    watch(activeTab, (newTab) => {
      if (newTab === 'weather') weatherModule.renderHourlyChart();
      if (newTab === 'weight') weightModule.renderWeightChart();
    });

    // 监听 QR 码生成
    watch(showMobileQrModal, (val) => {
      if (val) {
        nextTick(() => {
          const qrEl = document.getElementById('qrcode');
          if (qrEl) {
            qrEl.innerHTML = '';
            new QRCode(qrEl, {
              text: 'http://192.168.124.20:8888',
              width: 140,
              height: 140,
              colorDark: "#78350f",
              colorLight: "#fffdf0",
              correctLevel: QRCode.CorrectLevel.H
            });
          }
        });
      }
    });

    onMounted(() => {
      weatherModule.fetchWeatherData(null, null, null, true);
      goldModule.fetchGoldPrices(true);
      if (activeTab.value === 'weight') weightModule.renderWeightChart();
    });

    return {
      activeTab,
      sidebarCollapsed,
      mobileMenuOpen,
      isDarkMode,
      currentTime,
      navItems,
      currentNav,
      toast,
      todayFormatted,
      showMobileQrModal,
      showBackupModal,

      switchTab,
      toggleSidebar,
      toggleDarkMode,

      // 7 大模块聚合暴露
      ...weatherModule,
      ...todoModule,
      ...habitModule,
      ...expenseModule,
      english: englishModule,
      ...englishModule,
      ...goldModule,
      ...weightModule,

      // 备份导出
      exportDataJSON,
      importDataJSON,
      resetAllData
    };
  }
}).mount('#app');
