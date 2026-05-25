/**
 * Google Calendar API — 今日の予定のみ、10分ごと自動更新
 */
const Calendar = (() => {
  const COLORS = {
    '1':'#AC725E','2':'#D06B64','3':'#F83A22','4':'#FA573C','5':'#FF7537',
    '6':'#FFAD46','7':'#42D692','8':'#16A765','9':'#7BD148','10':'#B3DC6C',
    '11':'#FBE983','12':'#FAD165','13':'#92E1C0','14':'#9FE1E7','15':'#9FC6E7',
    '16':'#4986E7','17':'#9A9CFF','18':'#B99AFF','19':'#C2C2C2','20':'#CABDBF',
    '21':'#CCA6AC','22':'#F691B2','23':'#CD74E6','24':'#A47AE2',
  };
  const DEFAULT = '#D4820A';

  async function load() {
    show('cal-loading');
    try {
      const now  = new Date();
      const tMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const tMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      const p    = new URLSearchParams({ timeMin: tMin, timeMax: tMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '30' });
      const data = await Auth.apiFetch(`${CONFIG.CALENDAR_API}/calendars/primary/events?${p}`);
      render(data.items || []);
    } catch (e) {
      show('cal-error');
      document.getElementById('cal-error-msg').textContent = errMsg(e);
    }
  }

  function render(events) {
    if (!events.length) { show('cal-empty'); return; }
    const list = document.getElementById('cal-list');
    list.innerHTML = '';
    events.forEach(ev => list.appendChild(card(ev)));
    show('cal-list');
  }

  function card(ev) {
    const el       = document.createElement('div');
    el.className   = 'event-card';
    const color    = ev.colorId ? COLORS[ev.colorId] : DEFAULT;
    const isAllDay = !!ev.start.date;

    const bar = document.createElement('div');
    bar.className = 'event-bar';
    bar.style.background = color;

    const body = document.createElement('div');
    body.className = 'event-body';

    const timeEl = document.createElement('div');
    if (isAllDay) {
      timeEl.className   = 'event-allday';
      timeEl.textContent = '終日';
    } else {
      timeEl.className   = 'event-time';
      timeEl.textContent = fmtTime(ev.start.dateTime, ev.end.dateTime);
    }

    const title = document.createElement('div');
    title.className   = 'event-title';
    title.textContent = ev.summary || '（タイトルなし）';

    body.appendChild(timeEl);
    body.appendChild(title);

    if (ev.location) {
      const loc = document.createElement('div');
      loc.className   = 'event-loc';
      loc.textContent = ev.location;
      body.appendChild(loc);
    }

    el.appendChild(bar);
    el.appendChild(body);
    return el;
  }

  function fmtTime(s, e) {
    const f = d => new Date(d).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${f(s)} – ${f(e)}`;
  }

  function show(id) {
    ['cal-loading','cal-error','cal-empty','cal-list']
      .forEach(i => document.getElementById(i).classList.toggle('hidden', i !== id));
  }

  function errMsg(e) {
    if (e.status === 403) return 'Calendar API へのアクセス権限がありません。';
    if (e.status === 401 || e.message === 'TOKEN_EXPIRED') return 'セッション切れ。再ログインしてください。';
    return `エラー: ${e.message}`;
  }

  return { load };
})();

function loadCalendar() { Calendar.load(); }
