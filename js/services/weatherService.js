// js/services/weatherService.js - Open-Meteo 天气 API 数据服务与穿衣法则推算

export const weatherService = {
  getWeatherIconByCode(code, isNight = false) {
    if (code === 0) return isNight ? '🌙' : '☀️';
    if (code >= 1 && code <= 3) return isNight ? '☁️' : '⛅';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  },

  getOutfitSuggestion(tempMax, condition) {
    let outfitTag = '舒适休闲';
    let outfitRecommend = '';
    let rainNotice = '无需带伞 ☀️';
    let uvNotice = '常规防晒';

    if (condition.includes('雨')) {
      rainNotice = '建议带伞 ☂️';
    }

    if (tempMax >= 30) {
      outfitTag = '清凉防晒搭';
      outfitRecommend = '天气炎热！推荐轻薄透气短袖 T 恤、短裤、凉爽裙装，材质以纯棉、棉麻为佳。';
      uvNotice = '强防晒 🧴';
    } else if (tempMax >= 23) {
      outfitTag = '清爽舒适搭配';
      outfitRecommend = '气候宜人！推荐短袖 T 恤、薄款长裤/牛仔裤。早晚微风，可备一件薄外套防风。';
    } else if (tempMax >= 16) {
      outfitTag = '春秋保暖搭配';
      outfitRecommend = '气温凉爽。推荐长袖衬衫、薄款针织衫、夹克外套搭配常规牛仔裤。';
    } else {
      outfitTag = '防寒保暖搭配';
      outfitRecommend = '天气偏冷！建议穿卫衣、风衣、大衣或薄款羽绒服，注意颈部与手部保暖。';
    }

    return { outfitTag, outfitRecommend, rainNotice, uvNotice };
  },

  async fetchForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Asia%2FShanghai`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  }
};
