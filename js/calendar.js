/**
 * Google Calendar API モジュール
 */
const Calendar = (() => {
  // Google Calendar の色マッピング
  const CALENDAR_COLORS = {
    '1': '#AC725E', '2': '#D06B64', '3': '#F83A22',
    '4': '#FA573C', '5': '#FF7537', '6': '#FFAD46',
    '7': '#42D692', '8': '#16A765', '9': '#7BD148',
    '10': '#B3DC6C', '11': '#FBE983', '12': '#FAD165',
    '13': '#92E1C0', '14': '#9FE1E7', '15': '#9FC6E7',
    '16': '#4986E7', '17': '#9A9CFF', '18': '#B99AFF',
    '19': '#C2C2C2', '20': '#CABDBF', '21': '#CCA6AC',
    '22': '#F691B2', '23': '#CD74E6', '24': '#A47AE2',
  };

  const DEFAULT_COLOR = '#007AFF';

  async function load() {
    showLoading();
    try {
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const timeMax = new Date(
        now.getFullYear(), now.getMonth(),
        now.getDate() + CONFIG.CALENDAR_DAYS_AHEAD,
        23, 59, 59
      ).toISOString();

      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '50',
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
    const container = document.getElementById('calendar-list');
    const loading = document.getElementById('calendar-loading');
    const empty = document.getElementById('calendar-empty');
    const error = document.getElementById('calendar-error');

    loading.classList.add('hidden');
    error.classList.add('hidden');

    if (!events.length) {
      empty.classList.remove('hidden');
      return;
    }

    // 日付でグループ化
    const grouped = {};
    events.forEach(event => {
      const dateKey = event.start.date || event.start.dateTime?.slice(0, 10);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });

    container.innerHTML = '';
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    Object.keys(grouped).sort().forEach(dateKey => {
      const section = document.createElement('div');
      section.className = 'date-section';

      const header = document.createElement('div');
      const isToday = dateKey === today;
      const isTomorrow = dateKey === tomorrow;
      header.className = 'date-header' + (isToday ? ' today-header' : '');
      header.textContent = formatDateHeader(dateKey, isToday, isTomorrow);
      section.appendChild(header);

      grouped[dateKey].forEach(event => {
        section.appendChild(createEventCard(event));
      });

      container.appendChild(section);
    });

    container.classList.remove('hidden');
  }

  function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const isAllDay = !!event.start.date;
    const colorId = event.colorId;
    const color = colorId ? CALENDAR_COLORS[colorId] : DEFAULT_COLOR;

    const colorBar = document.createElement('div');
    colorBar.className = 'event-color-bar';
    colorBar.style.background = color;

    const body = document.createElement('div');
    body.className = 'event-body';

    const timeEl = document.createElement('div');
    if (isAllDay) {
      timeEl.className = 'event-all-day';
      timeEl.textContent = '終日';
    } else {
      timeEl.className = 'event-time';
      timeEl.textContent = formatEventTime(event.start.dateTime, event.end.dateTime);
    }

    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = event.summary || '（タイトルなし）';

    body.appendChild(timeEl);
    body.appendChild(title);

    if (event.location) {
      const loc = document.createElement('div');
      loc.className = 'event-location';
      loc.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        ${escapeHtml(event.location)}
      `;
      body.appendChild(loc);
    }

    card.appendChild(colorBar);
    card.appendChild(body);
    return card;
  }

  function formatDateHeader(dateKey, isToday, isTomorrow) {
    if (isToday) return '今日';
    if (isTomorrow) return '明日';
    const date = new Date(dateKey + 'T00:00:00');
    return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
  }

  function formatEventTime(startISO, endISO) {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const fmt = (d) => d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(start)} - ${fmt(end)}`;
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
    if (e.status === 403) return 'カレンダーへのアクセス権限がありません。\nGoogle Cloud ConsoleでCalendar APIを有効にしてください。';
    if (e.status === 401) return '認証が切れました。再度ログインしてください。';
    if (e.message === 'TOKEN_EXPIRED') return 'セッションが切れました。再度ログインしてください。';
    return `エラーが発生しました: ${e.message}`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { load };
})();

function loadCalendar() {
  Calendar.load();
}
