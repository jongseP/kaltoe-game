// "아침은 30분 일찍": 빠르게 돌아가는 시계가 08:20~08:29일 때 출근을 누른다(3번). 그 밖에 누르면 "지각이네?" hit.
// 09:00 정각에 누르면 특히 혼난다.
import { makeTimers, button, handle } from './ui.js';

export default {
  id: 'early-30', slot: 'commute', title: '근태관리.exe', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="text-align:center">🧓 "출근은 9시지만 8시 반까진 와야지"</div>
      <div class="lcd" style="display:block;text-align:center;font-size:32px;margin:10px auto;width:140px"></div>
      <div style="text-align:center;min-height:20px"></div>`;
    const clock = host.children[1], note = host.children[2];
    let m = 0, ok = 0;
    const draw = () => { clock.textContent = `08:${String(m).padStart(2, '0')}`; };
    T.every(() => { m = (m + 1) % 60; draw(); }, 90 / ctx.speed);
    draw();
    host.append(button('🏢 출근', () => {
      if (m >= 20 && m < 30) {
        if (ctx.goal(++ok, 3)) return ctx.clear();
        note.textContent = `🧓 "음, 됐어" (${ok}/3)`;
      } else {
        note.textContent = m >= 30 ? '🧓 "지각이네?"' : '🧓 "너무 일찍 와서 뭐 하게?"';
        ctx.hit();
      }
      m = Math.floor(ctx.rng() * 15) + 40;
      draw();
    }, 'width:100%;height:48px'));
    note.textContent = '08:20~08:29에 누르세요 (0/3)';
    return handle(T, host);
  },
};
