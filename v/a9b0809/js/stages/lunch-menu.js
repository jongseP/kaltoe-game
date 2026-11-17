// 점심 메뉴: "아무거나"라는 팀장님의 진짜 정답을 맞힌다. 힌트는 잠깐만 스쳐 지나가고, 3번 연속 맞혀야 한다(마음이 바뀐다).
import { makeTimers } from './timers.js';
const MENUS = ['김치찌개', '돈까스', '냉면', '짜장면', '비빔밥', '햄버거', '국밥', '마라탕', '쌀국수'];
const REJECTS = ['어제 먹었잖아', '지금 그게 땡기겠어?', '거기 줄 길어', '난 그거 별로야', '너무 비싸지 않나?'];
const CHANGE = ['아 근데 생각해 보니까...', '음 아니다 다른 거', '그건 저녁에 먹자'];

export default {
  id: 'lunch-menu', slot: 'lunch', title: '점심_뭐먹지.msg', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:56px"></div>';
    const say = host.firstChild;
    const box = document.createElement('div');
    box.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px';
    host.append(box);
    let round = 0, answer = '', cancel = [];
    const start = () => {
      cancel.forEach((c) => c()); cancel = [];
      const pool = MENUS.map((m) => [ctx.rng(), m]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, 6);
      answer = pool[0];
      pool.sort((a, b) => a.localeCompare(b));
      say.textContent = `🧓 팀장님 (${round + 1}/3): 아무거나 먹자`;
      box.replaceChildren(...pool.map((m) => {
        const b = document.createElement('button');
        b.className = 'raised bt';
        b.textContent = m;
        b.addEventListener('click', () => {
          if (m === answer) {
            if (ctx.goal(++round, 3)) return ctx.clear();
            say.textContent = `🧓 팀장님: ${CHANGE[Math.floor(ctx.rng() * CHANGE.length)]}`;
            box.replaceChildren();
            cancel.push(T.after(start, 700));
            return;
          }
          say.textContent = `🧓 팀장님: ${REJECTS[Math.floor(ctx.rng() * REJECTS.length)]}`;
          ctx.hit();
        });
        return b;
      }));
      // 힌트는 잠깐만 스친다
      const hintAt = (1500 + ctx.rng() * 1500) / ctx.speed;
      cancel.push(T.after(() => {
        say.textContent = `🧓 팀장님: 음... ${answer}...? 아무거나`;
        cancel.push(T.after(() => { say.textContent = '🧓 팀장님: 아무거나 먹자니까'; }, 1500 / ctx.speed));
      }, hintAt));
    };
    start();
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
