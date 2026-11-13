// 결재 도장 릴레이: 팀장 → 실장 → 본부장 → 다시 팀장 순서로 결재판을 돌린다. 자리는 계속 섞이고 가끔 "부재중"이 된다.
// 순서가 틀리거나 부재중 자리를 누르면 hit. 한 바퀴 끝나면 "반려! 처음부터"가 한 번 나온다.
import { makeTimers, button, shuffled, handle } from './ui.js';
const SEQ = ['팀장', '실장', '본부장', '팀장'];
const DESKS = ['팀장', '실장', '본부장', '상무'];

export default {
  id: 'stamp-relay', slot: 'morning', title: '결재판_릴레이', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:36px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"></div>';
    const msg = host.firstChild, grid = host.lastChild;
    let step = 0, lap = 0, away = null;
    const say = (extra = '') => { msg.textContent = `${lap ? '2바퀴째 ' : ''}결재 순서: ${SEQ.map((s, i) => (i < step ? `✅${s}` : s)).join(' → ')}${extra}`; };
    const draw = () => {
      grid.replaceChildren(...shuffled(DESKS, ctx.rng).map((d) => button(d === away ? `💤 ${d} (부재중)` : `🪑 ${d}`, () => {
        if (d === away) { say('\n⚠ 부재중이에요'); return ctx.hit(); }
        if (d !== SEQ[step]) { say(`\n⚠ ${d}님: "이게 왜 나한테 와?"`); return ctx.hit(); }
        if (++step >= SEQ.length) {
          if (++lap >= 2) return ctx.clear();
          step = 0; say('\n🧓 본부장: "반려! 처음부터"'); return draw();
        }
        say(); draw();
      }, 'height:48px')));
    };
    T.every(() => { away = ctx.rng() < 0.4 ? DESKS[Math.floor(ctx.rng() * 3)] : null; draw(); }, 1500 / ctx.speed);
    msg.style.whiteSpace = 'pre-line';
    say(); draw();
    return handle(T, host);
  },
};
