// js/modules/useWeight.js - 体重走势与 Chart.js 曲线可视化解耦 Controller

const { ref, computed, nextTick } = Vue;
import { DEFAULT_WEIGHTS } from '../config.js';
import { storageService } from '../services/storageService.js';

export function useWeight(todayDateObj, showToast) {
  const weights = ref(storageService.get(storageService.KEYS.WEIGHTS, DEFAULT_WEIGHTS));
  const targetWeight = ref(Number(storageService.getRaw(storageService.KEYS.TARGET_WEIGHT, '55.0')));
  const newWeight = ref({ val: null, remark: '' });
  let chartInstance = null;

  const weightStats = computed(() => {
    if (weights.value.length === 0) return { min: 0, max: 0 };
    const vals = weights.value.map(w => w.val);
    return {
      min: Math.min(...vals),
      max: Math.max(...vals)
    };
  });

  const renderWeightChart = () => {
    nextTick(() => {
      const ctx = document.getElementById('weightChart');
      if (!ctx) return;

      if (chartInstance) chartInstance.destroy();

      const labels = weights.value.map(w => w.date);
      const dataVals = weights.value.map(w => w.val);

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: '实际体重 (kg)',
              data: dataVals,
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#F59E0B'
            },
            {
              label: '目标体重 (kg)',
              data: new Array(labels.length).fill(targetWeight.value),
              borderColor: '#10B981',
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            y: {
              suggestedMin: Math.min(...dataVals, targetWeight.value) - 1,
              suggestedMax: Math.max(...dataVals, targetWeight.value) + 1
            }
          }
        }
      });
    });
  };

  const addWeight = () => {
    if (!newWeight.value.val || newWeight.value.val <= 0) {
      showToast('请输入有效体重数值', 'error');
      return;
    }
    const todayLabel = `${String(todayDateObj.getMonth() + 1).padStart(2, '0')}-${String(todayDateObj.getDate()).padStart(2, '0')}`;
    
    const existingIdx = weights.value.findIndex(w => w.date === todayLabel);
    if (existingIdx !== -1) {
      weights.value[existingIdx] = { date: todayLabel, val: Number(newWeight.value.val), remark: newWeight.value.remark };
    } else {
      weights.value.push({ date: todayLabel, val: Number(newWeight.value.val), remark: newWeight.value.remark });
    }

    storageService.set(storageService.KEYS.WEIGHTS, weights.value);
    newWeight.value = { val: null, remark: '' };
    renderWeightChart();
    showToast('体重记录已更新！');
  };

  const setTargetWeight = () => {
    const input = prompt('设置您的理想目标体重 (kg):', targetWeight.value);
    if (input && !isNaN(input)) {
      targetWeight.value = Number(input);
      storageService.setRaw(storageService.KEYS.TARGET_WEIGHT, targetWeight.value);
      renderWeightChart();
      showToast('目标体重已设定！');
    }
  };

  return {
    weights,
    targetWeight,
    newWeight,
    weightStats,
    addWeight,
    setTargetWeight,
    renderWeightChart
  };
}
