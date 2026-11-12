// 주간보고: 진짜 "예(진짜)" 하나를 찾아 누른다. 버튼은 주기적으로 자리를 바꾼다.
import { makeTimers } from './timers.js';

export default {
  id: 'weekly-report', slot: 'morning', title: '주간보고_v3.doc', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    const labels = ['예', '예', '예', '아니오', '예(진짜)'];
    host.innerHTML = '<p>제출하시겠습니까?</p>';
    const box = document.createElement('div');
    box.style.cssText = 'display:flex;flex-direction:column;gap:6px';
    host.append(box);
    const shuffle = () => {
      const order = labels.map((l) => [ctx.rng(), l]).sort((a, b) => a[0] - b[0]);
      box.replaceChildren(...order.map(([, l]) => {
        const b = document.createElement('button');
        b.className = 'raised bt';
        b.textContent = l;
        b.addEventListener('click', () => (l === '예(진짜)' ? ctx.clear() : ctx.hit()));
        return b;
      }));
    };
    shuffle();
    T.every(shuffle, 4000 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
