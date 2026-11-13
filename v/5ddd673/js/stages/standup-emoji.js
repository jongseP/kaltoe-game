// 스탠딩 미팅 체크인: 팀원 5명의 기분 이모지가 잠깐 보였다 사라진다. 가장 많은 이모지를 골라 분위기를 맞춘다(3번). 틀리면 hit.
import { makeTimers, button, shuffled, handle } from './ui.js';
const EMO = ['😊', '😐', '😫', '🔥', '🥱', '😎'];

export default {
  id: 'standup-emoji', slot: 'commute', title: '데일리스탠드업', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div></div><div class="sunken" style="font-size:30px;text-align:center;padding:8px;min-height:44px;letter-spacing:6px"></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px"></div>`;
    const msg = host.firstChild, row = host.children[1], box = host.lastChild;
    let round = 0;
    const start = () => {
      const opts = shuffled(EMO, ctx.rng).slice(0, 4);
      const major = opts[0];
      const team = shuffled([major, major, major, opts[1], opts[2]], ctx.rng);
      msg.textContent = `(${round + 1}/3) 팀 분위기를 맞춰 체크인하세요`;
      row.textContent = team.join('');
      box.replaceChildren();
      T.after(() => {
        row.textContent = '❓❓❓❓❓';
        box.replaceChildren(...shuffled(opts, ctx.rng).map((e) => button(e, () => {
          if (e !== major) { msg.textContent = '팀장님: 혼자 분위기 왜 그래?'; return ctx.hit(); }
          if (ctx.goal(++round, 3)) return ctx.clear();
          start();
        }, 'font-size:24px')));
      }, 1100 / ctx.speed);
    };
    start();
    return handle(T, host);
  },
};
