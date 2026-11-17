// 끼어들기: "팀장님이 뒤에 서 계십니다". 3초 안에 [확인]을 안 누르면 hit.
import { makeWindow } from '../ui/window.js';
import { makeTimers } from './timers.js';

export default {
  id: 'boss-behind', title: '⚠ 경고',
  create(host, ctx) {
    const T = makeTimers();
    const body = document.createElement('div');
    body.innerHTML = '<div>⚠ 팀장님이 뒤에 서 계십니다</div><button class="raised bt" style="width:100%;margin-top:8px">확인</button>';
    body.querySelector('button').addEventListener('click', () => ctx.close());
    host.append(makeWindow({ title: '⚠ 경고', body }));
    T.after(() => { ctx.hit(); ctx.close(); }, 3000);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
