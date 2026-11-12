// 팀장님 시선: 눈 아이콘이 오면 "바쁜 척" 버튼을 누른 채 버틴다. 시선이 3번 지나가면 성공, 시선이 올 때 손을 떼고 있으면 hit.
import { makeTimers } from './timers.js';

export default {
  id: 'watch', slot: 'late', title: '팀장님_시선.exe', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="text-align:center;font-size:40px;line-height:56px">🪑</div>
      <div style="text-align:center;min-height:22px"></div>
      <button class="raised bt" style="width:100%;height:56px;margin-top:6px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none">누르고 있기: 바쁜 척</button>`;
    const eye = host.firstChild, note = host.children[1], btn = host.lastChild;
    let held = false, looking = false, looks = 0, hitThisLook = false, cancel = () => {};
    const miss = () => { if (looking && !hitThisLook) { hitThisLook = true; ctx.hit(); } };
    const down = (e) => { held = true; try { btn.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } };
    const up = () => { held = false; miss(); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    const away = () => {
      looking = false; eye.textContent = '🪑'; note.textContent = '팀장님 자리 쪽 이동 중...';
      cancel = T.after(look, (1600 + ctx.rng() * 1000) / ctx.speed);
    };
    const look = () => {
      looking = true; hitThisLook = false; eye.textContent = '👁️'; note.textContent = '👀 팀장님이 보고 있다!';
      if (!held) miss();
      cancel = T.after(() => { if (++looks >= 3) return ctx.clear(); away(); }, 1300 / ctx.speed);
    };
    away();
    return { pause: T.pause, resume: T.resume, destroy() { cancel(); T.destroy(); host.replaceChildren(); } };
  },
};
