// 점심 메뉴: "아무거나"라는 팀장님의 진짜 정답 하나를 맞힌다. 오답은 이유를 대며 퇴짜.
import { makeTimers } from './timers.js';
const MENUS = ['김치찌개', '돈까스', '냉면', '짜장면', '비빔밥', '햄버거'];
const REJECTS = ['어제 먹었잖아', '지금 그게 땡기겠어?', '거기 줄 길어', '난 그거 별로야', '너무 비싸지 않나?'];

export default {
  id: 'lunch-menu', slot: 'lunch', title: '점심_뭐먹지.msg', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    const pool = MENUS.map((m) => [ctx.rng(), m]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, 4);
    const answer = pool[0];
    pool.sort((a, b) => a.localeCompare(b));
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:56px">🧓 팀장님: 아무거나 먹자</div>';
    const say = host.firstChild;
    const box = document.createElement('div');
    box.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px';
    host.append(box);
    pool.forEach((m) => {
      const b = document.createElement('button');
      b.className = 'raised bt';
      b.textContent = m;
      b.addEventListener('click', () => {
        if (m === answer) return ctx.clear();
        say.textContent = `🧓 팀장님: ${REJECTS[Math.floor(ctx.rng() * REJECTS.length)]}`;
        ctx.hit();
      });
      box.append(b);
    });
    // 힌트는 한 번만 흘린다
    T.after(() => { say.textContent = `🧓 팀장님: 음... ${answer} 같은 건 어떨까... 아무거나 먹자`; }, 2500 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
