// "잠깐 5분만": 말풍선이 계속 쌓인다. 탭해서 10개를 치워야 출구가 열린다. 5개가 쌓이면 hit하고 다 날아간다.
import { makeTimers } from './timers.js';
const LINES = ['그래서 제 말은요', '잠깐 정리하면', '다들 의견 있죠?', '아까 얘기로 돌아가서', '5분만 더요', '이건 기본인데', '한 가지만 더', '혹시 질문?'];

export default {
  id: 'five-min-meeting', slot: 'leave', title: '잠깐5분.mtg', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.style.cssText = 'position:relative;height:200px;overflow:hidden';
    host.innerHTML = '<div></div>';
    const head = host.firstChild;
    const exit = document.createElement('button');
    exit.className = 'raised bt';
    exit.textContent = '🚪 출구 (잠김)';
    exit.disabled = true;
    exit.style.cssText = 'position:absolute;left:50%;bottom:12px;width:140px;transform:translateX(-50%)';
    exit.addEventListener('click', () => ctx.clear());
    host.append(exit);
    const bubbles = [];
    let popped = 0;
    const draw = () => {
      head.textContent = `🧓 팀장님: 잠깐 5분만... (회의 진행 ${popped}/10)`;
      if (popped >= 10) { exit.disabled = false; exit.textContent = '🚪 출구'; }
    };
    const spawn = () => {
      if (popped >= 10) return;
      if (bubbles.length >= 5) {
        bubbles.splice(0).forEach((b) => b.remove());
        head.textContent = '🧓 팀장님: 처음부터 다시 얘기하면...';
        return ctx.hit();
      }
      const b = document.createElement('div');
      b.className = 'raised';
      b.textContent = LINES[Math.floor(ctx.rng() * LINES.length)];
      b.style.cssText = `position:absolute;top:${24 + Math.floor(ctx.rng() * 110)}px;left:${Math.floor(ctx.rng() * 35)}%;width:62%;padding:6px 8px;cursor:pointer;z-index:2`;
      b.addEventListener('click', () => { bubbles.splice(bubbles.indexOf(b), 1); b.remove(); popped++; draw(); });
      bubbles.push(b);
      host.append(b);
    };
    draw();
    spawn();
    T.every(spawn, 650 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.style.cssText = ''; host.replaceChildren(); } };
  },
};
