// 출근 체크: 막대가 계속 줄어든다. 빠르게 연타해 100%를 채우면 성공. 0%에 닿으면 hit하고 다시 30%부터.
// 99%에서는 한 번 "서버 응답 대기"로 멈춰서, 그동안 누르면 오히려 깎인다.
import { makeTimers } from './timers.js';

export default {
  id: 'checkin', slot: 'commute', title: '출근체크.exe', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div>📡 출근 도장이 서버로 가는 중... 막대가 줄기 전에 아래 버튼을 연타!</div>
      <div class="sunken" style="height:22px;margin:8px 0;padding:1px"><div style="height:100%;background:#000080"></div></div>
      <div style="text-align:center;font-weight:bold"></div>
      <button class="raised bt" style="width:100%;margin-top:8px;touch-action:manipulation">👆 연타! 출근 도장 찍기</button>`;
    const msg = host.firstChild, bar = host.children[1].firstChild, pct = host.children[2];
    let p = 30, stall = false, stalled = false;
    const draw = () => { bar.style.width = `${p}%`; pct.textContent = `전송 ${Math.floor(p)}% / 100%`; ctx.goal(Math.floor(p), 100, '%'); };
    draw();
    T.every(() => {
      if (stall) return;
      p = Math.max(0, p - 0.7 * ctx.speed);
      if (p === 0) { ctx.hit(); p = 30; }
      draw();
    }, 50);
    host.querySelector('button').addEventListener('click', () => {
      if (stall) { p = Math.max(0, p - 15); draw(); msg.textContent = '⚠ 기다리라니까요 (재요청)'; return; }
      p = Math.min(100, p + 5);
      if (p >= 99 && !stalled) {
        stalled = stall = true; p = 99; msg.textContent = '⏳ 서버 응답 대기 중... 지금은 누르지 마세요!';
        T.after(() => { stall = false; msg.textContent = '✅ 응답 옴! 한 번만 더 누르세요'; }, (900 + ctx.rng() * 900) / ctx.speed);
      } else if (p >= 100) { draw(); return ctx.clear(); }
      draw();
    });
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
