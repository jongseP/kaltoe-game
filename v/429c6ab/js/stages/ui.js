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
