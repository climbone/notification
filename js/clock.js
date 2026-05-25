/**
 * パタパタ時計モジュール
 */
const Clock = (() => {
  let prevH1 = -1, prevH2 = -1, prevM1 = -1, prevM2 = -1;

  function init() {
    tick();
    setInterval(tick, 1000);
  }

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    flipDigit('flip-h1', prevH1, Number(hh[0])); prevH1 = Number(hh[0]);
    flipDigit('flip-h2', prevH2, Number(hh[1])); prevH2 = Number(hh[1]);
    flipDigit('flip-m1', prevM1, Number(mm[0])); prevM1 = Number(mm[0]);
    flipDigit('flip-m2', prevM2, Number(mm[1])); prevM2 = Number(mm[1]);
  }

  function flipDigit(id, prev, next) {
    const unit = document.getElementById(id);
    if (!unit) return;

    const top        = unit.querySelector('.top span');
    const bottom     = unit.querySelector('.bottom span');
    const flipTop    = unit.querySelector('.flip-top');
    const flipBottom = unit.querySelector('.flip-bottom');
    const ftSpan     = flipTop.querySelector('span');
    const fbSpan     = flipBottom.querySelector('span');

    // 初回セット
    if (prev === -1) {
      top.textContent    = next;
      bottom.textContent = next;
      ftSpan.textContent = next;
      fbSpan.textContent = next;
      return;
    }

    if (prev === next) return;

    // アニメーション
    ftSpan.textContent = prev;
    fbSpan.textContent = next;
    top.textContent    = prev;
    bottom.textContent = next;

    // クラスをリセットしてから付与
    flipTop.classList.remove('flipping');
    flipBottom.classList.remove('flipping');
    void flipTop.offsetWidth; // reflow

    flipTop.classList.add('flipping');
    flipBottom.classList.add('flipping');

    setTimeout(() => {
      top.textContent = next;
      flipTop.classList.remove('flipping');
      flipBottom.classList.remove('flipping');
    }, 550);
  }

  return { init };
})();
