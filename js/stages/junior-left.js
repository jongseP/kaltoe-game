// 후배는 이미 칼퇴: 후배가 남기고 간 일을 체크해 끝낸다. 처음 몇 초 동안은 "이것도요~" 하며 계속 늘어난다.
// "🔒 팀장님 확인 필요"는 누르면 안 된다(hit, 잠시 뒤 저절로 풀림). 남은 일이 없으면 성공.
import { makeTimers, pick, handle } from './ui.js';
const TODO = ['회의록 정리', '엑셀 취합', '메일 회신', '자료 출력', '거래처 전화', '견적서 수정', '사진 정리', '일정 공유'];

export default {
  id: 'junior-left', slot: 'leave', title: '후배_인수인계.txt', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:20px"></div><div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;max-height:190px;overflow:hidden"></div>';
    const msg = host.firstChild, list = host.lastChild;
    let adding = true;
    const left = () => list.children.length;
    const status = () => { msg.textContent = adding ? `🧑 후배(퇴근함): "이것도요~" · 남은 일 ${left()}` : `남은 일 ${left()}`; };
    const add = () => {
      const locked = ctx.rng() < 0.25;
      const b = document.createElement('button');
      b.className = 'raised bt';
      b.style.cssText = 'text-align:left;font-size:12px;touch-action:manipulation';
      b.textContent = locked ? `🔒 ${pick(TODO, ctx.rng)} (팀장님 확인 필요)` : `☐ ${pick(TODO, ctx.rng)}`;
      if (locked) T.after(() => { b.textContent = b.textContent.replace('🔒', '☐').replace(' (팀장님 확인 필요)', ''); b.dataset.locked = ''; }, 2500 / ctx.speed);
      b.dataset.locked = locked ? '1' : '';
      b.addEventListener('click', () => {
        if (b.dataset.locked) { msg.textContent = '🧓 "그거 내가 아직 안 봤는데?"'; return ctx.hit(); }
        b.remove(); status();
        if (!adding && left() === 0) ctx.clear();
      });
      list.prepend(b);
      if (left() > 7) { list.lastChild.remove(); msg.textContent = '😩 일이 넘쳐서 하나 놓쳤다'; ctx.hit(); return; }
      status();
    };
    for (let i = 0; i < 3; i++) add();
    T.every(() => { if (adding) add(); }, 700 / ctx.speed);
    T.after(() => { adding = false; status(); if (left() === 0) ctx.clear(); }, 6000);
    return handle(T, host);
  },
};
