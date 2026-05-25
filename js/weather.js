/**
 * 天気モジュール（Open-Meteo + Nominatim、APIキー不要）
 */
const Weather = (() => {
  const WMO_ICON = {
    0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
    45:'🌫️', 48:'🌫️',
    51:'🌦️', 53:'🌦️', 55:'🌧️',
    61:'🌧️', 63:'🌧️', 65:'🌧️',
    71:'🌨️', 73:'🌨️', 75:'❄️',
    77:'❄️',
    80:'🌦️', 81:'🌧️', 82:'⛈️',
    85:'🌨️', 86:'❄️',
    95:'⛈️', 96:'⛈️', 99:'⛈️',
  };

  async function load() {
    try {
      const pos = await getPosition();
      const { latitude: lat, longitude: lon } = pos.coords;

      const [weather, geo] = await Promise.all([
        fetchWeather(lat, lon),
        fetchGeo(lat, lon),
      ]);

      const current = weather.current;
      const temp    = Math.round(current.temperature_2m);
      const humid   = Math.round(current.relative_humidity_2m);
      const code    = current.weather_code;
      const icon    = WMO_ICON[code] ?? '🌡️';

      document.getElementById('w-icon').textContent  = icon;
      document.getElementById('w-temp').textContent  = `${temp}°`;
      document.getElementById('w-humid').textContent = `湿度 ${humid}%`;
      document.getElementById('w-loc').textContent   = geo;
    } catch (e) {
      console.warn('Weather load failed:', e.message);
      document.getElementById('w-temp').textContent  = '--°';
      document.getElementById('w-humid').textContent = '湿度 --%';
    }
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation unsupported')); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
    });
  }

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    return res.json();
  }

  async function fetchGeo(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        { headers: { 'Accept-Language': 'ja' } }
      );
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village ||
             data.address?.county || data.address?.state || '';
    } catch { return ''; }
  }

  return { load };
})();
