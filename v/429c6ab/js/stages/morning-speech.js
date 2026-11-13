// 아침 조회 훈화: 졸음 막대가 계속 차오른다. 탭해서 정신을 차리고 12초 버티면 성공. 100%가 되면 졸아서 hit.
// 중간에 "박수!"가 뜨면 1초 안에 박수를 쳐야 한다(놓치면 hit). 박수 타이밍이 아닌데 박수 치면 hit.
import { makeTimers, button, handle } from './ui.js';

export default {
  id: 'morning-speech', slot: 'commute', title: '월요조회.avi', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div class="sunken" style="padding:6px;min-height:40px">🧓 "에... 그러니까 우리 회사가..."</div>
      <div style="margin:6px 0">졸음 <span></span></div>
      <div class="sunken" style="height:18px;padding:1px"><div style="height:100%;background:#800000"></div></div>
      <div style="display:flex;gap:6px;margin-top:8px"></div>`;
    const talk = host.firstChild, pct = host.children[1].firstElementChild, bar = host.children[2].firstChild, row = host.lastChild;
    let z = 20, left = 12000, clap = false, clapTimer = () => {};
    const draw = () => { bar.style.width = `${z}%`; pct.textContent = `${Math.floor(z)}% · 남은 훈화 ${Math.ceil(left / 1000)}초`; };
    T.every(() => {
      z = Math.min(100, z + 0.9 * ctx.speed);
      if (z >= 100) { ctx.hit(); talk.textContent = '🧓 "거기 자는 사람 누구야?"'; z = 40; }
      left -= 50;
      ctx.goal(Math.floor((12000 - left) / 1000), 12, '초');
      if (left <= 0) return ctx.clear();
      draw();
    }, 50);
    T.every(() => {
      if (clap || ctx.rng() < 0.4) return;
      clap = true; talk.textContent = '🧓 "...자 박수!" 👏';
      clapTimer = T.after(() => { if (clap) { clap = false; ctx.hit(); talk.textContent = '🧓 "박수 안 쳐?"'; } }, 1000 / ctx.speed);
    }, 2200);
    row.append(
      button('😳 정신 차리기', () => { z = Math.max(0, z - 9); draw(); }, 'flex:2;height:48px'),
      button('👏 박수', () => {
        if (!clap) { talk.textContent = '🧓 "아직 안 끝났는데?"'; return ctx.hit(); }
        clap = false; clapTimer(); talk.textContent = '🧓 "에... 그리고..."';
      }, 'flex:1;height:48px'),
    );
    draw();
    return handle(T, host);
  },
};
