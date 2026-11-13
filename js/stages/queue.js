// 식당 줄서기: 팀장님 자리까지 맡아 둔다. 새치기가 오면 1초 안에 "자리 있어요"로 막는다.
// 하지만 팀장님이 오면 막으면 안 된다(그냥 둔다). 6번 넘기면 성공.
import { makeTimers, button, pick, handle } from './ui.js';
const CUT = ['🧑 옆 팀 대리', '👩 모르는 사람', '🧔 배달 기사님', '👨‍💼 타 부서 과장'];

export default {
  id: 'queue', slot: 'lunch', title: '구내식당_대기줄', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="min-height:20px"></div>
      <div class="sunken" style="padding:10px;margin:8px 0;text-align:center;font-size:18px;min-height:30px"></div>`;
    const msg = host.firstChild, line = host.children[1];
    let who = null, done = 0, cancel = () => {};
    const status = () => { msg.textContent = `줄 지키기 ${done}/6`; };
    const idle = () => { who = null; line.textContent = '🍱 … 🧍나 [🧓자리]'; cancel = T.after(come, (500 + ctx.rng() * 900) / ctx.speed); };
    const pass = () => { if (++done >= 6) return ctx.clear(); status(); idle(); };
    const come = () => {
      who = ctx.rng() < 0.3 ? 'boss' : pick(CUT, ctx.rng);
      line.textContent = who === 'boss' ? '🧓 팀장님: "자리 맡아 놨지?"' : `${who}: "저 여기 서도 되죠?"`;
      cancel = T.after(() => {
        if (who !== 'boss') { msg.textContent = '😩 새치기 당했다'; ctx.hit(); }
        pass();
      }, 1000 / ctx.speed);
    };
    host.append(button('✋ 여기 자리 있어요!', () => {
      if (!who) return;
      cancel();
      if (who === 'boss') { msg.textContent = '🧓 "...나한테도 자리 없다고?"'; ctx.hit(); }
      pass();
    }, 'width:100%;height:48px'));
    status(); idle();
    return handle(T, host);
  },
};
