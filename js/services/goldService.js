// js/services/goldService.js - 国际金价与国内大盘汇率实时转换服务

export const goldService = {
  async fetchGoldAndExchangeRate() {
    let priceUSD = 2415.50; // 默认基准现货黄金价 (USD/oz)
    let usdCny = 7.23;

    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU');
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        if (goldData && goldData.price && goldData.price > 1000 && goldData.price < 3500) {
          priceUSD = goldData.price;
        }
      }
    } catch (e) {
      console.warn('实时金价 API 暂不可用，使用 2026 最新大盘基准价');
    }

    try {
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        if (rateData && rateData.rates && rateData.rates.CNY) {
          usdCny = rateData.rates.CNY;
        }
      }
    } catch (e) {
      console.warn('实时汇率 API 暂不可用，使用基准汇率 7.23');
    }

    // 1 盎司 = 31.1034768 克
    const cnyGram = (priceUSD * usdCny) / 31.1034768;

    return {
      updateTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      usdPerOz: priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      usdCnyRate: usdCny.toFixed(4),
      cnyPerGram: cnyGram.toFixed(1),
      au999: (cnyGram + 15).toFixed(1),
      jewelryGold: (cnyGram + 145).toFixed(1)
    };
  }
};
