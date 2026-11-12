// 나 때는 말이야: 말풍선이 끝났을 때 맞춰 끄덕이기(5번). 말하는 중에 끄덕이면 hit.
import { makeTimers } from './timers.js';
const TEXT = '나 때는 말이야, 밤을 새워도 군소리 하나 없었어. 요즘은 말이야...';

export default {
  id: 'latte', slot: 'early', title: '라떼는.txt', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div class="sunken" style="padding:8px;min-height:92px"></div>
      <div style="text-align:center;margin:6px 0">끄덕임 <b>0</b>/5</div>
      <button class="raised bt" style="width:100%;touch-action:manipulation">🙂 끄덕끄덕</button>`;
    const bubble = host.firstChild, count = host.querySelector('b');
    let state = 'talk', nods = 0, pos = 0, wait = 0, nodded = false, total = 0;
    const startTalk = () => { state = 'talk'; pos = 0; wait = 0; nodded = false; bubble.textContent = '🧓 "'; total = (1500 + ctx.rng() * 700) / ctx.speed; };
    startTalk();
    T.every(() => {
      wait += 50;
      if (state === 'talk') {
        pos = Math.min(TEXT.length, Math.floor(TEXT.length * wait / total));
        bubble.textContent = `🧓 "${TEXT.slice(0, pos)}${pos < TEXT.length ? '' : '"'}`;
        if (pos >= TEXT.length) { state = 'end'; wait = 0; bubble.textContent += '  (…끝)'; }
      } else if (state === 'end' && wait >= 1200) { state = 'gap'; wait = 0; } else if (state === 'gap' && wait >= 300) startTalk();
    }, 50);
    host.querySelector('button').addEventListener('click', () => {
      if (state === 'talk') return ctx.hit();
      if (state !== 'end' || nodded) return;
      nodded = true; count.textContent = ++nods;
      if (nods >= 5) ctx.clear();
    });
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
