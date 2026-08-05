// js/modules/useWeather.js - 天气预报与 24h 墨迹风格 Canvas 绘图 Controller (带强力防为空降级与自动重绘)

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

  // 生成从当前时刻开始的 24 小时保底默认数据，防止数据未返回时折线图出现 0-1 坐标轴空白
  const generateFallbackHourlyData = () => {
    const fallback = [];
    const now = new Date();
    const currentHour = now.getHours();
    const baseTemps = [22, 21, 20, 20, 19, 19, 20, 22, 24, 26, 28, 29, 29, 28, 27, 26, 25, 24, 23, 23, 22, 22, 22, 21];

    for (let i = 0; i < 24; i++) {
      const h = (currentHour + i) % 24;
      const timeLabel = i === 0 ? '现在' : `${String(h).padStart(2, '0')}:00`;
      const isNight = h < 6 || h >= 19;
      const icon = isNight ? (i % 4 === 0 ? '☁️' : '🌙') : (i % 3 === 0 ? '⛅' : '☀️');
      fallback.push({
        timeStr: timeLabel,
        temp: baseTemps[h] || 25,
        icon
      });
    }
    return fallback;
  };

  const hourly24Weather = ref(generateFallbackHourlyData());
  let hourlyChartInstance = null;

  const forecast7Days = ref([
    { dateStr: '今天', weekDay: '周三', icon: '☀️', condition: '晴朗少云', tempMin: 22, tempMax: 29, outfit: '短袖T恤' },
    { dateStr: '08-06', weekDay: '周四', icon: '⛅', condition: '多云', tempMin: 21, tempMax: 28, outfit: '短袖+薄外套' },
    { dateStr: '08-07', weekDay: '周五', icon: '🌦️', condition: '阵雨', tempMin: 20, tempMax: 26, outfit: '薄款长裤+雨伞' },
    { dateStr: '08-08', weekDay: '周六', icon: '☀️', condition: '晴朗', tempMin: 22, tempMax: 30, outfit: '防晒短袖' },
    { dateStr: '08-09', weekDay: '周日', icon: '☁️', condition: '阴天', tempMin: 21, tempMax: 27, outfit: '休闲运动服' },
    { dateStr: '08-10', weekDay: '周一', icon: '⛅', condition: '多云', tempMin: 20, tempMax: 28, outfit: '短袖衬衫' },
    { dateStr: '08-11', weekDay: '周二', icon: '☀️', condition: '晴朗', tempMin: 22, tempMax: 29, outfit: '薄款透气T恤' }
  ]);

  const getWeatherTextByIcon = (icon) => {
    if (!icon) return '多云';
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
    let currIcon = hourlyItems[0].icon || '☀️';
    let startIdx = 0;

    for (let i = 1; i < hourlyItems.length; i++) {
      const itemIcon = hourlyItems[i].icon || '☀️';
      if (itemIcon !== currIcon) {
        segments.push({ startIdx, endIdx: i - 1, icon: currIcon });
        currIcon = itemIcon;
        startIdx = i;
      }
    }
    segments.push({ startIdx, endIdx: hourlyItems.length - 1, icon: currIcon });
    return segments;
  };

  // 1:1 矢量绘制黄油小熊徽章
  const drawButterBearIcon = (ctx, centerX, centerY, size = 26) => {
    if (!ctx) return;
    ctx.save();
    
    const scale = size / 100;
    const originX = centerX - size / 2;
    const originY = centerY - size / 2;

    const mapX = (x) => originX + x * scale;
    const mapY = (y) => originY + y * scale;
    const mapR = (r) => r * scale;

    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.roundRect(originX, originY, size, size, 8 * scale * 3.5);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 熊耳朵
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(mapX(26), mapY(26), mapR(14), 0, Math.PI * 2);
    ctx.arc(mapX(74), mapY(26), mapR(14), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(mapX(26), mapY(26), mapR(7), 0, Math.PI * 2);
    ctx.arc(mapX(74), mapY(26), mapR(7), 0, Math.PI * 2);
    ctx.fill();

    // 熊脸
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(mapX(50), mapY(54), mapR(33), 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(mapX(38), mapY(46), mapR(4.5), 0, Math.PI * 2);
    ctx.arc(mapX(62), mapY(46), mapR(4.5), 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(mapX(50), mapY(57), mapR(9), mapR(6.5), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.ellipse(mapX(50), mapY(54.5), mapR(4.5), mapR(3), 0, 0, Math.PI * 2);
    ctx.fill();

    // 粉色腮红
    ctx.fillStyle = 'rgba(244, 114, 182, 0.75)';
    ctx.beginPath();
    ctx.arc(mapX(31), mapY(55), mapR(5.5), 0, Math.PI * 2);
    ctx.arc(mapX(69), mapY(55), mapR(5.5), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const renderHourlyChart = () => {
    nextTick(() => {
      const canvasEl = document.getElementById('hourlyWeatherChart');
      if (!canvasEl) return;

      const ctx = canvasEl.getContext('2d');
      if (!ctx) return;

      if (hourlyChartInstance) {
        hourlyChartInstance.destroy();
        hourlyChartInstance = null;
      }

      const items = hourly24Weather.value && hourly24Weather.value.length > 0
        ? hourly24Weather.value
        : generateFallbackHourlyData();

      const isDark = document.documentElement.classList.contains('dark');
      const labels = items.map(h => h.timeStr);
      const temps = items.map(h => Number(h.temp) || 20);

      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      const safeMin = isFinite(minTemp) ? minTemp - 3 : 15;
      const safeMax = isFinite(maxTemp) ? maxTemp + 3 : 30;

      const segments = calculateWeatherSegments(items);

      const mojiColorBlockPlugin = {
        id: 'mojiColorBlock',
        beforeDatasetsDraw(chart) {
          try {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const { top, bottom } = chartArea;
            ctx.save();

            const meta = chart.getDatasetMeta(0);
            if (!meta || !meta.data || meta.data.length === 0) {
              ctx.restore();
              return;
            }

            const points = meta.data;

            segments.forEach(seg => {
              const startPoint = points[seg.startIdx];
              const endPoint = points[seg.endIdx];

              if (!startPoint || !endPoint) return;

              const prevPoint = points[Math.max(0, seg.startIdx - 1)];
              const nextPoint = points[Math.min(points.length - 1, seg.endIdx + 1)];

              const leftX = seg.startIdx === 0 ? startPoint.x - 12 : (startPoint.x + (prevPoint ? prevPoint.x : startPoint.x)) / 2;
              const rightX = seg.endIdx === points.length - 1 ? endPoint.x + 12 : (endPoint.x + (nextPoint ? nextPoint.x : endPoint.x)) / 2;
              const width = Math.max(10, rightX - leftX);

              const isRain = seg.icon.includes('🌧️') || seg.icon.includes('⛈️') || seg.icon.includes('🌦️');
              const isSun = seg.icon.includes('☀️');

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
              ctx.roundRect(leftX + 2, top + 25, width - 4, Math.max(20, bottom - top - 45), 12);
              ctx.fill();

              const centerX = (leftX + rightX) / 2;
              const iconY = bottom - 38;

              // 绘制黄油小熊徽章
              drawButterBearIcon(ctx, centerX, iconY, 24);

              const weatherText = `${seg.icon} ${getWeatherTextByIcon(seg.icon)}`;
              ctx.font = 'bold 10px "Noto Sans SC", sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              if (isDark) {
                ctx.fillStyle = isRain ? '#93C5FD' : (isSun ? '#FDE047' : '#E2E8F0');
              } else {
                ctx.fillStyle = isRain ? '#1E40AF' : (isSun ? '#78350F' : '#475569');
              }
              ctx.fillText(weatherText, centerX, iconY + 18);
            });

            ctx.restore();
          } catch (e) {
            console.warn('Canvas 墨迹插件绘制捕获安全异常:', e);
          }
        }
      };

      try {
        hourlyChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: '气温 (°C)',
              data: temps,
              borderColor: isDark ? 'rgba(147, 197, 253, 0.85)' : 'rgba(96, 165, 250, 0.85)',
              borderWidth: 2,
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.25)' : 'rgba(191, 219, 254, 0.2)',
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 6,
              pointBackgroundColor: isDark ? '#60A5FA' : '#3B82F6',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 1.5
            }]
          },
          plugins: [mojiColorBlockPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
                ticks: { font: { size: 10, weight: '500' }, color: isDark ? '#94A3B8' : '#64748B', maxRotation: 0 }
              },
              y: {
                grid: { color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.8)' },
                ticks: { font: { size: 10 }, color: isDark ? '#94A3B8' : '#64748B', callback: (val) => `${val}°` },
                suggestedMin: safeMin,
                suggestedMax: safeMax
              }
            }
          }
        });
      } catch (err) {
        console.error('Chart.js 实例化失败:', err);
      }
    });
  };

  const fetchWeatherData = async (overrideLat = null, overrideLon = null, cityName = null, isSilent = false) => {
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

        const currentConditionStr = currentWeatherCode >= 51 ? '阴雨' : (currentTemp > 28 ? '晴朗炎热' : '晴朗少云');
        const currentIconStr = weatherService.getWeatherIconByCode(currentWeatherCode);

        const suggest = weatherService.getOutfitSuggestion(tempsMax[0], currentWeatherCode >= 51 ? '雨' : '晴');
        todayWeather.value = {
          temp: currentTemp,
          tempMax: Math.round(tempsMax[0]),
          tempMin: Math.round(tempsMin[0]),
          condition: currentConditionStr,
          icon: currentIconStr,
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
        const targetHourNum = now.getHours();

        let startIndex = hourlyTimes.findIndex(t => {
          const h = parseInt(t.substring(11, 13));
          return h === targetHourNum;
        });
        if (startIndex === -1) startIndex = 0;

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

          if (idx === 0) {
            return {
              dateStr: '今天',
              weekDay: weekDaysMap[dt.getDay()],
              icon: currentIconStr,
              condition: currentConditionStr,
              tempMin: Math.round(tempsMin[0]),
              tempMax: Math.round(tempsMax[0]),
              outfit: tMax >= 28 ? '短袖T恤' : (tMax >= 22 ? '短袖+薄外套' : '长袖外套')
            };
          }

          return {
            dateStr: `${parts[1]}-${parts[2]}`,
            weekDay: weekDaysMap[dt.getDay()],
            icon: weatherService.getWeatherIconByCode(data.daily.weathercode[idx]),
            condition: weatherService.getWeatherIconByCode(data.daily.weathercode[idx]).includes('雨') ? '小雨' : '多云',
            tempMin: tMin,
            tempMax: tMax,
            outfit: tMax >= 28 ? '清凉防晒' : (tMax >= 22 ? '休闲舒适' : '薄外套保暖')
          };
        });

        // ⭐ 强力重绘：API 数据返回更新后，必须显式触发 renderHourlyChart 重新渲染 Canvas！
        renderHourlyChart();

        if (!isSilent && showToast) showToast(`已更新 ${selectedCity.value} 天气预报 ☀️`);
      }
    } catch (err) {
      console.warn('获取天气预报异常，启动降级预报方案:', err);
      hourly24Weather.value = generateFallbackHourlyData();
      renderHourlyChart();
      if (!isSilent && showToast) showToast('天气更新失败，已显示保底数据', 'error');
    } finally {
      isWeatherLoading.value = false;
    }
  };

  const selectCity = (city) => {
    selectedCity.value = city.name;
    fetchWeatherData(city.lat, city.lon, city.name);
  };

  const locateUserCity = () => {
    if (navigator.geolocation) {
      isWeatherLoading.value = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherData(pos.coords.latitude, pos.coords.longitude, '当前位置');
        },
        (err) => {
          isWeatherLoading.value = false;
          fetchWeatherData(39.9042, 116.4074, '北京');
          if (showToast) showToast('无法获取精确定位，已切回北京天气', 'info');
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeatherData(39.9042, 116.4074, '北京');
    }
  };

  return {
    isWeatherLoading,
    selectedCity,
    cityList,
    todayWeather,
    hourly24Weather,
    forecast7Days,
    selectCity,
    locateUserCity,
    fetchWeatherData,
    renderHourlyChart
  };
}
