/**
 * パタパタ時計
 *
 * 各桁は 4要素で構成:
 *   .fu-top  静的：現在数字の上半分
 *   .fu-bot  静的：現在数字の下半分
 *   .fu-ft   フラップ上：古い数字の上半分 → 折れて消える
 *   .fu-fb   フラップ下：新しい数字の下半分 → 折れて現れる
 */
const Clock = (() => {
  const prev = { h1:-1, h2:-1, m1:-1, m2:-1 };

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');

    flip('fu-h1', prev.h1, +h[0]); prev.h1 = +h[0];
    flip('fu-h2', prev.h2, +h[1]); prev.h2 = +h[1];
    flip('fu-m1', prev.m1, +m[0]); prev.m1 = +m[0];
    flip('fu-m2', prev.m2, +m[1]); prev.m2 = +m[1];

    // 日付更新（分が変わった瞬間のみで十分だが毎秒でも軽い）
    const dateEl = document.getElementById('clock-date');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('ja-JP', {
        month:'short', day:'numeric', weekday:'short'
      });
    }
  }

  function flip(id, oldVal, newVal) {
    const unit = document.getElementById(id);
    if (!unit) return;

    const topSpan = unit.querySelector('.fu-top span');
    const botSpan = unit.querySelector('.fu-bot span');
    const ft      = unit.querySelector('.fu-ft');
    const fb      = unit.querySelector('.fu-fb');
    const ftSpan  = ft.querySelector('span');
    const fbSpan  = fb.querySelector('span');

    /* ── 初回：全要素を初期値にセット ── */
    if (oldVal === -1) {
      topSpan.textContent = newVal;
      botSpan.textContent = newVal;
      ftSpan.textContent  = newVal;
      fbSpan.textContent  = newVal;
      return;
    }

    /* 変化なし → スキップ */
    if (oldVal === newVal) return;

    /* ── アニメーション準備 ── */
    // ft（フラップ上）= 古い数字の上半分が折れて消える
    ftSpan.textContent = oldVal;
    // fb（フラップ下）= 新しい数字の下半分が折れて現れる
    fbSpan.textContent = newVal;

    // 静的上を新しい数字に更新（ftが折れて消えると露出する）
    topSpan.textContent = newVal;
    // 静的下はアニメーション後に更新（fbが覆っている間は古いままでOK）

    // アニメーションクラスをリセット
    ft.classList.remove('flip');
    fb.classList.remove('flip');
    void ft.offsetWidth; // reflow で確実にリセット

    // アニメーション開始
    ft.classList.add('flip');
    fb.classList.add('flip');

    // アニメーション完了後：静的下を更新 & フラップをリセット
    setTimeout(() => {
      botSpan.textContent = newVal;
      ftSpan.textContent  = newVal; // 次回フリップ用
      ft.classList.remove('flip');
      fb.classList.remove('flip');
      // fb を初期状態（非表示）に戻す
      fb.style.animation = 'none';
      fb.style.transform = 'rotateX(90deg)';
      requestAnimationFrame(() => {
        fb.style.animation = '';
        fb.style.transform = '';
      });
    }, 620);
  }

  return { init };
})();
