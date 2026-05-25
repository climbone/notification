/**
 * Open-Meteo 天気モジュール（API キー不要）
 */
const Weather = (() => {
  const WMO = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '❄️',
    80: '🌦️', 81: '🌧️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
  };

  function weatherEmoji(code) {
    return WMO[code] || '🌡️';
  }

  async function load() {
    if (!navigator.geolocation) {
      render('--°', '--%', '📍', '位置情報なし');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
          const res = await fetch(url);
          const data = await res.json();
          const cur = data.current;
          const temp = Math.round(cur.temperature_2m) + '°';
          const hum = cur.relative_humidity_2m + '%';
          const emoji = weatherEmoji(cur.weather_code);
          const city = await getCity(lat, lon);
          render(temp, hum, emoji, city);
        } catch {
          render('--°', '--%', '🌡️', '');
        }
      },
      () => render('--°', '--%', '📍', '位置情報なし'),
      { timeout: 8000 }
    );
  }

  async function getCity(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'ja' } });
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
    } catch {
      return '';
    }
  }

  function render(temp, hum, emoji, city) {
    const el = document.getElementById('weather-info');
    if (!el) return;
    el.innerHTML = `
      <div class="weather-emoji">${emoji}</div>
      <div class="weather-vals">
        <span class="weather-temp">${temp}</span>
        <span class="weather-hum">${hum}</span>
      </div>
      ${city ? `<div class="weather-city">${escapeHtml(city)}</div>` : ''}
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { load };
})();
