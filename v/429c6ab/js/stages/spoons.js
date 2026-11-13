// 수저 세팅: 수저+물컵 세트를 직급 순서(팀장님→과장→대리→사원)대로 자리에 끌어다 놓는다.
// 순서가 틀리면 hit하고 그 상 전체를 다시 차린다. 상 2개를 차리면 성공.
const WHO = ['🧓 팀장님', '과장', '대리', '사원'];
const SCOLD = ['🧓 팀장님: 내가 먼저 아니야?', '과장: 순서가 좀...', '대리: 저보다 사원이 먼저요?'];

export default {
  id: 'spoons', slot: 'lunch', title: '식당_자리세팅', tag: '💼',
  create(host, ctx) {
    host.innerHTML = '<div></div>';
    const msg = host.firstChild;
    const seatsEl = document.createElement('div');
    seatsEl.style.cssText = 'display:flex;gap:6px;margin:8px 0';
    const tray = document.createElement('div');
    tray.style.cssText = 'display:flex;gap:6px;justify-content:space-between;min-height:48px;touch-action:none';
    host.append(seatsEl, tray);
    let table = 1, seats = [], next = 0;

    const setTable = () => {
      msg.textContent = `상 ${table}/2: 직급 순서대로 놓으세요 (팀장님→과장→대리→사원)`;
      next = 0;
      const names = WHO.map((n) => [ctx.rng(), n]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      seats = names.map((n) => {
        const s = document.createElement('div');
        s.className = 'sunken';
        s.style.cssText = 'flex:1;min-width:0;height:64px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px';
        s.textContent = n;
        s.dataset.rank = WHO.indexOf(n);
        return s;
      });
      seatsEl.replaceChildren(...seats);
      tray.replaceChildren(...seats.map(makeSet));
    };
    const place = (seat, t) => {
      if (+seat.dataset.rank !== next) {
        msg.textContent = SCOLD[Math.floor(ctx.rng() * SCOLD.length)] + ' (다시 차리기)';
        ctx.hit();
        return setTable();
      }
      t.remove();
      seat.dataset.full = 1; seat.textContent = '🥄💧'; next++;
      if (next < 4) return;
      if (ctx.goal(++table - 1, 2)) return ctx.clear();
      setTable();
    };
    function makeSet() {
      const t = document.createElement('div');
      t.className = 'raised';
      t.textContent = '🥄💧';
      t.style.cssText = 'flex:1;height:48px;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab';
      let sx = 0, sy = 0, drag = false;
      t.addEventListener('pointerdown', (e) => {
        drag = true; sx = e.clientX; sy = e.clientY;
        try { t.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      });
      t.addEventListener('pointermove', (e) => {
        if (drag) t.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px)`;
      });
      t.addEventListener('pointerup', (e) => {
        if (!drag) return;
        drag = false;
        t.style.transform = '';
        const seat = seats.find((s) => {
          const r = s.getBoundingClientRect();
          return !s.dataset.full && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
        if (seat) place(seat, t);
      });
      t.addEventListener('pointercancel', () => { drag = false; t.style.transform = ''; });
      return t;
    }
    setTable();
    return { pause() {}, resume() {}, destroy() { host.replaceChildren(); } };
  },
};
