// 프린터 용지 걸림: 걸린 종이를 안내된 방향으로 끌어 5번 빼면 인쇄 완료. 반대 방향으로 끌면 hit.
// 가끔 안내가 도중에 뒤집힌다("아 반대였다").
import { makeTimers } from './timers.js';

export default {
  id: 'printer', slot: 'late', title: '프린터_오류', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="text-align:center;min-height:40px"></div>
      <div class="sunken" style="height:110px;margin-top:8px;display:flex;align-items:center;justify-content:center;touch-action:none;overflow:hidden">
        <div class="raised" style="width:90px;height:64px;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab">📄 걸림</div>
      </div>`;
    const msg = host.firstChild, paper = host.lastChild.firstElementChild;
    let dir = 1, cleared = 0, sx = 0, drag = false, cancel = () => {};
    const say = (extra = '') => { msg.textContent = `용지 걸림 ${cleared + 1}/5  ${dir < 0 ? '◀ 왼쪽' : '오른쪽 ▶'} 으로 빼세요${extra}`; };
    const newJam = () => {
      cancel();
      dir = ctx.rng() < 0.5 ? -1 : 1;
      say();
      if (ctx.rng() < 0.4) cancel = T.after(() => { dir = -dir; say('\n🖨 아 반대였다'); }, (300 + ctx.rng() * 700) / ctx.speed);
    };
    newJam();
    paper.addEventListener('pointerdown', (e) => {
      drag = true; sx = e.clientX;
      try { paper.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
    });
    paper.addEventListener('pointermove', (e) => { if (drag) paper.style.transform = `translateX(${e.clientX - sx}px)`; });
    paper.addEventListener('pointerup', (e) => {
      if (!drag) return;
      drag = false; paper.style.transform = '';
      const dx = e.clientX - sx;
      if (Math.abs(dx) < 50) return;
      if (dx * dir < 0) return ctx.hit();
      if (++cleared >= 5) { cancel(); msg.textContent = '🖨 인쇄 완료!'; return ctx.clear(); }
      newJam();
    });
    paper.addEventListener('pointercancel', () => { drag = false; paper.style.transform = ''; });
    msg.style.whiteSpace = 'pre-line';
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
