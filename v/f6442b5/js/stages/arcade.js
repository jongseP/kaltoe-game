// 몸으로 하는 게임 6개 (시간대마다 1개): 뛰기·긋기·합치기·던지기·잡기·끌어다 놓기. 약속은 run.js 머리말과 같다.
import { el, pick } from './ui.js';

// 화면이 그려질 때마다 step(dt초)을 부르는 루프. 멈췄다 이을 수 있다.
function animate(step) {
  let id = 0, last = 0, on = false;
  const f = (t) => { const dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t; id = requestAnimationFrame(f); step(dt); };
  const A = {
    pause() { on = false; cancelAnimationFrame(id); },
    resume() { if (on) return; on = true; last = performance.now(); id = requestAnimationFrame(f); },
  };
  A.resume();
  return A;
}
const live = (host, A) => ({ pause: A.pause, resume: A.resume, destroy() { A.pause(); host.replaceChildren(); } });
const field = (h) => el(`<div class="sunken" style="position:relative;height:${h}px;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none"></div>`);
// 가운데 좌표로 옮기는 네모 칸(글자 하나)
function sprite(txt, box) {
  const d = document.createElement('div');
  d.textContent = txt;
  d.style.cssText = `position:absolute;left:0;top:0;width:${box}px;height:${box}px;line-height:${box}px;font-size:${box * 0.75}px;text-align:center;touch-action:none`;
  return { el: d, box };
}
const move = (s, x, y) => { s.x = x; s.y = y; s.el.style.transform = `translate(${x - s.box / 2}px,${y - s.box / 2}px)`; };
const at = (e, f) => { const r = f.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
const capture = (node, e) => { try { node.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } };
const tip = (text) => el(`<div style="position:absolute;top:2px;left:0;right:0;text-align:center;font-size:11px;color:#808080;pointer-events:none">${text}</div>`);

// 지각 달리기: 화면을 누르면 뛴다. 12초 동안 장애물을 넘는다. 부딪히면 hit.
const lateRun = {
  id: 'late-run', slot: 'commute', title: '지각_달리기.exe', tag: '🎮',
  create(host, ctx) {
    const f = field(150), G = 128, X = 50;
    f.append(tip('👆 화면을 누르면 점프'), el(`<div style="position:absolute;left:0;right:0;top:${G + 16}px;border-top:2px solid #404040"></div>`));
    host.append(f);
    const me = sprite('🏃', 38);
    me.el.innerHTML = '<span style="display:inline-block;transform:scaleX(-1)">🏃</span>'; // 오른쪽을 보게 뒤집는다
    f.append(me.el);
    let h = 0, vy = 0, t = 0, next = 0.8, done = false;
    const obs = [];
    f.addEventListener('pointerdown', () => { if (h === 0) vy = 430; });
    const A = animate((dt) => {
      if (done) return;
      t += dt;
      if (ctx.goal(Math.floor(t), 12, '초')) { done = true; return ctx.clear(); }
      vy -= 1500 * dt; h = Math.max(0, h + vy * dt); if (h === 0) vy = 0;
      move(me, X, G - 3 - h);
      // 간격은 시간으로 잡는다: 빨라질수록 장애물 사이 거리도 벌어져 항상 넘을 수 있다
      if ((next -= dt) <= 0) { next = 0.9 + ctx.rng() * 0.8; const o = sprite(pick(['🚧', '🐕', '🛴', '🧳'], ctx.rng), 28); move(o, f.clientWidth + 20, G + 2); obs.push(o); f.append(o.el); }
      for (const o of [...obs]) {
        move(o, o.x - 190 * ctx.speed * dt, o.y);
        const bump = Math.abs(o.x - X) < 20 && h < 22;
        if (bump) ctx.hit();
        if (bump || o.x < -20) { o.el.remove(); obs.splice(obs.indexOf(o), 1); }
      }
    });
    return live(host, A);
  },
};

// 잠금 패턴: 잠깐 보여 준 순서대로 점을 한 번에 긋는다(2번). 틀리면 hit, 다시 보여 준다.
const patternLock = {
  id: 'pattern-lock', slot: 'morning', title: '📱 공용_태블릿_잠금', tag: '🎮',
  create(host, ctx) {
    const msg = el('<div style="min-height:20px"></div>'), f = field(200);
    host.append(msg, f);
    const dots = Array.from({ length: 9 }, (_, i) => {
      const d = el('<div style="position:absolute;width:36px;height:36px;margin:-18px;border-radius:50%;border:2px solid #404040;line-height:32px;text-align:center;font-weight:bold;pointer-events:none"></div>');
      d.style.left = `${20 + 30 * (i % 3)}%`; d.style.top = `${18 + 32 * Math.floor(i / 3)}%`;
      return d;
    });
    f.append(...dots);
    let want = [], got = [], showing = true, wait = 0, n = 0, down = false;
    const paint = () => dots.forEach((d, i) => {
      const k = (showing ? want : got).indexOf(i);
      d.textContent = showing && k >= 0 ? k + 1 : '';
      d.style.background = k < 0 ? '#c0c0c0' : showing ? '#ffe14d' : '#1084d0';
    });
    const show = () => { showing = true; down = false; got = []; wait = 1.8 / ctx.speed; msg.textContent = '👀 순서를 외우세요'; paint(); };
    const deal = () => { // 이웃한 점으로만 이어지는 길 (두 번째는 한 칸 더 길다)
      let c = Math.floor(ctx.rng() * 9);
      want = [c];
      while (want.length < 4 + n) {
        const near = dots.map((_, j) => j).filter((j) => !want.includes(j) && Math.abs(j % 3 - c % 3) <= 1 && Math.abs(Math.floor(j / 3) - Math.floor(c / 3)) <= 1);
        if (!near.length) break;
        want.push(c = pick(near, ctx.rng));
      }
      show();
    };
    const track = (e) => {
      const [x, y] = at(e, f), W = f.clientWidth, H = f.clientHeight;
      const i = dots.findIndex((_, j) => Math.hypot(x - W * (0.2 + 0.3 * (j % 3)), y - H * (0.18 + 0.32 * Math.floor(j / 3))) < 24);
      if (i >= 0 && !got.includes(i)) { got.push(i); paint(); }
    };
    f.addEventListener('pointerdown', (e) => { if (showing) return; down = true; got = []; capture(f, e); track(e); });
    f.addEventListener('pointermove', (e) => { if (down) track(e); });
    const up = () => {
      if (!down) return;
      down = false;
      if (!got.length) return;
      if (got.join() !== want.join()) { ctx.hit(); return show(); }
      if (ctx.goal(++n, 2)) return ctx.clear();
      deal();
    };
    f.addEventListener('pointerup', up);
    f.addEventListener('pointercancel', up);
    deal();
    const A = animate((dt) => { if (showing && (wait -= dt) <= 0) { showing = false; msg.textContent = '👆 같은 순서로 손을 떼지 않고 긋기'; paint(); } });
    return live(host, A);
  },
};

// 티끌 모아 태산: 좌우로 끌어 조준하고 손을 떼면 떨어진다. 같은 것끼리 닿으면 합쳐져 커진다. 💎를 만들면 성공.
const LV = [['💲', 15, '#ffe9a0'], ['💵', 21, '#b8e6b0'], ['💰', 28, '#f0c070'], ['💎', 36, '#a8d8ff']];
const coinMerge = {
  id: 'coin-merge', slot: 'lunch', title: '티끌_모아_태산.exe', tag: '🎮',
  create(host, ctx) {
    const f = field(220);
    f.append(tip('↔ 끌어서 조준 · 손 떼면 떨어짐 · 💲→💵→💰→💎'));
    host.append(f);
    ctx.goal(0, 3);
    const balls = [];
    let cur = null, cool = 0, aim = null, best = 0, done = false;
    const mk = (lv, x, y) => {
      const [ch, r, bg] = LV[lv];
      const b = Object.assign(sprite(ch, r * 2), { lv, r, vx: 0, vy: 0 });
      b.el.style.cssText += `;background:${bg};border-radius:50%;box-shadow:inset 0 0 0 1px #404040;pointer-events:none`;
      f.append(b.el); move(b, x, y);
      return b;
    };
    const point = (e) => { if (!cur) return; aim = at(e, f)[0]; capture(f, e); };
    f.addEventListener('pointerdown', point);
    f.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType !== 'mouse') point(e); });
    f.addEventListener('pointerup', () => { if (!cur) return; balls.push(cur); cur = null; cool = 0.4; });
    const A = animate((dt) => {
      if (done) return;
      const W = f.clientWidth, H = f.clientHeight;
      aim ??= W / 2;
      if (!cur && (cool -= dt) <= 0) cur = mk(ctx.rng() < 0.6 ? 0 : 1, aim, 0);
      if (cur) move(cur, Math.max(cur.r, Math.min(W - cur.r, aim)), cur.r + 14);
      for (const b of balls) { b.vy += 1100 * dt; b.vx *= 0.99; b.x += b.vx * dt; b.y += b.vy * dt; }
      // 같은 것끼리 닿았으면 합친다
      for (let again = true; again;) {
        again = false;
        for (const a of balls) {
          const b = a.lv < 3 && balls.find((o) => o !== a && o.lv === a.lv && Math.hypot(o.x - a.x, o.y - a.y) < a.r + o.r + 1);
          if (!b) continue;
          a.el.remove(); b.el.remove();
          balls.splice(balls.indexOf(a), 1); balls.splice(balls.indexOf(b), 1);
          const m = mk(a.lv + 1, (a.x + b.x) / 2, (a.y + b.y) / 2);
          m.vx = (a.vx + b.vx) / 2; m.vy = (a.vy + b.vy) / 2;
          balls.push(m);
          best = Math.max(best, m.lv);
          if (ctx.goal(best, 3)) { done = true; return ctx.clear(); }
          again = true;
          break;
        }
      }
      // ponytail: 모든 쌍을 4번씩 밀어내는 단순 물리(O(n²)). 공이 수십 개를 넘기면 격자 분할로 바꾼다.
      for (let k = 0; k < 4; k++) {
        for (const b of balls) {
          if (b.x < b.r) { b.x = b.r; b.vx *= -0.3; }
          if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -0.3; }
          if (b.y > H - b.r) { b.y = H - b.r; b.vy *= -0.2; }
        }
        for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, o = a.r + b.r - d;
          if (o <= 0) continue;
          const nx = dx / d, ny = dy / d;
          a.x -= nx * o / 2; a.y -= ny * o / 2; b.x += nx * o / 2; b.y += ny * o / 2;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) { a.vx += rel * 0.6 * nx; a.vy += rel * 0.6 * ny; b.vx -= rel * 0.6 * nx; b.vy -= rel * 0.6 * ny; }
        }
      }
      for (const b of balls) move(b, b.x, b.y);
    });
    return live(host, A);
  },
};

// 휴지통 골인: 아무 데나 잡고 뒤로 당겼다 놓으면 종이 뭉치가 날아간다. 🗑에 3번 넣는다. 빗나가도 벌점은 없다.
const paperToss = {
  id: 'paper-toss', slot: 'early', title: '휴지통_골인.exe', tag: '🎮',
  create(host, ctx) {
    const f = field(210);
    f.append(tip('↙ 뒤로 당겼다가 놓기 (새총처럼)'));
    host.append(f);
    const ball = sprite('📄', 30), bin = sprite('🗑️', 44);
    const dotsEl = Array.from({ length: 4 }, () => { const d = sprite('●', 12); d.el.style.pointerEvents = 'none'; d.el.style.color = '#1084d0'; return d; });
    f.append(bin.el, ...dotsEl.map((d) => d.el), ball.el);
    ball.el.style.pointerEvents = bin.el.style.pointerEvents = 'none';
    const GR = 1000;
    let W = 0, H = 0, start = null, pull = [0, 0], fly = false, vx = 0, vy = 0, n = 0, done = false, placed = false;
    const home = () => [36, H - 40];
    const placeBin = () => move(bin, W * (0.5 + ctx.rng() * 0.4), H - 22);
    const aimDots = (show) => dotsEl.forEach((d, i) => {
      const t = 0.1 * (i + 1), [hx, hy] = home();
      d.el.style.visibility = show ? '' : 'hidden';
      if (show) move(d, hx + pull[0] * 6 * t, hy + pull[1] * 6 * t + GR * t * t / 2);
    });
    f.addEventListener('pointerdown', (e) => { if (fly) return; start = at(e, f); pull = [0, 0]; capture(f, e); });
    f.addEventListener('pointermove', (e) => {
      if (!start) return;
      const [x, y] = at(e, f);
      let px = start[0] - x, py = start[1] - y;
      const len = Math.hypot(px, py), k = len > 120 ? 120 / len : 1;
      pull = [px * k, py * k];
    });
    const up = () => {
      if (!start) return;
      start = null;
      if (Math.hypot(...pull) < 15) { pull = [0, 0]; return; }
      fly = true; vx = pull[0] * 6; vy = pull[1] * 6; pull = [0, 0];
    };
    f.addEventListener('pointerup', up);
    f.addEventListener('pointercancel', up);
    const A = animate((dt) => {
      if (done) return;
      W = f.clientWidth; H = f.clientHeight;
      if (!placed) { placed = true; placeBin(); }
      if (!fly) { const [hx, hy] = home(); move(ball, hx - pull[0] * 0.25, hy - pull[1] * 0.25); return aimDots(!!start && Math.hypot(...pull) >= 15); }
      aimDots(false);
      vy += GR * dt;
      move(ball, ball.x + vx * dt, ball.y + vy * dt);
      if (vy > 0 && Math.abs(ball.x - bin.x) < 20 && ball.y > H - 44 && ball.y < H - 10) {
        fly = false;
        if (ctx.goal(++n, 3)) { done = true; return ctx.clear(); }
        placeBin();
      } else if (ball.y > H + 20 || ball.x > W + 30 || ball.x < -30) fly = false;
    });
    return live(host, A);
  },
};

// 날아가는 월급: 빠르게 지나가는 💸를 눌러 잡는다(8번). 🧾 고지서를 누르면 hit. 놓치는 건 괜찮다.
const moneyCatch = {
  id: 'money-catch', slot: 'late', title: '날아가는_월급.exe', tag: '🎮',
  create(host, ctx) {
    const f = field(210);
    host.append(f);
    const things = new Set();
    let next = 0.2, t = 0, n = 0, done = false;
    const drop = (o) => { o.el.remove(); things.delete(o); };
    const A = animate((dt) => {
      if (done) return;
      t += dt;
      const W = f.clientWidth, H = f.clientHeight;
      if ((next -= dt) <= 0) {
        next = (0.35 + ctx.rng() * 0.3) / ctx.speed;
        const bad = ctx.rng() < 0.3, dir = ctx.rng() < 0.5 ? 1 : -1;
        const o = Object.assign(sprite(bad ? '🧾' : '💸', 46), { v: dir * (170 + ctx.rng() * 130) * ctx.speed, y0: 30 + ctx.rng() * (H - 60), ph: ctx.rng() * 6 });
        o.el.style.cursor = 'pointer';
        o.el.addEventListener('pointerdown', () => {
          if (done) return;
          drop(o);
          if (bad) return ctx.hit();
          if (ctx.goal(++n, 8)) { done = true; ctx.clear(); }
        });
        move(o, dir > 0 ? -25 : W + 25, o.y0);
        things.add(o); f.append(o.el);
      }
      for (const o of [...things]) {
        move(o, o.x + o.v * dt, o.y0 + 14 * Math.sin(t * 6 + o.ph));
        if (o.x < -30 || o.x > W + 30) drop(o);
      }
    });
    return live(host, A);
  },
};

// 분리수거: 떨어지는 쓰레기를 맞는 통 위로 끌어다 놓는다(6번). 틀린 통에 들어가면 hit. 그냥 두면 바로 아래 통으로 떨어진다.
const BINS = [['📄 종이', ['📰', '📦', '✉️']], ['🥫 병·캔', ['🍾', '🥫', '🍶']], ['🍎 음식', ['🍌', '🍎', '🥕']]];
const recycle = {
  id: 'recycle', slot: 'leave', title: '퇴근_전_분리수거.exe', tag: '🎮',
  create(host, ctx) {
    const f = field(220);
    f.append(tip('✋ 잡아서 맞는 통 위로 끌기'), ...BINS.map(([name], i) => el(`<div class="raised" style="position:absolute;bottom:0;left:${i * 33.34}%;width:33.33%;height:42px;line-height:36px;text-align:center;font-size:12px;pointer-events:none">${name}</div>`)));
    host.append(f);
    let it = null, drag = false, n = 0, done = false;
    const A = animate((dt) => {
      if (done) return;
      const W = f.clientWidth, H = f.clientHeight;
      if (!it) {
        const kind = Math.floor(ctx.rng() * 3);
        const s = it = Object.assign(sprite(pick(BINS[kind][1], ctx.rng), 46), { kind });
        s.el.style.cursor = 'grab';
        s.el.addEventListener('pointerdown', (e) => { drag = true; capture(s.el, e); });
        s.el.addEventListener('pointermove', (e) => { if (drag && it === s) { const [x, y] = at(e, f); move(s, Math.max(20, Math.min(W - 20, x)), Math.max(20, Math.min(H - 50, y))); } });
        const up = () => { drag = false; };
        s.el.addEventListener('pointerup', up);
        s.el.addEventListener('pointercancel', up);
        move(s, 30 + ctx.rng() * (W - 60), 34);
        f.append(s.el);
      }
      if (drag) return;
      move(it, it.x, it.y + 40 * ctx.speed * dt);
      if (it.y < H - 56) return;
      // 통에 들어갔다: 어느 통 위였는지로 판정
      const ok = Math.min(2, Math.floor(it.x / (W / 3))) === it.kind;
      it.el.remove(); it = null;
      if (!ok) return ctx.hit();
      if (ctx.goal(++n, 6)) { done = true; ctx.clear(); }
    });
    return live(host, A);
  },
};

export default [lateRun, patternLock, coinMerge, paperToss, moneyCatch, recycle];
