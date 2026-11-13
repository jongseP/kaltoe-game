import { RANKS, STARS_TO_PROMOTE, STAR_PRICE } from '../config.js';
import { daysToPromote, buyStar } from '../progress.js';
import { makeWindow } from './window.js';

function button(text, onClick, label) {
  const b = document.createElement('button');
  b.className = 'raised bt';
  b.textContent = text;
  if (label) b.setAttribute('aria-label', label);
  b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return b;
}

// 사기 버튼: 누르면 onBuyStar(progress)가 돌려준 {p, ok}로 화면을 다시 그린다. 저장은 호출한 쪽 몫이다.
function buyButton(progress, onBuyStar, rerender) {
  if (progress.coins < STAR_PRICE || !onBuyStar) return null;
  return button(`★ 사기 (💰${STAR_PRICE})`, () => {
    const r = onBuyStar(progress) ?? buyStar(progress);
    if (r.ok) rerender(r.p);
  });
}

export function showCleared(el, { progress, promoted: promotedAtCall, coinsEarned, stats = '', onNext, onShare, onBuyStar }) {
  const render = (p) => {
    const promoted = promotedAtCall || p.rank > progress.rank;
    const body = document.createElement('div');
    body.className = 'res';
    const days = daysToPromote(p);
    const top = days === null;
    const cells = top ? '' : Array.from({ length: STARS_TO_PROMOTE }, (_, i) => `<i${i < p.stars ? '' : ' class="off"'}></i>`).join('');
    body.innerHTML = `
      <div class="big">18:00</div>
      <b>칼퇴 성공!</b><br>
      보너스 💰×${coinsEarned} · ★ +1
      ${promoted ? `<div class="promoted">🎊 ${RANKS[p.rank]} 진급!</div>` : ''}
      ${top ? `<div>연속 칼퇴 ${p.clearStreak}일</div>` : `<div class="sunken blocks">${cells}</div>`}
      <div>${top ? '최고 직급' : `${RANKS[p.rank + 1]} 진급까지 ${days}일`}</div>
      <div class="stats">${stats}</div>`;
    const btns = document.createElement('div');
    btns.className = 'btns';
    const buy = buyButton(p, onBuyStar, render);
    btns.append(button('내일도 출근', onNext), ...(buy ? [buy] : []), button('공유', onShare, '결과 공유'));
    body.append(btns);
    el.replaceChildren(makeWindow({ title: '🎉 퇴근.exe', body }));
  };
  render(progress);
}

// progress(필수): 야근 처리가 끝난 진급 기록. 사기 버튼과 다음 직급 이름에 쓴다.
export function showOvertime(el, { progress, stageTitle, hours, stats = '', daysBefore, daysAfter, lostStar, onRetry, onShare, onBuyStar }) {
  const render = (p, after) => {
    const root = document.createElement('div');
    root.className = 'overtime';
    const days = daysToPromote(p);
    // 임원이거나 사기로 직급이 바뀌면 "→ 이제 N일" 줄은 의미가 없어 숨긴다
    const showDays = lostStar && p.rank === progress.rank && days !== null;
    root.innerHTML = `
      <b class="tag">야근 ${hours}시간 확정</b><br><br>
      ${stageTitle} 단계에서 처음 멘탈이 바닥났습니다.<br>
      멘탈이 바닥날 때마다 야근이 1시간씩 늘어납니다.<br>
      <span class="stats">${stats}</span><br><br>
      ${showDays ? `${RANKS[p.rank + 1]} 진급까지 <b>${daysBefore}일</b> 남았었습니다 → 이제 <b>${after}일</b><br>` : ''}<br>
      아무 곳이나 누르면 다시 출근합니다_<br><br>`;
    const buy = buyButton(p, onBuyStar, (np) => render(np, daysToPromote(np)));
    root.append(...(buy ? [buy] : []), button('공유', onShare, '결과 공유'));
    const shownAt = Date.now();
    root.addEventListener('click', () => { if (Date.now() - shownAt >= 600) onRetry(); }); // 연타로 결과를 건너뛰지 않게
    el.replaceChildren(root);
  };
  render(progress, daysAfter);
}
