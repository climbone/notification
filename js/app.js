/**
 * メインコントローラー
 */
const App = (() => {
  async function init() {
    setDate();
    await Auth.init();
    document.getElementById('login-btn').addEventListener('click', () => Auth.login());
    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) Auth.logout();
    });
  }

  function setDate() {
    const now = new Date();
    const wd  = now.toLocaleDateString('ja-JP', { weekday: 'short' }).replace(/[()]/g, '');
    const day = now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
    const el  = document.getElementById('login-date');
    if (el) el.textContent = `${day} ${wd}`;
  }

  function onLoginSuccess(profile) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');

    const now = new Date();
    document.getElementById('header-weekday').textContent =
      now.toLocaleDateString('ja-JP', { weekday: 'long' }).replace(/曜日/, '');
    document.getElementById('header-day').textContent =
      now.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });

    const av = document.getElementById('user-avatar');
    if (profile?.picture) {
      av.innerHTML = `<img src="${profile.picture}" alt="">`;
    } else if (profile?.name) {
      av.textContent = profile.name.charAt(0).toUpperCase();
    }

    Calendar.load();
  }

  function showLogin() {
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
  }

  return { init, onLoginSuccess, showLogin };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
