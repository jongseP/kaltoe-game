// "잠깐 5분만": 말풍선이 출구 버튼을 가린다. 탭해서 치우고 출구를 누르면 탈출. 6개 쌓이면 hit.
import { makeTimers } from './timers.js';
const LINES = ['그래서 제 말은요', '잠깐 정리하면', '다들 의견 있죠?', '아까 얘기로 돌아가서', '5분만 더요', '이건 기본인데'];

export default {
  id: 'five-min-meeting', slot: 'leave', title: '잠깐5분.mtg', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.style.cssText = 'position:relative;height:200px;overflow:hidden';
    host.innerHTML = '<div>🧓 팀장님: 잠깐 5분만...</div>';
    const exit = document.createElement('button');
    exit.className = 'raised bt';
    exit.textContent = '🚪 출구';
    exit.style.cssText = 'position:absolute;left:50%;bottom:12px;width:120px;transform:translateX(-50%)';
    exit.addEventListener('click', () => ctx.clear());
    host.append(exit);
    const bubbles = [];
    const spawn = () => {
      if (bubbles.length >= 6) {
        bubbles.splice(0).forEach((b) => b.remove());
        return ctx.hit();
      }
      const b = document.createElement('div');
      b.className = 'raised';
      b.textContent = LINES[Math.floor(ctx.rng() * LINES.length)];
      b.style.cssText = `position:absolute;bottom:${8 + Math.floor(ctx.rng() * 16)}px;left:${Math.floor(ctx.rng() * 30)}%;width:70%;padding:6px 8px;cursor:pointer`;
      b.addEventListener('click', () => { bubbles.splice(bubbles.indexOf(b), 1); b.remove(); });
      bubbles.push(b);
      host.append(b);
    };
    spawn();
    T.every(spawn, 1800 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.style.cssText = ''; host.replaceChildren(); } };
  },
};
