// "상사보다 먼저 퇴근하면 안 되지": 팀장님이 진짜로 가방을 들고 일어나면 1.2초 안에 퇴근을 누른다(2번).
// 가방을 만지기만 하고 다시 앉는 낚시도 있다. 그때나 그 전에 누르면 hit.
import { makeTimers, button, pick, handle } from './ui.js';
const FAKE = ['아 메일 하나만...', '(가방에서 안경만 꺼냄)', '내일 회의 자료 좀 보고', '(가방 지퍼만 열었다 닫음)'];

export default {
  id: 'boss-bag', slot: 'leave', title: '눈치게임.exe', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:20px"></div><div style="text-align:center;font-size:40px;line-height:64px"></div><div style="text-align:center;min-height:20px;font-size:12px"></div>';
    const msg = host.firstChild, boss = host.children[1], note = host.children[2];
    let state = 'sit', out = 0, cancel = () => {};
    const sit = () => {
      state = 'sit'; boss.textContent = '🧓💻 👜'; msg.textContent = `팀장님 퇴근 기다리기 ${out}/2`;
      cancel = T.after(ctx.rng() < 0.5 ? fake : leave, (900 + ctx.rng() * 1600) / ctx.speed);
    };
    const fake = () => { state = 'fake'; boss.textContent = '🧓✋👜'; note.textContent = `🧓 "${pick(FAKE, ctx.rng)}"`; cancel = T.after(sit, 900 / ctx.speed); };
    const leave = () => {
      state = 'leave'; boss.textContent = '🧍👜➡️🚪'; note.textContent = '🧓 "먼저 갈게~"';
      cancel = T.after(() => { note.textContent = '🧓 (돌아와서) "아직 있었어? 그럼 이것 좀..."'; ctx.hit(); sit(); }, 1200 / ctx.speed);
    };
    host.append(button('🏃 퇴근', () => {
      cancel();
      if (state !== 'leave') { note.textContent = '🧓 "벌써 가?"'; ctx.hit(); return sit(); }
      if (ctx.goal(++out, 2)) return ctx.clear();
      note.textContent = '(다음 날...)'; sit();
    }, 'width:100%;height:48px'));
    sit();
    return handle(T, host);
  },
};
