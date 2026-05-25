/**
 * Google OAuth 2.0 認証モジュール（Google Identity Services）
 */
const Auth = (() => {
  let tokenClient = null;
  let accessToken = null;
  let userProfile = null;
  let tokenExpiry = 0;

  function init() {
    return new Promise((resolve) => {
      const checkGsi = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(checkGsi);
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: CONFIG.SCOPES,
            callback: (response) => {
              if (response.error) {
                console.error('OAuth error:', response.error);
                return;
              }
              accessToken = response.access_token;
              tokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
              fetchUserProfile();
            },
          });
          resolve();
        }
      }, 100);

      // 5秒でタイムアウト
      setTimeout(() => {
        clearInterval(checkGsi);
        console.warn('GSI load timeout - offline or blocked?');
        resolve();
      }, 5000);
    });
  }

  function login() {
    if (!tokenClient) {
      alert('Google Identity Servicesの読み込みに失敗しました。\nネットワーク接続を確認してください。');
      return;
    }
    if (CONFIG.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      alert('⚠️ 設定が必要です\n\njs/config.js の CLIENT_ID に\nGoogle Cloud ConsoleのクライアントIDを設定してください。\n\n詳しくは README.md を参照してください。');
      return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  function logout() {
    if (accessToken) {
      google.accounts.oauth2.revoke(accessToken, () => {});
    }
    accessToken = null;
    userProfile = null;
    tokenExpiry = 0;
    App.showLogin();
  }

  async function fetchUserProfile() {
    try {
      const res = await apiFetch('https://www.googleapis.com/oauth2/v3/userinfo');
      userProfile = res;
      App.onLoginSuccess(userProfile);
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
      App.onLoginSuccess(null);
    }
  }

  function getToken() {
    if (!accessToken || Date.now() > tokenExpiry) {
      return null;
    }
    return accessToken;
  }

  async function apiFetch(url, options = {}) {
    const token = getToken();
    if (!token) throw new Error('TOKEN_EXPIRED');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const error = new Error(err.error?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.code = err.error?.code;
      throw error;
    }

    return response.json();
  }

  function getProfile() {
    return userProfile;
  }

  function isLoggedIn() {
    return !!accessToken && Date.now() < tokenExpiry;
  }

  return { init, login, logout, apiFetch, getProfile, isLoggedIn, getToken };
})();
