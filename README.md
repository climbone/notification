# My Dashboard

iPhone 14 向けウェブアプリ。Google Calendar と Google Chat をまとめて表示します。

## 公開URL

```
https://climbone.github.io/notification/
```

## 機能

- **Google Calendar**: 今後7日間の予定を日付別に表示
- **Google Chat**: スペース一覧とメッセージの閲覧
- **iPhone 14 最適化**: ノッチ・ホームインジケーター対応、iOS風デザイン
- **PWA対応**: ホーム画面に追加してネイティブアプリのように使用可能
- **ダークモード対応**

## セットアップ手順

### 1. GitHub Pages を有効化

1. GitHubリポジトリの **Settings** → **Pages** を開く
2. **Source** を `GitHub Actions` に設定
3. 保存すると `main` ブランチへのpushで自動デプロイされます

### 2. Google Cloud Console の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）

### 3. APIの有効化

「APIとサービス」→「ライブラリ」から以下を有効化：

- **Google Calendar API**
- **Google Chat API**

### 4. OAuth 2.0 認証情報の作成

1. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
2. アプリケーションの種類: **ウェブアプリケーション**
3. **承認済みのJavaScriptオリジン** に以下を追加:
   ```
   https://climbone.github.io
   ```
4. クライアントIDをコピー

### 5. config.js の設定

`js/config.js` を開き、`CLIENT_ID` を更新します：

```javascript
CLIENT_ID: 'xxxxxxxx.apps.googleusercontent.com',  // ← ここを変更
```

変更後、`main` ブランチにpushすると自動でデプロイされます。

### 6. OAuth同意画面の設定

「APIとサービス」→「OAuth同意画面」：

1. ユーザーの種類: **外部**（または内部）
2. アプリ名、サポートメール等を入力
3. スコープに以下を追加:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/chat.spaces.readonly`
   - `https://www.googleapis.com/auth/chat.messages.readonly`
4. テストユーザーに自分のGmailアドレスを追加（公開前）

## iPhone 14 にホーム画面追加（PWA）

1. Safariで `https://climbone.github.io/notification/` を開く
2. 共有ボタン →「ホーム画面に追加」
3. アプリのように起動可能

## 注意事項

- Google Chat API は **Google Workspace** アカウントが必要な場合があります
- OAuth同意画面が「テスト」状態の場合、テストユーザーとして登録されたアカウントのみ使用可能です

## ファイル構成

```
/
├── .github/workflows/deploy.yml  # GitHub Actions自動デプロイ
├── index.html                    # メインHTML
├── manifest.json                 # PWAマニフェスト
├── css/style.css                 # iPhone 14最適化スタイル
└── js/
    ├── config.js                 # OAuth設定 ← CLIENT_IDを設定
    ├── auth.js                   # Google OAuth 2.0認証
    ├── calendar.js               # Calendar API
    ├── chat.js                   # Chat API
    └── app.js                    # メインコントローラー
```
