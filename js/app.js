/**
 * メインアプリコントローラー
 */
const App = (() => {
  let refreshTimer = null;

  async function init() {
    await Auth.init();
    document.getElementById('login-btn').addEventListener('click', () => Auth.login());
    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) Auth.logout();
    });
  }

  function onLoginSuccess(profile) {
    // アバター
    const avatarEl = document.getElementById('user-avatar');
    if (profile?.picture) {
      avatarEl.innerHTML = `<img src="${profile.picture}" alt="">`;
    } else if (profile?.name) {
      avatarEl.textContent = profile.name.charAt(0).toUpperCase();
    }

    // 今日の日付ラベル
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
    const el = document.getElementById('today-label');
    if (el) el.textContent = dateStr;

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');

    Clock.init();
    Weather.load();
    Calendar.load();

    clearInterval(refreshTimer);
    refreshTimer = setInterval(() => Calendar.load(), CONFIG.REFRESH_MS);
  }

  function showLogin() {
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    Clock.stop();
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  return { init, onLoginSuccess, showLogin };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
