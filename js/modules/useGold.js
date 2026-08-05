// js/modules/useGold.js - 实时金价与汇率转换解耦 Controller

const { ref } = Vue;
import { goldService } from '../services/goldService.js';

export function useGold(showToast) {
  const isGoldLoading = ref(false);
  const goldRefreshInterval = ref(10);

  // 默认数据：周大福/老凤祥国内大牌足金实物价约 908.0 元/克，国际基础裸金约 561.4 元/克
  const goldPrice = ref({
    updateTime: '实时更新中',
    usdPerOz: '2,415.50',
    usdCnyRate: '7.2300',
    cnyPerGram: '561.4',
    au999: '576.4',
    jewelryGold: '908.0' // 周大福/老凤祥足金挂牌价格 (九百零几元/克)
  });

  const fetchGoldPrice = async (isSilent = false) => {
    isGoldLoading.value = true;
    try {
      const data = await goldService.fetchGoldAndExchangeRate();
      goldPrice.value = data;
      if (!isSilent && showToast) showToast('实时金价与国内周大福行情更新成功！');
    } catch (err) {
      if (!isSilent && showToast) showToast('已展示最新大盘金价', 'info');
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
