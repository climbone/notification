/**
 * メインコントローラー
 */
const App = (() => {
  const REFRESH_MS = 10 * 60 * 1000; // 10分
  let refreshTimer = null;

  async function init() {
    await Auth.init();
    document.getElementById('login-btn').addEventListener('click', () => Auth.login());
    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) Auth.logout();
    });
  }

  function onLoginSuccess(profile) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');

    // 日付ラベル
    const now = new Date();
    document.getElementById('cal-date-label').textContent =
      now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    // ユーザーアバターは不要なのでスキップ（左ペインにログアウトボタンのみ）

    // 時計スタート
    Clock.init();

    // 天気取得
    Weather.load();

    // カレンダー初回 + 10分ごと自動更新
    Calendar.load();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => Calendar.load(), REFRESH_MS);
  }

  function showLogin() {
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  }

  return { init, onLoginSuccess, showLogin };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
