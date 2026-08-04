// js/services/goldService.js - 国际金价与汇率服务

export const goldService = {
  async fetchGoldAndExchangeRate() {
    const goldRes = await fetch('https://api.gold-api.com/price/XAU');
    const goldData = await goldRes.json();

    let usdCny = 7.23;
    try {
      const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
      const rateData = await rateRes.json();
      if (rateData && rateData.rates && rateData.rates.CNY) {
        usdCny = rateData.rates.CNY;
      }
    } catch (e) {
      console.warn('使用基准默认汇率 7.23');
    }

    if (goldData && goldData.price) {
      const priceUSD = goldData.price;
      const cnyGram = (priceUSD * usdCny) / 31.1034768;

      return {
        updateTime: new Date().toLocaleTimeString('zh-CN'),
        usdPerOz: priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        usdCnyRate: usdCny.toFixed(4),
        cnyPerGram: cnyGram.toFixed(1),
        au999: (cnyGram + 15).toFixed(1),
        jewelryGold: (cnyGram + 150).toFixed(1)
      };
    }
    throw new Error('Gold price data error');
  }
};
