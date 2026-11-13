// 월급루팡 동료 찾기: 9명 중 한 명의 모니터가 아주 잠깐 쇼핑몰(🛒)로 바뀐다. 그 사람을 누른다(3번).
// 성실한 동료를 누르면 hit.
import { makeTimers, handle } from './ui.js';
const SLACK = ['🛒', '📺', '🎮', '📈'];

export default {
  id: 'salary-thief', slot: 'late', title: '근무태도_점검', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:20px"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px"></div>';
    const msg = host.firstChild, grid = host.lastChild;
    let thief = 0, found = 0;
    const desks = Array.from({ length: 9 }, (_, i) => {
      const d = document.createElement('div');
      d.className = 'raised';
      d.style.cssText = 'height:48px;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer';
      d.textContent = '🧑‍💻';
      d.addEventListener('pointerdown', () => {
        if (i !== thief) { msg.textContent = '😠 "저 일하고 있는데요?"'; return ctx.hit(); }
        if (++found >= 3) return ctx.clear();
        start();
      });
      grid.append(d);
      return d;
    });
    const start = () => {
      thief = Math.floor(ctx.rng() * 9);
      msg.textContent = `월급루팡 찾기 ${found}/3 — 잘 보세요`;
    };
    T.every(() => {
      const d = desks[thief];
      const was = d.textContent;
      if (was !== '🧑‍💻') return;
      d.textContent = SLACK[Math.floor(ctx.rng() * SLACK.length)];
      T.after(() => { d.textContent = '🧑‍💻'; }, 300 / ctx.speed);
    }, (1200 + ctx.rng() * 600) / ctx.speed);
    start();
    return handle(T, host);
  },
};
