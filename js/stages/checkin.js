// 출근 체크: 막대가 99%에서 멈춘다. 연타해야 100%가 되고, 멈추면 거꾸로 줄어 0에 닿으면 hit.
import { makeTimers } from './timers.js';

export default {
  id: 'checkin', slot: 'commute', title: '출근체크.exe', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div>출근 확인 중...</div>
      <div class="sunken" style="height:22px;margin:8px 0;padding:1px"><div style="height:100%;background:#000080"></div></div>
      <div style="text-align:center;font-weight:bold"></div>
      <button class="raised bt" style="width:100%;margin-top:8px;touch-action:manipulation">출근 확인</button>`;
    const bar = host.children[1].firstChild, pct = host.children[2];
    let p = 99, idle = 0, taps = 0;
    const draw = () => { bar.style.width = `${p}%`; pct.textContent = `${Math.round(p)}%`; };
    draw();
    T.every(() => {
      idle += 50;
      if (idle < 1500 / ctx.speed) return;
      p = Math.max(0, p - 1.25 * ctx.speed);
      if (p === 0) { ctx.hit(); p = 99; idle = 0; }
      draw();
    }, 50);
    host.querySelector('button').addEventListener('click', () => {
      idle = 0; p = Math.min(99, p + 20); taps++;
      if (taps >= 10) { p = 100; draw(); return ctx.clear(); }
      draw();
    });
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
