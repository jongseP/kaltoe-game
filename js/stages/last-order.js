// 17:59 로그아웃: 로그아웃을 4번 눌러야 한다("정말요?"). 누를 때마다 버튼 위로 "이것만 하고 가" 메신저가
// 곧바로 튀어나오고, 그것을 누르면 hit. 메신저가 사라진 뒤에 눌러야 한다.
import { makeTimers } from './timers.js';
const ASKS = ['이것만 하고 가', '잠깐, 한 가지만!', '내일 건데 지금 가능?', '퇴근 전에 확인만', '아 그리고...'];
const LABELS = ['로그아웃', '정말 로그아웃?', '진짜 진짜?', '후회 안 하죠?'];

export default {
  id: 'last-order', slot: 'leave', title: '17:59 로그아웃', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.style.cssText = 'position:relative;height:140px';
    host.innerHTML = '<div>오늘도 수고하셨습니다.</div><button class="raised bt" style="position:absolute;left:50%;top:60px;width:150px;transform:translateX(-50%)">로그아웃</button>';
    const btn = host.querySelector('button');
    let pop = null, step = 0;
    const show = () => {
      pop = document.createElement('div');
      pop.className = 'raised';
      pop.style.cssText = 'position:absolute;left:50%;top:48px;width:200px;height:64px;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer;z-index:2';
      pop.textContent = `💬 팀장님: ${ASKS[Math.floor(ctx.rng() * ASKS.length)]}`;
      pop.addEventListener('click', () => { pop.remove(); pop = null; ctx.hit(); });
      host.append(pop);
      T.after(() => { pop?.remove(); pop = null; }, (900 + ctx.rng() * 900) / ctx.speed);
    };
    btn.addEventListener('click', () => {
      if (++step >= LABELS.length) return ctx.clear();
      btn.textContent = LABELS[step];
      T.after(show, (80 + ctx.rng() * 250) / ctx.speed);
    });
    // 가만히 있어도 가끔 튀어나온다
    T.every(() => { if (!pop && ctx.rng() < 0.5) show(); }, 1500 / ctx.speed);
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.style.cssText = ''; host.replaceChildren(); } };
  },
};
