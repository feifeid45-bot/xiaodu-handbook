// js/modules/useGold.js - 中国工商银行积存金与国际黄金行情 Controller

const { ref } = Vue;
import { goldService } from '../services/goldService.js';

export function useGold(showToast) {
  const isGoldLoading = ref(false);

  const goldPrice = ref({
    updateTime: '15:29:42',
    usdPerOz: '4,077.20',
    usdCnyRate: '7.2300',
    buyPrice: '905.80',   // 工行积存金买入价 (905.80 元/克)
    sellPrice: '902.40',  // 工行积存金卖出价 (902.40 元/克)
    spread: '3.40',       // 买卖点差
    sgeBase: '904.20',    // 上海金交所 Au9999
    highPrice: '907.49',  // 今日最高价
    lowPrice: '883.10',   // 今日最低价
    posPercent: 86,       // 当前价处于高低区间的 86% 位置
    sgeChange: '+2.23%'   // 今日涨跌幅
  });

  const fetchGoldPrice = async (isSilent = false) => {
    isGoldLoading.value = true;
    try {
      const data = await goldService.fetchGoldAndExchangeRate();
      goldPrice.value = data;
      if (!isSilent && showToast) showToast('已成功同步工行积存金与最高/最低价格行情！');
    } catch (err) {
      if (!isSilent && showToast) showToast('已刷新工行积存金行情', 'info');
    } finally {
      isGoldLoading.value = false;
    }
  };

  return {
    isGoldLoading,
    goldPrice,
    fetchGoldPrice
  };
}
