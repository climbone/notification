/**
 * パタパタ時計モジュール
 */
const Clock = (() => {
  let timer = null;
  const prev = { h1: -1, h2: -1, m1: -1, m2: -1, s1: -1, s2: -1 };

  function flip(id, oldVal, newVal) {
    const unit = document.getElementById(id);
    if (!unit) return;

    const topSpan = unit.querySelector('.fu-top span');
    const botSpan = unit.querySelector('.fu-bot span');
    const ft = unit.querySelector('.fu-ft');
    const fb = unit.querySelector('.fu-fb');
    const ftSpan = ft.querySelector('span');
    const fbSpan = fb.querySelector('span');

    // First render — no animation, just set all spans
    if (oldVal === -1) {
      topSpan.textContent = newVal;
      botSpan.textContent = newVal;
      ftSpan.textContent = newVal;
      fbSpan.textContent = newVal;
      return;
    }

    if (oldVal === newVal) return;

    // Front top flap shows old value, front bottom flap reveals new value
    ftSpan.textContent = oldVal;
    fbSpan.textContent = newVal;

    // Static top half immediately shows new value
    topSpan.textContent = newVal;

    // Remove existing animation class
    ft.classList.remove('flip');
    fb.classList.remove('flip');

    // Reset fb to hidden (rotateX 90deg)
    fb.style.animation = 'none';
    fb.style.transform = 'rotateX(90deg)';

    // Force reflow
    void ft.offsetWidth;

    // Restore fb animation ability
    requestAnimationFrame(() => {
      fb.style.animation = '';
      fb.style.transform = '';

      ft.classList.add('flip');
      fb.classList.add('flip');
    });

    // After animation: update static bottom half
    setTimeout(() => {
      botSpan.textContent = newVal;
      ft.classList.remove('flip');
      fb.classList.remove('flip');
      ftSpan.textContent = newVal;

      fb.style.animation = 'none';
      fb.style.transform = 'rotateX(90deg)';
      requestAnimationFrame(() => {
        fb.style.animation = '';
        fb.style.transform = '';
      });
    }, 620);
  }

  function tick() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const h1 = Math.floor(h / 10);
    const h2 = h % 10;
    const m1 = Math.floor(m / 10);
    const m2 = m % 10;
    const s1 = Math.floor(s / 10);
    const s2 = s % 10;

    flip('fu-h1', prev.h1, h1);
    flip('fu-h2', prev.h2, h2);
    flip('fu-m1', prev.m1, m1);
    flip('fu-m2', prev.m2, m2);
    flip('fu-s1', prev.s1, s1);
    flip('fu-s2', prev.s2, s2);

    prev.h1 = h1; prev.h2 = h2;
    prev.m1 = m1; prev.m2 = m2;
    prev.s1 = s1; prev.s2 = s2;
  }

  function init() {
    tick();
    timer = setInterval(tick, 1000);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    prev.h1 = prev.h2 = prev.m1 = prev.m2 = prev.s1 = prev.s2 = -1;
  }

  return { init, stop };
})();
