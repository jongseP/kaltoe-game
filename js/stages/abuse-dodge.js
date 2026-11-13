// 갑질 막말: 위에서 막말 말풍선이 3줄로 떨어진다. ◀ ▶로 자리를 옮겨 피한다. 맞으면 hit. 12초 버티면 성공.
import { makeTimers, button, pick, handle } from './ui.js';
const WORDS = ['이것도 못 해?', '머리는 장식이야?', '월급 받으면서', '내가 해도 이것보단', '생각이 없어?', '정신 안 차려?'];

export default {
  id: 'abuse-dodge', slot: 'late', title: '팀장실_호출.mp3', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:18px"></div><div class="sunken" style="position:relative;height:170px;overflow:hidden"></div><div style="display:flex;gap:6px;margin-top:6px"></div>';
    const msg = host.firstChild, field = host.children[1], row = host.lastChild;
    const me = document.createElement('div');
    me.textContent = '🙇';
    me.style.cssText = 'position:absolute;bottom:4px;width:33%;text-align:center;font-size:28px;transition:left .08s';
    field.append(me);
    let lane = 1, left = 12000;
    const drops = new Set();
    const place = () => { me.style.left = `${lane * 33.33}%`; };
    T.every(() => {
      left -= 50;
      msg.textContent = `버티기 ${Math.ceil(left / 1000)}초`;
      if (left <= 0) return ctx.clear();
      for (const d of [...drops]) {
        d.y += 3 * ctx.speed;
        d.el.style.top = `${d.y}px`;
        if (d.y > 118 && d.y < 150 && d.lane === lane) { drops.delete(d); d.el.remove(); msg.textContent = '💢 맞았다'; ctx.hit(); }
        else if (d.y > 170) { drops.delete(d); d.el.remove(); }
      }
    }, 50);
    T.every(() => {
      const d = { lane: Math.floor(ctx.rng() * 3), y: -20, el: document.createElement('div') };
      d.el.className = 'raised';
      d.el.textContent = `💢${pick(WORDS, ctx.rng)}`;
      d.el.style.cssText = `position:absolute;left:${d.lane * 33.33 + 1}%;width:31%;font-size:11px;padding:2px;text-align:center`;
      drops.add(d); field.append(d.el);
    }, 650 / ctx.speed);
    row.append(
      button('◀', () => { lane = Math.max(0, lane - 1); place(); }, 'flex:1;height:52px;font-size:20px'),
      button('▶', () => { lane = Math.min(2, lane + 1); place(); }, 'flex:1;height:52px;font-size:20px'),
    );
    place();
    return handle(T, host);
  },
};
