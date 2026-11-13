// 나 때는 말이야: 말이 정말 끝났을 때만 끄덕인다(6번). 말하는 중이나 "..." 하고 숨 고를 때 끄덕이면 hit.
// 끝난 뒤 끄덕일 시간은 짧다. 놓치면 "내 말 듣고 있어?"(hit).
import { makeTimers } from './timers.js';
const TEXTS = [
  '나 때는 말이야, 밤을 새워도 군소리 하나 없었어',
  '요즘 애들은 말이야... 칼퇴를 당연하게 생각해',
  '내가 신입 때는... 복사기 앞에서 살았어',
  '라떼는 말이야, 회식이 곧 업무였다고',
];

export default {
  id: 'latte', slot: 'early', title: '라떼는.txt', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div class="sunken" style="padding:8px;min-height:92px"></div>
      <div style="text-align:center;margin:6px 0">끄덕임 <b>0</b>/6</div>
      <button class="raised bt" style="width:100%;touch-action:manipulation">🙂 끄덕끄덕</button>`;
    const bubble = host.firstChild, count = host.querySelector('b');
    let state = 'talk', nods = 0, wait = 0, nodded = false, text = '', total = 0, pauseAt = -1, pauseLeft = 0;
    const startTalk = () => {
      state = 'talk'; wait = 0; nodded = false;
      text = TEXTS[Math.floor(ctx.rng() * TEXTS.length)];
      total = (1400 + ctx.rng() * 900) / ctx.speed;
      // 절반 확률로 중간에 숨 고르기(끝난 척)
      pauseAt = ctx.rng() < 0.5 ? Math.floor(text.length * (0.4 + ctx.rng() * 0.3)) : -1;
      pauseLeft = 700 / ctx.speed;
    };
    startTalk();
    T.every(() => {
      if (state === 'talk') {
        const pos = Math.min(text.length, Math.floor(text.length * wait / total));
        if (pos === pauseAt && pauseLeft > 0) {
          pauseLeft -= 50;
          bubble.textContent = `🧓 "${text.slice(0, pos)}..."`;
          return;
        }
        wait += 50;
        bubble.textContent = `🧓 "${text.slice(0, pos)}`;
        if (pos >= text.length) { state = 'end'; wait = 0; bubble.textContent += '"  (…끝)'; }
      } else if (state === 'end') {
        wait += 50;
        if (wait >= 650 / ctx.speed) {
          if (!nodded) { bubble.textContent = '🧓 "내 말 듣고 있어?"'; ctx.hit(); }
          state = 'gap'; wait = 0;
        }
      } else if ((wait += 50) >= 500) startTalk();
    }, 50);
    host.querySelector('button').addEventListener('click', () => {
      if (state === 'talk') return ctx.hit();
      if (state !== 'end' || nodded) return;
      nodded = true; count.textContent = ++nods;
      if (ctx.goal(nods, 6)) ctx.clear();
    });
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
