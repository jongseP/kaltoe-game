// 팀장님 시선: 눈 아이콘이 오면 "바쁜 척" 버튼을 누른 채 버틴다. 시선이 5번 지나가면 성공.
// 시선이 올 때 손을 떼고 있으면 hit. 안 볼 때 계속 누르고 있으면 티가 나서 hit.
import { makeTimers } from './timers.js';

export default {
  id: 'watch', slot: 'late', title: '팀장님_시선.exe', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="text-align:center;font-size:40px;line-height:56px">🪑</div>
      <div style="text-align:center;min-height:22px"></div>
      <button class="raised bt" style="width:100%;height:56px;margin-top:6px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none">누르고 있기: 바쁜 척</button>`;
    const eye = host.firstChild, note = host.children[1], btn = host.lastChild;
    let held = false, looking = false, looks = 0, hitThisLook = false, heldIdle = 0, cancel = () => {};
    const miss = () => { if (looking && !hitThisLook) { hitThisLook = true; ctx.hit(); } };
    const down = (e) => { held = true; try { btn.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } };
    const up = () => { held = false; miss(); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    T.every(() => {
      if (!held || looking) { heldIdle = 0; return; }
      heldIdle += 50;
      if (heldIdle >= 1600) { heldIdle = 0; note.textContent = '🧓 "왜 혼자 바쁜 척이야?"'; ctx.hit(); }
    }, 50);
    const away = () => {
      looking = false; eye.textContent = '🪑'; note.textContent = `팀장님 이동 중... (${looks}/5)`;
      cancel = T.after(look, (900 + ctx.rng() * 1800) / ctx.speed);
    };
    const look = () => {
      looking = true; hitThisLook = false; eye.textContent = '👁️'; note.textContent = '👀 팀장님이 보고 있다!';
      // 반응할 틈은 아주 잠깐
      cancel = T.after(() => {
        if (!held) miss();
        cancel = T.after(() => { if (++looks >= 5) return ctx.clear(); away(); }, 1000 / ctx.speed);
      }, 350);
    };
    away();
    return { pause: T.pause, resume: T.resume, destroy() { cancel(); T.destroy(); host.replaceChildren(); } };
  },
};
