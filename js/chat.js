/**
 * Google Chat API モジュール
 */
const Chat = (() => {
  let currentSpace = null;

  async function loadSpaces() {
    showSpacesLoading();
    try {
      const data = await Auth.apiFetch(`${CONFIG.CHAT_API}/spaces?pageSize=50`);
      renderSpaces(data.spaces || []);
    } catch (e) {
      showSpacesError(formatError(e));
    }
  }

  function renderSpaces(spaces) {
    const container = document.getElementById('spaces-list');
    const loading = document.getElementById('chat-loading');
    const empty = document.getElementById('chat-empty');
    const error = document.getElementById('chat-error');

    loading.classList.add('hidden');
    error.classList.add('hidden');

    if (!spaces.length) {
      empty.classList.remove('hidden');
      return;
    }

    container.innerHTML = '';
    spaces.forEach(space => {
      container.appendChild(createSpaceCard(space));
    });

    container.classList.remove('hidden');
  }

  function createSpaceCard(space) {
    const card = document.createElement('div');
    card.className = 'space-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const isDM = space.type === 'DIRECT_MESSAGE';
    const displayName = space.displayName || (isDM ? 'ダイレクトメッセージ' : 'スペース');
    const initial = displayName.charAt(0).toUpperCase();

    card.innerHTML = `
      <div class="space-avatar ${isDM ? 'dm-avatar' : ''}">${initial}</div>
      <div class="space-info">
        <div class="space-name">${escapeHtml(displayName)}</div>
        <div class="space-preview">${isDM ? 'ダイレクトメッセージ' : 'スペース'}</div>
      </div>
      <div class="space-meta">
        <span class="space-time"></span>
      </div>
      <svg class="space-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;

    card.addEventListener('click', () => openSpace(space));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openSpace(space);
    });

    return card;
  }

  async function openSpace(space) {
    currentSpace = space;
    const isDM = space.type === 'DIRECT_MESSAGE';
    const displayName = space.displayName || (isDM ? 'ダイレクトメッセージ' : 'スペース');

    document.getElementById('space-name').textContent = displayName;
    document.getElementById('space-type').textContent = isDM ? 'ダイレクトメッセージ' : 'スペース';
    document.getElementById('messages-list').innerHTML = '';

    document.getElementById('spaces-view').classList.add('hidden');
    document.getElementById('messages-view').classList.remove('hidden');

    showMessagesLoading();
    await loadMessages(space.name);
  }

  async function loadMessages(spaceName) {
    try {
      const params = new URLSearchParams({
        pageSize: CONFIG.MESSAGES_PAGE_SIZE,
        orderBy: 'createTime asc',
      });

      const data = await Auth.apiFetch(
        `${CONFIG.CHAT_API}/${spaceName}/messages?${params}`
      );

      renderMessages(data.messages || []);
    } catch (e) {
      hideMessagesLoading();
      const list = document.getElementById('messages-list');
      list.innerHTML = `<div class="error-container"><span class="error-icon">⚠️</span><p>${formatError(e)}</p></div>`;
    }
  }

  function renderMessages(messages) {
    hideMessagesLoading();
    const container = document.getElementById('messages-list');
    container.innerHTML = '';

    if (!messages.length) {
      container.innerHTML = '<div class="empty-container"><span class="empty-icon">💬</span><p>メッセージがありません</p></div>';
      return;
    }

    let lastDate = '';
    messages.forEach(msg => {
      const msgDate = msg.createTime ? new Date(msg.createTime).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric',
      }) : '';

      if (msgDate && msgDate !== lastDate) {
        const divider = document.createElement('div');
        divider.className = 'message-date-divider';
        divider.textContent = msgDate;
        container.appendChild(divider);
        lastDate = msgDate;
      }

      container.appendChild(createMessageItem(msg));
    });

    container.scrollTop = container.scrollHeight;
  }

  function createMessageItem(msg) {
    const item = document.createElement('div');
    item.className = 'message-item';

    const sender = msg.sender;
    const displayName = sender?.displayName || 'Unknown';
    const initial = displayName.charAt(0).toUpperCase();
    const timeStr = msg.createTime
      ? new Date(msg.createTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '';

    const avatarContent = sender?.avatarUrl
      ? `<img src="${escapeHtml(sender.avatarUrl)}" alt="${escapeHtml(displayName)}" loading="lazy">`
      : initial;

    const textContent = msg.text
      ? escapeHtml(msg.text).replace(/\n/g, '<br>')
      : (msg.attachment ? '📎 添付ファイル' : '（メッセージなし）');

    item.innerHTML = `
      <div class="message-avatar">${avatarContent}</div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">${escapeHtml(displayName)}</span>
          <span class="message-time">${timeStr}</span>
        </div>
        <div class="message-text">${textContent}</div>
      </div>
    `;

    return item;
  }

  function backToSpaces() {
    currentSpace = null;
    document.getElementById('messages-view').classList.add('hidden');
    document.getElementById('spaces-view').classList.remove('hidden');
  }

  function showSpacesLoading() {
    document.getElementById('chat-loading').classList.remove('hidden');
    document.getElementById('spaces-list').classList.add('hidden');
    document.getElementById('chat-error').classList.add('hidden');
    document.getElementById('chat-empty').classList.add('hidden');
  }

  function showSpacesError(msg) {
    document.getElementById('chat-loading').classList.add('hidden');
    document.getElementById('chat-error').classList.remove('hidden');
    document.getElementById('chat-error-msg').textContent = msg;
  }

  function showMessagesLoading() {
    document.getElementById('messages-loading').classList.remove('hidden');
  }

  function hideMessagesLoading() {
    document.getElementById('messages-loading').classList.add('hidden');
  }

  function formatError(e) {
    if (e.status === 403) {
      return 'Google Chatへのアクセス権限がありません。\nGoogle WorkspaceアカウントでChat APIを有効にしてください。';
    }
    if (e.status === 401) return '認証が切れました。再度ログインしてください。';
    if (e.message === 'TOKEN_EXPIRED') return 'セッションが切れました。再度ログインしてください。';
    return `エラーが発生しました: ${e.message}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { loadSpaces, backToSpaces };
})();

function loadSpaces() {
  Chat.loadSpaces();
}
