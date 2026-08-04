// js/modules/useGold.js - 实时金价与汇率转换解耦 Controller

const { ref } = Vue;
import { goldService } from '../services/goldService.js';

export function useGold(showToast) {
  const isGoldLoading = ref(false);
  const goldRefreshInterval = ref(10);
  const goldPrice = ref({
    updateTime: '加载中...',
    usdPerOz: '4,058.50',
    usdCnyRate: '7.23',
    cnyPerGram: '943.4',
    au999: '958.0',
    jewelryGold: '1,098.0'
  });

  const fetchGoldPrice = async () => {
    isGoldLoading.value = true;
    try {
      const data = await goldService.fetchGoldAndExchangeRate();
      goldPrice.value = data;
      if (showToast) showToast('国际金价实时同步完成！');
    } catch (err) {
      if (showToast) showToast('使用基准金价数据', 'error');
    } finally {
      isGoldLoading.value = false;
    }
  };

  return {
    isGoldLoading,
    goldRefreshInterval,
    goldPrice,
    fetchGoldPrice
  };
}
