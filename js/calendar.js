/**
 * Google Calendar API モジュール（今日のみ）
 */
const Calendar = (() => {
  const COLORS = {
    '1': '#AC725E', '2': '#D06B64', '3': '#F83A22', '4': '#FA573C',
    '5': '#FF7537', '6': '#FFAD46', '7': '#42D692', '8': '#16A765',
    '9': '#7BD148', '10': '#B3DC6C', '11': '#FBE983', '12': '#FAD165',
    '13': '#92E1C0', '14': '#9FE1E7', '15': '#9FC6E7', '16': '#4986E7',
    '17': '#9A9CFF', '18': '#B99AFF', '19': '#C2C2C2', '20': '#CABDBF',
    '21': '#CCA6AC', '22': '#F691B2', '23': '#CD74E6', '24': '#A47AE2',
  };
  const DEFAULT_COLOR = '#D4820A';

  async function load() {
    showLoading();
    try {
      const now = new Date();
      const y = now.getFullYear(), mo = now.getMonth(), d = now.getDate();
      const timeMin = new Date(y, mo, d).toISOString();
      const timeMax = new Date(y, mo, d, 23, 59, 59).toISOString();

      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '30',
      });

      const data = await Auth.apiFetch(
        `${CONFIG.CALENDAR_API}/calendars/primary/events?${params}`
      );

      renderEvents(data.items || []);
    } catch (e) {
      showError(formatError(e));
    }
  }

  function renderEvents(events) {
    const list = document.getElementById('calendar-list');
    const loading = document.getElementById('calendar-loading');
    const empty = document.getElementById('calendar-empty');
    const error = document.getElementById('calendar-error');

    loading.classList.add('hidden');
    error.classList.add('hidden');

    if (!events.length) {
      empty.classList.remove('hidden');
      return;
    }

    list.innerHTML = '';
    events.forEach(ev => list.appendChild(createCard(ev)));
    list.classList.remove('hidden');
  }

  function createCard(ev) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const isAllDay = !!ev.start.date;
    const color = ev.colorId ? (COLORS[ev.colorId] || DEFAULT_COLOR) : DEFAULT_COLOR;

    const timeStr = isAllDay
      ? '終日'
      : formatTime(ev.start.dateTime, ev.end.dateTime);

    card.innerHTML = `
      <div class="ec-stripe" style="background:${color}"></div>
      <div class="ec-body">
        <div class="ec-time ${isAllDay ? 'ec-allday' : ''}">${timeStr}</div>
        <div class="ec-title">${escapeHtml(ev.summary || '（タイトルなし）')}</div>
        ${ev.location ? `<div class="ec-loc">📍 ${escapeHtml(ev.location)}</div>` : ''}
      </div>
    `;

    return card;
  }

  function formatTime(startISO, endISO) {
    const fmt = d => new Date(d).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(startISO)} – ${fmt(endISO)}`;
  }

  function showLoading() {
    document.getElementById('calendar-loading').classList.remove('hidden');
    document.getElementById('calendar-list').classList.add('hidden');
    document.getElementById('calendar-error').classList.add('hidden');
    document.getElementById('calendar-empty').classList.add('hidden');
  }

  function showError(msg) {
    document.getElementById('calendar-loading').classList.add('hidden');
    document.getElementById('calendar-error').classList.remove('hidden');
    document.getElementById('calendar-error-msg').textContent = msg;
  }

  function formatError(e) {
    if (e.status === 403) return 'カレンダーへのアクセス権限がありません。';
    if (e.status === 401) return '認証が切れました。再度ログインしてください。';
    if (e.message === 'TOKEN_EXPIRED') return 'セッションが切れました。';
    return `エラー: ${e.message}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { load };
})();
