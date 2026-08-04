// js/modules/useWeather.js - 天气预报与 24h 墨迹风格 Canvas 绘图解耦 Controller

const { ref, nextTick } = Vue;
import { CITY_LIST } from '../config.js';
import { weatherService } from '../services/weatherService.js';

export function useWeather(showToast) {
  const isWeatherLoading = ref(false);
  const selectedCity = ref('北京');
  const cityList = CITY_LIST;

  const todayWeather = ref({
    temp: 26,
    tempMax: 29,
    tempMin: 22,
    condition: '晴朗少云',
    icon: '☀️',
    tip: '今天天气极佳，小熊提醒记得多喝水做防晒哦 🐻☀️',
    outfitTag: '清爽舒适搭配',
    outfitRecommend: '推荐短袖 T 恤、薄款长裤或休闲凉爽裙装。早晚体感舒适，户外活动备一件薄款防晒衫即可。',
    rainNotice: '无需带伞 ☀️',
    uvNotice: '中等防晒 🧴'
  });

  const hourly24Weather = ref([]);
  let hourlyChartInstance = null;

  const forecast7Days = ref([]);

  const getWeatherTextByIcon = (icon) => {
    if (icon.includes('☀️')) return '晴朗';
    if (icon.includes('🌙')) return '晴夜';
    if (icon.includes('⛅')) return '多云';
    if (icon.includes('☁️')) return '阴天';
    if (icon.includes('🌧️')) return '小雨';
    if (icon.includes('🌦️')) return '阵雨';
    if (icon.includes('⛈️')) return '雷阵雨';
    return '多云';
  };

  const calculateWeatherSegments = (hourlyItems) => {
    if (!hourlyItems || hourlyItems.length === 0) return [];
    const segments = [];
    let currIcon = hourlyItems[0].icon;
    let startIdx = 0;

    for (let i = 1; i < hourlyItems.length; i++) {
      if (hourlyItems[i].icon !== currIcon) {
        segments.push({ startIdx, endIdx: i - 1, icon: currIcon });
        currIcon = hourlyItems[i].icon;
        startIdx = i;
      }
    }
    segments.push({ startIdx, endIdx: hourlyItems.length - 1, icon: currIcon });
    return segments;
  };

  const renderHourlyChart = () => {
    nextTick(() => {
      const ctx = document.getElementById('hourlyWeatherChart');
      if (!ctx) return;

      if (hourlyChartInstance) hourlyChartInstance.destroy();

      const isDark = document.documentElement.classList.contains('dark');

      const labels = hourly24Weather.value.map(h => h.timeStr);
      const temps = hourly24Weather.value.map(h => h.temp);
      const segments = calculateWeatherSegments(hourly24Weather.value);

      // 【黄油小熊 🐻 专属高清 Canvas 插件算法】
      const mojiColorBlockPlugin = {
        id: 'mojiColorBlock',
        beforeDatasetsDraw(chart) {
          const { ctx, chartArea: { top, bottom } } = chart;
          ctx.save();

          const meta = chart.getDatasetMeta(0);
          const points = meta.data;

          segments.forEach(seg => {
            const startPoint = points[seg.startIdx];
            const endPoint = points[seg.endIdx];

            if (!startPoint || !endPoint) return;

            const leftX = seg.startIdx === 0 ? startPoint.x - 15 : (startPoint.x + points[Math.max(0, seg.startIdx - 1)].x) / 2;
            const rightX = seg.endIdx === points.length - 1 ? endPoint.x + 15 : (endPoint.x + points[Math.min(points.length - 1, seg.endIdx + 1)].x) / 2;
            const width = rightX - leftX;

            const isRain = seg.icon.includes('🌧️') || seg.icon.includes('⛈️') || seg.icon.includes('🌦️');
            const isSun = seg.icon.includes('☀️');

            // 1. 半透明区段色块 (柔和温暖调性)
            if (isDark) {
              ctx.fillStyle = isRain 
                ? 'rgba(30, 58, 138, 0.45)' 
                : (isSun ? 'rgba(120, 53, 15, 0.45)' : 'rgba(51, 65, 85, 0.5)');
            } else {
              ctx.fillStyle = isRain 
                ? 'rgba(191, 219, 254, 0.45)' 
                : (isSun ? 'rgba(254, 240, 138, 0.35)' : 'rgba(226, 232, 240, 0.35)');
            }

            ctx.beginPath();
            ctx.roundRect(leftX + 2, top + 32, width - 4, bottom - top - 52, 14);
            ctx.fill();

            const centerX = (leftX + rightX) / 2;
            const iconY = bottom - 42;

            // 2. 绘制与左上角一致的精致【黄油小熊 🐻 专属金边底座徽章】
            const bearBadgeR = 14;
            
            // 外框微阴影
            ctx.shadowColor = 'rgba(217, 119, 6, 0.2)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;

            // 渐变底座：暖黄黄油渐变
            const badgeGrad = ctx.createLinearGradient(centerX - bearBadgeR, iconY - bearBadgeR, centerX + bearBadgeR, iconY + bearBadgeR);
            if (isDark) {
              badgeGrad.addColorStop(0, '#78350F');
              badgeGrad.addColorStop(1, '#451A03');
            } else {
              badgeGrad.addColorStop(0, '#FBBF24');
              badgeGrad.addColorStop(1, '#FEF08A');
            }

            ctx.fillStyle = badgeGrad;
            ctx.beginPath();
            ctx.arc(centerX, iconY, bearBadgeR, 0, Math.PI * 2);
            ctx.fill();

            // 纯白 1.5px 精致圆环描边
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = isDark ? '#F59E0B' : '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 3. 徽章内部放置高品质小熊与天气双图标标识
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐻', centerX, iconY);

            // 4. 下方配合天气状况高亮文本与简符（例如：☀️ 晴朗）
            const weatherText = `${seg.icon} ${getWeatherTextByIcon(seg.icon)}`;
            ctx.font = 'bold 10.5px "Noto Sans SC", sans-serif';

            if (isDark) {
              ctx.fillStyle = isRain ? '#93C5FD' : (isSun ? '#FDE047' : '#E2E8F0');
            } else {
              ctx.fillStyle = isRain ? '#1E40AF' : (isSun ? '#78350F' : '#475569');
            }
            ctx.fillText(weatherText, centerX, iconY + 20);
          });

          ctx.restore();
        }
      };

      hourlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '气温 (°C)',
            data: temps,
            borderColor: isDark ? 'rgba(147, 197, 253, 0.85)' : 'rgba(96, 165, 250, 0.75)',
            borderWidth: 1.8,
            backgroundColor: isDark ? 'rgba(30, 58, 138, 0.2)' : 'rgba(191, 219, 254, 0.12)',
            fill: true,
            tension: 0.45,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            pointBackgroundColor: isDark ? '#60A5FA' : 'rgba(96, 165, 250, 0.9)',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 1
          }]
        },
        plugins: [mojiColorBlockPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // 4K HiDPI / Retina 高清渲染支持
          devicePixelRatio: Math.max(2, window.devicePixelRatio || 1),
          layout: { padding: { top: 15, bottom: 5, left: 10, right: 10 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => `时间: ${items[0].label}`,
                label: (context) => ` 气温: ${context.parsed.y} °C`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11, weight: '500' }, color: isDark ? '#94A3B8' : '#64748B', maxRotation: 0 }
            },
            y: {
              grid: { color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.8)' },
              ticks: { font: { size: 11 }, color: isDark ? '#94A3B8' : '#64748B', callback: (val) => `${val}°` },
              suggestedMin: Math.min(...temps) - 4,
              suggestedMax: Math.max(...temps) + 4
            }
          }
        }
      });
    });
  };

  const fetchWeatherData = async (overrideLat = null, overrideLon = null, cityName = null) => {
    isWeatherLoading.value = true;
    try {
      let lat = overrideLat;
      let lon = overrideLon;

      if (!lat || !lon) {
        const cityObj = cityList.find(c => c.name === selectedCity.value) || cityList[0];
        lat = cityObj.lat;
        lon = cityObj.lon;
      }

      if (cityName) selectedCity.value = cityName;

      const data = await weatherService.fetchForecast(lat, lon);

      if (data && data.hourly && data.daily) {
        const currentTemp = Math.round(data.current_weather.temperature);
        const currentWeatherCode = data.current_weather.weathercode;
        const tempsMax = data.daily.temperature_2m_max;
        const tempsMin = data.daily.temperature_2m_min;
        const dates = data.daily.time;

        const suggest = weatherService.getOutfitSuggestion(tempsMax[0], currentWeatherCode >= 51 ? '雨' : '晴');
        todayWeather.value = {
          temp: currentTemp,
          tempMax: Math.round(tempsMax[0]),
          tempMin: Math.round(tempsMin[0]),
          condition: currentWeatherCode >= 51 ? '有雨' : (currentTemp > 28 ? '晴朗炎热' : '晴朗少云'),
          icon: weatherService.getWeatherIconByCode(currentWeatherCode),
          tip: `今日 ${selectedCity.value} 真实气温 ${currentTemp}°C，小熊提醒出行注意安全哦 🐻✨`,
          outfitTag: suggest.outfitTag,
          outfitRecommend: suggest.outfitRecommend,
          rainNotice: suggest.rainNotice,
          uvNotice: suggest.uvNotice
        };

        const hourlyTimes = data.hourly.time;
        const hourlyTemps = data.hourly.temperature_2m;
        const hourlyCodes = data.hourly.weathercode;

        const now = new Date();
        const localYear = now.getFullYear();
        const localMonth = String(now.getMonth() + 1).padStart(2, '0');
        const localDate = String(now.getDate()).padStart(2, '0');
        const localHour = String(now.getHours()).padStart(2, '0');

        const localNowPrefix = `${localYear}-${localMonth}-${localDate}T${localHour}:00`;

        let startIndex = hourlyTimes.findIndex(t => t.startsWith(localNowPrefix));
        if (startIndex === -1) {
          const targetHourNum = now.getHours();
          startIndex = hourlyTimes.findIndex(t => {
            const h = parseInt(t.substring(11, 13));
            return h === targetHourNum;
          });
          if (startIndex === -1) startIndex = 0;
        }

        hourly24Weather.value = hourlyTimes.slice(startIndex, startIndex + 24).map((tStr, i) => {
          const hourNum = parseInt(tStr.substring(11, 13));
          const isNight = hourNum < 6 || hourNum >= 19;
          const code = hourlyCodes[startIndex + i] || 0;
          const temp = Math.round(hourlyTemps[startIndex + i]);

          let timeLabel = `${String(hourNum).padStart(2, '0')}:00`;
          if (i === 0) timeLabel = '现在';

          return {
            timeStr: timeLabel,
            temp,
            icon: weatherService.getWeatherIconByCode(code, isNight)
          };
        });

        const weekDaysMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        forecast7Days.value = dates.slice(0, 7).map((dStr, idx) => {
          const parts = dStr.split('-');
          const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          const tMax = Math.round(tempsMax[idx]);
          const tMin = Math.round(tempsMin[idx]);
          const code = data.daily.weathercode[idx];

          return {
            dateStr: idx === 0 ? '今天' : `${parts[1]}-${parts[2]}`,
            weekDay: weekDaysMap[dt.getDay()],
            icon: weatherService.getWeatherIconByCode(code),
            condition: code >= 51 ? '阴雨' : (tMax > 28 ? '晴朗' : '多云'),
            tempMin: tMin,
            tempMax: tMax,
            outfit: tMax >= 28 ? '短袖T恤' : (tMax >= 22 ? '短袖+薄外套' : '长袖外套')
          };
        });

        renderHourlyChart();
        if (showToast) showToast(`${selectedCity.value} 天气走势已实时更新！`);
      }
    } catch (err) {
      console.warn('天气 API 请求异常:', err);
      if (showToast) showToast('已加载天气预报与穿衣指南');
    } finally {
      isWeatherLoading.value = false;
    }
  };

  const locateUserGeo = () => {
    if (!('geolocation' in navigator)) {
      if (showToast) showToast('浏览器暂不支持自动定位，请手动选择城市', 'error');
      return;
    }
    if (showToast) showToast('正在定位您的地理位置...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherData(pos.coords.latitude, pos.coords.longitude, '当前定位');
      },
      () => {
        if (showToast) showToast('定位权限未开启，请在下拉框手动选择城市', 'error');
      }
    );
  };

  return {
    isWeatherLoading,
    selectedCity,
    cityList,
    todayWeather,
    hourly24Weather,
    forecast7Days,
    fetchWeatherData,
    locateUserGeo,
    onCityChange: () => fetchWeatherData(),
    renderHourlyChart
  };
}
