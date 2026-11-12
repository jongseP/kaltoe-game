// 17:59 로그아웃: 로그아웃을 누르면 성공. 버튼 위로 "이것만 하고 가" 메신저가 떠서 그것을 누르면 hit.
import { makeTimers } from './timers.js';
const ASKS = ['이것만 하고 가', '잠깐, 한 가지만!', '내일 건데 지금 가능?', '퇴근 전에 확인만'];

export default {
  id: 'last-order', slot: 'leave', title: '17:59 로그아웃', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.style.cssText = 'position:relative;height:140px';
    host.innerHTML = '<div>오늘도 수고하셨습니다.</div><button class="raised bt" style="position:absolute;left:50%;top:60px;width:150px;transform:translateX(-50%)">로그아웃</button>';
    let pop = null;
    host.querySelector('button').addEventListener('click', () => ctx.clear());
    const show = () => {
      pop = document.createElement('div');
      pop.className = 'raised';
      pop.style.cssText = 'position:absolute;left:50%;top:48px;width:200px;height:64px;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer;z-index:2';
      pop.textContent = `💬 팀장님: ${ASKS[Math.floor(ctx.rng() * ASKS.length)]}`;
      pop.addEventListener('click', () => { pop.remove(); pop = null; ctx.hit(); });
      host.append(pop);
      T.after(() => { pop?.remove(); pop = null; T.after(show, 1800 / ctx.speed); }, 1700 / ctx.speed);
    };
    T.after(show, 900 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.style.cssText = ''; host.replaceChildren(); } };
  },
};
