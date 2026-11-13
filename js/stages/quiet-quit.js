// 조용한 퇴사 모드: [살금살금]을 누르고 있으면 문 쪽으로 움직인다. 팀장님이 돌아보면(👀) 멈춰야 한다.
// 돌아볼 때 움직이고 있으면 hit하고 뒤로 밀린다. 돌아보기 직전에 😐로 바뀐다. 문(100%)에 닿으면 성공.
import { makeTimers, handle } from './ui.js';

export default {
  id: 'quiet-quit', slot: 'leave', title: '존재감_0%.exe', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="text-align:center;font-size:36px;line-height:52px">🧓</div>
      <div class="sunken" style="position:relative;height:36px;margin:6px 0"><span style="position:absolute;right:4px;top:4px;font-size:22px">🚪</span><span style="position:absolute;top:4px;font-size:22px">🥷</span></div>
      <div style="text-align:center;min-height:18px"></div>
      <button class="raised bt" style="width:100%;height:56px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none">누르고 있기: 살금살금</button>`;
    const boss = host.firstChild, me = host.children[1].lastChild, note = host.children[2], btn = host.lastChild;
    let pos = 0, held = false, state = 'away', cancel = () => {};
    const draw = () => { me.style.left = `${pos * 0.82}%`; };
    btn.addEventListener('pointerdown', (e) => { held = true; try { btn.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } });
    const up = () => { held = false; };
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    const away = () => { state = 'away'; boss.textContent = '🧓💻'; cancel = T.after(warn, (900 + ctx.rng() * 1500) / ctx.speed); };
    const warn = () => { state = 'warn'; boss.textContent = '😐💻'; cancel = T.after(look, 400 / ctx.speed); };
    const look = () => {
      state = 'look'; boss.textContent = '👀';
      if (held) { note.textContent = '🧓 "어디 가?"'; ctx.hit(); pos = Math.max(0, pos - 25); held = false; draw(); }
      cancel = T.after(away, (700 + ctx.rng() * 600) / ctx.speed);
    };
    T.every(() => {
      if (!held) return;
      if (state === 'look') { note.textContent = '🧓 "어디 가?"'; ctx.hit(); pos = Math.max(0, pos - 25); held = false; draw(); return; }
      pos = Math.min(100, pos + 1.6);
      draw();
      if (pos >= 100) ctx.clear();
    }, 50);
    note.textContent = '😐가 보이면 손을 떼세요';
    draw(); away();
    return handle(T, host);
  },
};
