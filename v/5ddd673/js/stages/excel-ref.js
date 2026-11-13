// 엑셀 #REF!: 오류 칸을 탭해 고친다(6번). 곧 알림창이 오류 칸을 가리고, 그때는 알림창의 [확인]만 눌러야 한다. 다른 곳을 누르면 hit.
// 오류 칸을 너무 오래 두면 옆 칸으로 번진다(hit).
import { makeTimers } from './timers.js';

export default {
  id: 'excel-ref', slot: 'early', title: '결산_최종.xls', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.style.position = 'relative';
    const info = document.createElement('div');
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:2px;height:180px';
    host.append(info, grid);
    const num = () => String(100 + Math.floor(ctx.rng() * 900));
    const cells = Array.from({ length: 12 }, () => {
      const c = document.createElement('div');
      c.className = 'sunken';
      c.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:12px';
      c.textContent = num();
      grid.append(c);
      return c;
    });
    let active = -1, fixed = 0, alertEl = null, cancels = [];
    const clearTimers = () => { cancels.forEach((c) => c()); cancels = []; };
    const showAlert = () => {
      const c = cells[active];
      alertEl = document.createElement('div');
      alertEl.className = 'raised';
      alertEl.style.cssText = 'position:absolute;width:170px;padding:8px;text-align:center;font-size:12px;z-index:2';
      alertEl.style.left = `${Math.max(0, Math.min(host.clientWidth - 170, c.offsetLeft + c.offsetWidth / 2 - 85))}px`;
      alertEl.style.top = `${Math.max(0, Math.min(120, c.offsetTop + c.offsetHeight / 2 - 40))}px`;
      alertEl.innerHTML = '저장하지 않은 변경 사항이 있습니다<br><button class="raised bt" style="margin-top:6px">확인</button>';
      alertEl.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); alertEl?.remove(); alertEl = null; });
      host.append(alertEl);
    };
    const pick = () => {
      let n;
      do n = Math.floor(ctx.rng() * 12); while (n === active);
      active = n;
      info.textContent = `#REF! 고치기 ${fixed}/6`;
      cells[n].textContent = '#REF!'; cells[n].style.color = '#c00';
      if (ctx.rng() < 0.7) cancels.push(T.after(showAlert, (500 + ctx.rng() * 600) / ctx.speed));
      // 오래 두면 번진다
      cancels.push(T.after(() => { ctx.hit(); info.textContent = '⚠ 오류가 번졌습니다!'; }, 3500 / ctx.speed));
    };
    cells.forEach((c, i) => c.addEventListener('click', () => {
      if (alertEl) return ctx.hit();
      if (i !== active) return ctx.hit();
      c.textContent = num(); c.style.color = '';
      clearTimers();
      if (ctx.goal(++fixed, 6)) { active = -1; return ctx.clear(); }
      pick();
    }));
    pick();
    return { pause: T.pause, resume: T.resume, destroy() { T.destroy(); host.style.position = ''; host.replaceChildren(); } };
  },
};
