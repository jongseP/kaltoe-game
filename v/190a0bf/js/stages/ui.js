// 스테이지들이 같이 쓰는 작은 도우미
import { makeTimers } from './timers.js';
export { makeTimers };

export function button(label, onClick, css = '') {
  const b = document.createElement('button');
  b.className = 'raised bt';
  b.textContent = label;
  b.style.cssText = `touch-action:manipulation;${css}`;
  b.addEventListener('click', onClick);
  return b;
}
export const el = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; };
export const shuffled = (arr, rng) => arr.map((x) => [rng(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
export const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
// 타이머를 쓰는 스테이지의 표준 반환값
export const handle = (T, host) => ({ pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } });

// 고르기 한 문제. 고르거나 시간이 다 되면 보기를 잠그고 정답(초록 ✔)·고른 오답(빨강 ✘)을 잠깐 보여 준 뒤 then을 부른다.
// options: 보기 글자들, right: 정답 글자, ms: 제한 시간(없으면 무제한)
// onPick(ok, picked): 고른 즉시(대사·hit용, 시간 초과면 picked는 null), then(ok, picked): 결과를 보여 준 뒤
export function ask(T, box, { options, right, ms, onPick, then, css = '' }) {
  let over = false, stop = () => {};
  const bar = el('<div class="qbar"><i></i></div>');
  const finish = (picked) => {
    if (over) return;
    over = true; stop();
    const ok = picked === right;
    for (const b of btns) {
      b.style.pointerEvents = 'none';
      if (b.textContent === right) b.classList.add('ok'); else if (b.textContent === picked) b.classList.add('no');
    }
    onPick?.(ok, picked);
    T.after(() => then(ok, picked), ok ? 500 : 1200);
  };
  const btns = options.map((o) => button(o, () => finish(o), css));
  box.replaceChildren(...(ms ? [bar] : []), ...btns);
  if (ms) {
    let left = ms;
    stop = T.every(() => { left -= 100; bar.firstChild.style.width = `${Math.max(0, 100 * left / ms)}%`; if (left <= 0) finish(null); }, 100);
  }
}
