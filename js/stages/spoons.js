// 수저 세팅: 수저+물컵 세트를 자리 4곳에 끌어다 놓는다. 팀장님 자리를 마지막까지 남기면 hit.
const WHO = ['🧓 팀장님', '과장', '대리', '사원'];

export default {
  id: 'spoons', slot: 'lunch', title: '식당_자리세팅', tag: '💼',
  create(host, ctx) {
    host.innerHTML = '<div>세트를 자리에 끌어다 놓으세요</div>';
    const msg = host.firstChild;
    const seatsEl = document.createElement('div');
    seatsEl.style.cssText = 'display:flex;gap:6px;margin:8px 0';
    const tray = document.createElement('div');
    tray.style.cssText = 'display:flex;gap:6px;justify-content:space-between;min-height:48px;touch-action:none';
    host.append(seatsEl, tray);
    const names = WHO.map((n) => [ctx.rng(), n]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const seats = names.map((n) => {
      const s = document.createElement('div');
      s.className = 'sunken';
      s.style.cssText = 'flex:1;min-width:0;height:64px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px';
      s.textContent = n;
      if (n === WHO[0]) s.dataset.boss = 1;
      seatsEl.append(s);
      return s;
    });
    let filled = 0, hitDone = false;
    const place = (seat) => {
      seat.dataset.full = 1; seat.textContent = '🥄💧'; filled++;
      if (filled === 4) return ctx.clear();
      const rest = seats.filter((s) => !s.dataset.full);
      if (rest.length === 1 && rest[0].dataset.boss && !hitDone) {
        hitDone = true; msg.textContent = '🧓 팀장님: 내 자리가 맨 마지막이야?'; ctx.hit();
      }
    };
    for (let i = 0; i < 4; i++) {
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
        if (seat) { t.remove(); place(seat); }
      });
      t.addEventListener('pointercancel', () => { drag = false; t.style.transform = ''; });
      tray.append(t);
    }
    return { pause() {}, resume() {}, destroy() { host.replaceChildren(); } };
  },
};
