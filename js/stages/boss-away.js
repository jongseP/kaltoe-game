// 끼어들기: "팀장님 자리 비움". 3초 안에 탭하면 💰 +1.
import { makeWindow } from '../ui/window.js';
import { makeTimers } from './timers.js';

export default {
  id: 'boss-away', title: '💰 기회',
  create(host, ctx) {
    const T = makeTimers();
    const body = document.createElement('button');
    body.className = 'raised bt';
    body.style.width = '100%';
    body.textContent = '💰 팀장님 자리 비움! (탭해서 줍기)';
    body.addEventListener('click', () => { ctx.addCoin(); ctx.close(); });
    host.append(makeWindow({ title: '💰 기회', body }));
    T.after(() => ctx.close(), 3000);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
