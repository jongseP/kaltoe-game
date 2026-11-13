// 연차 결재: 결재 상태가 계속 바뀐다. "승인"이 잠깐 뜰 때만 [확정]을 눌러야 한다(2일치). 다른 상태에서 누르면 hit.
import { makeTimers, button, pick, handle } from './ui.js';
const OTHER = ['검토 중...', '검토 중...', '검토 중...', '보류 (팀장님 회의 중)', '반려 (사유: 그날 바쁨)', '재검토 요청', '승인 대기'];

export default {
  id: 'leave-approval', slot: 'morning', title: '전자결재_연차신청', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div></div><div class="sunken" style="padding:10px;margin:8px 0;text-align:center;font-weight:bold;min-height:22px"></div>`;
    const msg = host.firstChild, st = host.children[1];
    let approved = false, days = 0;
    const tick = () => {
      approved = ctx.rng() < 0.18;
      st.textContent = approved ? '✅ 승인' : pick(OTHER, ctx.rng);
      st.style.color = approved ? '#008000' : '';
    };
    tick();
    T.every(tick, 750 / ctx.speed);
    host.append(button('📝 확정', () => {
      if (!approved) { msg.textContent = '⚠ 아직 승인 안 났는데요?'; return ctx.hit(); }
      approved = false;
      if (++days >= 2) return ctx.clear();
      msg.textContent = '연차 1일 확정! 하루 더 (1/2)';
      tick();
    }, 'width:100%;height:44px'));
    msg.textContent = '"승인"일 때만 확정하세요 (0/2)';
    return handle(T, host);
  },
};
