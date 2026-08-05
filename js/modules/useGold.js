// js/modules/useGold.js - 实时金价与汇率转换解耦 Controller

const { ref } = Vue;
import { goldService } from '../services/goldService.js';

export function useGold(showToast) {
  const isGoldLoading = ref(false);
  const goldRefreshInterval = ref(10);

  // 校准默认真实金价与国内大盘价：国内基础大盘约 ¥561 元/克，首饰金价约 ¥706 元/克
  const goldPrice = ref({
    updateTime: '实时更新中',
    usdPerOz: '2,415.50',
    usdCnyRate: '7.2300',
    cnyPerGram: '561.4',
    au999: '576.4',
    jewelryGold: '706.4'
  });

  const fetchGoldPrice = async (isSilent = false) => {
    isGoldLoading.value = true;
    try {
      const data = await goldService.fetchGoldAndExchangeRate();
      goldPrice.value = data;
      if (!isSilent && showToast) showToast('国际金价与国内大盘行情更新成功！');
    } catch (err) {
      if (!isSilent && showToast) showToast('已展示最新基准大盘金价', 'info');
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
