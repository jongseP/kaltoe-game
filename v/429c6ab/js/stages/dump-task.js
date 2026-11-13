// 업무 떠넘기기 피하기: 동료들이 던진 업무 카드가 책상으로 떨어진다. 떨어지기 전에 탭해서 돌려보낸다(10장).
// 내 이름이 적힌 "본인 업무"까지 돌려보내면 hit. 남의 업무가 책상에 떨어져도 hit.
import { makeTimers, pick, handle } from './ui.js';
const FROM = ['김대리', '박과장', '이주임', '최차장'];

export default {
  id: 'dump-task', slot: 'morning', title: '업무분장.xlsx', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.style.cssText = 'position:relative;height:220px;overflow:hidden';
    host.innerHTML = '<div style="position:relative;z-index:3"></div><div class="sunken" style="position:absolute;left:0;right:0;bottom:0;height:26px;text-align:center">🗂 내 책상</div>';
    const msg = host.firstChild;
    let back = 0;
    const cards = new Set();
    const draw = () => { msg.textContent = `돌려보낸 업무 ${back}/10`; };
    const spawn = () => {
      const mine = ctx.rng() < 0.25;
      const c = document.createElement('div');
      c.className = 'raised';
      c.textContent = mine ? '📄 본인 업무' : `📄 ${pick(FROM, ctx.rng)} 업무`;
      c.style.cssText = `position:absolute;left:${5 + Math.floor(ctx.rng() * 55)}%;top:20px;width:38%;padding:6px;font-size:12px;cursor:pointer;${mine ? 'background:#c0ffc0' : ''}`;
      const card = { c, y: 20, mine };
      c.addEventListener('pointerdown', () => {
        if (!cards.has(card)) return;
        cards.delete(card); c.remove();
        if (mine) { msg.textContent = '🧓 "그건 네 일이잖아"'; return ctx.hit(); }
        if (ctx.goal(++back, 10)) return ctx.clear();
        draw();
      });
      cards.add(card);
      host.append(c);
    };
    T.every(() => {
      for (const card of [...cards]) {
        card.y += 2.2 * ctx.speed;
        card.c.style.top = `${card.y}px`;
        if (card.y > 160) {
          cards.delete(card); card.c.remove();
          if (!card.mine) { msg.textContent = '😩 떠넘겨진 업무를 받았다'; ctx.hit(); }
        }
      }
    }, 50);
    T.every(spawn, 800 / ctx.speed);
    spawn(); draw();
    return handle(T, host);
  },
};
