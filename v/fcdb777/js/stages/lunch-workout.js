// 점심 오운완: 운동 25회를 채우고, 인증샷을 찍고, 12:55 전에 복귀한다. 시계는 빨리 흐른다.
// 운동 중에 "📸 지금!"이 뜨면 1초 안에 인증샷(놓치면 hit). 13:00이 넘으면 지각 hit.
import { makeTimers, button, handle } from './ui.js';

export default {
  id: 'lunch-workout', slot: 'lunch', title: '오운완_인증', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="display:flex;justify-content:space-between"><span class="lcd"></span><span></span></div>
      <div style="text-align:center;font-size:40px;line-height:60px">🏋️</div><div style="min-height:18px;text-align:center"></div>
      <div style="display:flex;gap:6px"></div>`;
    const clock = host.firstChild.firstElementChild, reps = host.firstChild.lastElementChild;
    const man = host.children[1], note = host.children[2], row = host.lastChild;
    let min = 0, n = 0, photo = false, shot = false, back = false, up = false, cancel = () => {};
    const draw = () => { clock.textContent = `12:${String(Math.floor(min)).padStart(2, '0')}`; reps.textContent = `${n}/25회 ${shot ? '📸✅' : '📸❌'}`; ctx.goal(n, 25, '회'); };
    T.every(() => {
      min += 0.3 * ctx.speed;
      if (min >= 60) { note.textContent = '🧓 "점심시간 끝난 지가 언젠데"'; ctx.hit(); min = 30; }
      draw();
    }, 100);
    T.every(() => {
      if (photo || shot || n < 5 || ctx.rng() < 0.5) return;
      photo = true; note.textContent = '📸 지금! 인증샷 각!';
      cancel = T.after(() => { if (photo) { photo = false; note.textContent = '😭 인증샷 놓침 (다시 기회 올 때까지)'; ctx.hit(); } }, 1000 / ctx.speed);
    }, 1200);
    row.append(
      button('💪 1회', () => { if (n >= 25) return; n++; man.textContent = (up = !up) ? '🏋️‍♂️' : '🏋️'; draw(); }, 'flex:2;height:48px'),
      button('📸', () => {
        if (!photo) { note.textContent = '🙄 아직 펌핑 안 됐는데?'; return ctx.hit(); }
        photo = false; shot = true; cancel(); note.textContent = '✅ 인스타 업로드 완료'; draw();
      }, 'flex:1;height:48px'),
      button('🏃 복귀', () => {
        if (back) return;
        if (n < 25 || !shot) { note.textContent = n < 25 ? '아직 오운완 아님' : '인증 안 하면 운동 안 한 거임'; return; }
        if (min >= 55) { note.textContent = '😅 아슬아슬 지각'; ctx.hit(); }
        back = true; ctx.clear();
      }, 'flex:1;height:48px'),
    );
    draw();
    return handle(T, host);
  },
};
