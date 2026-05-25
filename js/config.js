/**
 * Google OAuth 2.0 設定
 *
 * セットアップ手順:
 * 1. https://console.cloud.google.com/ にアクセス
 * 2. プロジェクトを作成（または選択）
 * 3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
 * 4. アプリケーションの種類: 「ウェブアプリケーション」
 * 5. 承認済みのJavaScriptオリジンに以下を追加:
 *    https://climbone.github.io
 * 6. 以下の CLIENT_ID に取得したクライアントIDを設定
 *
 * 有効にするAPI:
 * - Google Calendar API
 * - Google Chat API
 */
const CONFIG = {
  CLIENT_ID: '229119775387-478telmb1u91282fs6hd8t5b2i0nbf4q.apps.googleusercontent.com',

  SCOPES: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/chat.spaces.readonly',
    'https://www.googleapis.com/auth/chat.messages.readonly',
    'profile',
    'email',
  ].join(' '),

  CALENDAR_API: 'https://www.googleapis.com/calendar/v3',
  CHAT_API: 'https://chat.googleapis.com/v1',

  // 表示する日数（今日から何日先まで）
  CALENDAR_DAYS_AHEAD: 7,

  // スペースごとに取得するメッセージ数
  MESSAGES_PAGE_SIZE: 50,
};
