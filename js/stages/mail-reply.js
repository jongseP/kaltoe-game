// 메일 99+: "답장"과 "전체 답장"이 계속 자리를 바꾼다. 답장 3번이 성공, 전체 답장을 누르면 hit.
import { makeTimers } from './timers.js';
const SUBJ = ['Re: Re: 회의록 확인 부탁', 'FW: 어제 건 관련', 'Re: 금주 보고 양식 변경'];

export default {
  id: 'mail-reply', slot: 'commute', title: '받은메일함 (99+)', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div class="sunken" style="padding:6px;min-height:52px;white-space:pre-line"></div>
      <div style="display:flex;gap:8px;margin-top:8px"></div>`;
    const mail = host.firstChild, row = host.lastChild;
    const mk = (label, fn) => {
      const b = document.createElement('button');
      b.className = 'raised bt'; b.textContent = label; b.style.flex = '1';
      b.addEventListener('click', fn);
      return b;
    };
    let done = 0, flip = false;
    const swap = () => { flip = !flip; row.firstChild.style.order = flip ? 2 : 1; row.lastChild.style.order = flip ? 1 : 2; };
    const show = () => { mail.textContent = `📧 (${done + 1}/3) 수신: 전체 99+\n${SUBJ[done]}`; };
    row.append(
      mk('답장', () => { done++; if (done >= 3) return ctx.clear(); show(); swap(); }),
      mk('전체 답장', () => { ctx.hit(); swap(); }),
    );
    show(); swap();
    T.every(swap, 1600 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.replaceChildren(); } };
  },
};
