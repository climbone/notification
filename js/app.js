/**
 * メインアプリコントローラー
 */
const App = (() => {
  let currentTab = 'calendar';
  let calendarLoaded = false;
  let chatLoaded = false;

  async function init() {
    await Auth.init();
    bindEvents();
  }

  function bindEvents() {
    document.getElementById('login-btn').addEventListener('click', () => Auth.login());

    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) Auth.logout();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('back-btn').addEventListener('click', () => Chat.backToSpaces());
  }

  function onLoginSuccess(profile) {
    showApp();

    const avatarEl = document.getElementById('user-avatar');
    if (profile?.picture) {
      avatarEl.innerHTML = `<img src="${profile.picture}" alt="${profile.name || ''}">`;
    } else if (profile?.name) {
      avatarEl.textContent = profile.name.charAt(0).toUpperCase();
      avatarEl.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#007AFF;';
    }

    if (!calendarLoaded) {
      Calendar.load();
      calendarLoaded = true;
    }
  }

  function switchTab(tabName) {
    if (currentTab === tabName) return;
    currentTab = tabName;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    const titles = {
      calendar: { title: 'カレンダー', subtitle: `今後${CONFIG.CALENDAR_DAYS_AHEAD}日間の予定` },
      chat: { title: 'チャット', subtitle: 'Google Chat' },
    };
    const t = titles[tabName];
    document.getElementById('header-title').textContent = t.title;
    document.getElementById('header-subtitle').textContent = t.subtitle;

    if (tabName === 'chat' && !chatLoaded) {
      Chat.loadSpaces();
      chatLoaded = true;
    }
  }

  function showApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
  }

  function showLogin() {
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    calendarLoaded = false;
    chatLoaded = false;
    currentTab = 'calendar';
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === 'calendar');
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.id === 'calendar-tab');
    });
  }

  return { init, onLoginSuccess, showLogin, showApp };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
