// 혼밥 탈출 작전: 점심 먹으러 나가는 무리에 "저도 같이요!"로 끼어든다. 무리는 잠깐만 보인다.
// 팀장님 무리에 끼면 계산을 떠안아서 hit. 무리 3개에 끼면 성공(놓쳐도 hit 없음, 시간만 간다).
import { makeTimers, button, pick, handle } from './ui.js';
const GROUPS = ['👥 옆자리 동기들', '👥 디자인팀', '👥 입사 동기 단톡방', '👥 운동 모임', '👥 개발팀 막내들'];

export default {
  id: 'solo-escape', slot: 'lunch', title: '혼밥탈출.exe', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="min-height:20px"></div>
      <div class="sunken" style="height:80px;display:flex;align-items:center;justify-content:center;font-size:16px;margin:8px 0;text-align:center"></div>`;
    const msg = host.firstChild, door = host.children[1];
    let group = null, joined = 0, cancel = () => {};
    const status = () => { msg.textContent = `같이 먹기 ${joined}/3`; };
    const empty = () => { group = null; door.textContent = '🚪 (아무도 없다... 🍙)'; cancel = T.after(show, (400 + ctx.rng() * 800) / ctx.speed); };
    const show = () => {
      group = ctx.rng() < 0.3 ? 'boss' : pick(GROUPS, ctx.rng);
      door.textContent = group === 'boss' ? '🧓👥 팀장님과 임원들: "오늘 내가... 아니 누가 쏘지?"' : `${group}: "밥 먹으러 가자~"`;
      cancel = T.after(empty, 900 / ctx.speed);
    };
    host.append(button('🙋 저도 같이요!', () => {
      if (!group) return;
      cancel();
      if (group === 'boss') { msg.textContent = '💸 계산은 막내가...'; ctx.hit(); return empty(); }
      if (ctx.goal(++joined, 3)) return ctx.clear();
      status(); empty();
    }, 'width:100%;height:48px'));
    status(); empty();
    return handle(T, host);
  },
};
