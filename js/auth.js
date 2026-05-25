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
      const check = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(check);
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: CONFIG.SCOPES,
            callback: (response) => {
              if (response.error) { console.error('OAuth error:', response.error); return; }
              accessToken = response.access_token;
              tokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
              fetchUserProfile();
            },
          });
          resolve();
        }
      }, 100);

      setTimeout(() => { clearInterval(check); console.warn('GSI load timeout'); resolve(); }, 5000);
    });
  }

  function login() {
    if (!tokenClient) {
      alert('Google Identity Servicesの読み込みに失敗しました。');
      return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  function logout() {
    if (accessToken) google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null;
    userProfile = null;
    tokenExpiry = 0;
    App.showLogin();
  }

  async function fetchUserProfile() {
    try {
      const res = await apiFetch('https://www.googleapis.com/oauth2/v3/userinfo');
      userProfile = res;
    } catch (e) {
      console.error('Profile fetch failed:', e);
    }
    App.onLoginSuccess(userProfile);
  }

  function getToken() {
    if (!accessToken || Date.now() > tokenExpiry) return null;
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
      throw error;
    }

    return response.json();
  }

  return { init, login, logout, apiFetch };
})();
