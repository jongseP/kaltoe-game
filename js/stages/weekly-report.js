// 주간보고: 비슷한 가짜 사이에서 진짜 버튼을 찾는다. 3번 확인해야 제출되고, 버튼은 자주 섞인다.
import { makeTimers } from './timers.js';
const ROUNDS = [
  { q: '제출하시겠습니까?', real: '예(진짜)', fake: ['예', '예(진자)', '아니오', '예 (짜진)'] },
  { q: '정말 제출하시겠습니까?', real: '정말 예', fake: ['정말 아니오', '정말예요?', '진짜 예', '예 정말'] },
  { q: '팀장님 결재 없이 보내도 될까요?', real: '네 보낼게요', fake: ['네 보넬게요', '아뇨 보낼게요', '네 보류할게요', '내 보낼게요'] },
];

export default {
  id: 'weekly-report', slot: 'morning', title: '주간보고_v3.doc', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<p></p>';
    const q = host.firstChild;
    const box = document.createElement('div');
    box.style.cssText = 'display:flex;flex-direction:column;gap:6px';
    host.append(box);
    let round = 0;
    const shuffle = () => {
      const r = ROUNDS[round];
      if (!r) return;
      q.textContent = `(${round + 1}/3) ${r.q}`;
      const order = [r.real, ...r.fake].map((l) => [ctx.rng(), l]).sort((a, b) => a[0] - b[0]);
      box.replaceChildren(...order.map(([, l]) => {
        const b = document.createElement('button');
        b.className = 'raised bt';
        b.textContent = l;
        b.addEventListener('click', () => {
          if (round >= ROUNDS.length) return;
          if (l !== r.real) return ctx.hit();
          if (++round >= ROUNDS.length) return ctx.clear();
          shuffle();
        });
        return b;
      }));
    };
    shuffle();
    T.every(shuffle, 1400 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
