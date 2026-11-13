// 책임 떠넘기기 피하기: 🔥책임이 사람들 사이를 돈다. 나한테 멈추면 0.8초 안에 [패스]! 못 넘기면 hit.
// 나한테 없을 때 패스를 누르면 "왜 찔려?" hit. 6번 넘기면 성공.
import { makeTimers, button, handle } from './ui.js';
const PEOPLE = ['김대리', '나', '박과장', '이주임'];

export default {
  id: 'blame-dodge', slot: 'late', title: '장애보고서_원인.doc', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:20px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0"></div>';
    const msg = host.firstChild, grid = host.lastChild;
    const seats = PEOPLE.map((p) => { const d = document.createElement('div'); d.className = 'sunken'; d.style.cssText = 'height:44px;display:flex;align-items:center;justify-content:center'; grid.append(d); return d; });
    let at = 0, passes = 0, cancel = () => {};
    const draw = () => seats.forEach((d, i) => { d.textContent = `${i === at ? '🔥 ' : ''}${PEOPLE[i]}`; d.style.background = i === at && PEOPLE[i] === '나' ? '#ffc0c0' : ''; });
    const status = () => { msg.textContent = `책임 피하기 ${passes}/6`; };
    const move = () => {
      let n;
      do n = Math.floor(ctx.rng() * 4); while (n === at);
      at = n; draw();
      if (PEOPLE[at] === '나') cancel = T.after(() => { msg.textContent = '😱 "이거 네가 한 거지?"'; ctx.hit(); move(); }, 800 / ctx.speed);
      else cancel = T.after(move, (350 + ctx.rng() * 500) / ctx.speed);
    };
    host.append(button('👉 패스!', () => {
      if (PEOPLE[at] !== '나') { msg.textContent = '🧓 "왜 찔려? 너 뭐 했어?"'; return ctx.hit(); }
      cancel();
      if (++passes >= 6) return ctx.clear();
      status(); move();
    }, 'width:100%;height:48px'));
    status(); draw(); cancel = T.after(move, 400);
    return handle(T, host);
  },
};
