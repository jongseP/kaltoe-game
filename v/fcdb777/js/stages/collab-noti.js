// 협업툴 알림 지옥: 채널 20개의 빨간 점을 탭해 모두 끈다. 점은 계속 새로 생긴다.
// "@멘션" 점은 2.5초 안에 읽어야 한다(놓치면 hit). 다 끄면 성공.
import { makeTimers, handle } from './ui.js';
const CH = ['general', '공지', '잡담', '점심', '개발', '디자인', '기획', '영업', '인사', '총무', 'TF', '회의록', '외부', '긴급', '랜덤', '스터디', '운동', '맛집', '경조사', '봇'];

export default {
  id: 'collab-noti', slot: 'morning', title: '협업툴 (알림 99+)', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-top:6px"></div>';
    const msg = host.firstChild, grid = host.lastChild;
    let stopSpawn = false;
    const chs = CH.map((name) => {
      const c = document.createElement('div');
      c.className = 'sunken';
      c.style.cssText = 'font-size:11px;padding:6px 2px;text-align:center;cursor:pointer;min-height:18px';
      const ch = { c, name, dot: false, mention: false, cancel: () => {} };
      c.addEventListener('pointerdown', () => { if (ch.dot) off(ch); });
      grid.append(c);
      return ch;
    });
    const draw = (ch) => { ch.c.textContent = `${ch.dot ? (ch.mention ? '🔴@' : '🔴') : ''}#${ch.name}`; ch.c.style.fontWeight = ch.dot ? 'bold' : ''; };
    const count = () => chs.filter((c) => c.dot).length;
    const status = () => { msg.textContent = `안 읽은 채널 ${count()}개`; ctx.goal(chs.length - count(), chs.length, '개'); };
    const off = (ch) => {
      ch.dot = false; ch.mention = false; ch.cancel(); draw(ch); status();
      if (stopSpawn && count() === 0) ctx.clear();
    };
    const on = (ch) => {
      ch.dot = true; ch.mention = ctx.rng() < 0.2; draw(ch);
      if (ch.mention) ch.cancel = T.after(() => { if (ch.mention) { msg.textContent = '🧓 "멘션했는데 왜 답이 없어?"'; ctx.hit(); ch.mention = false; draw(ch); } }, 2500 / ctx.speed);
    };
    chs.forEach((ch) => { if (ctx.rng() < 0.6) on(ch); else draw(ch); });
    T.every(() => {
      if (stopSpawn) return;
      const free = chs.filter((c) => !c.dot);
      if (free.length) on(free[Math.floor(ctx.rng() * free.length)]);
      status();
    }, 450 / ctx.speed);
    T.after(() => { stopSpawn = true; status(); if (count() === 0) ctx.clear(); }, 8000);
    status();
    return handle(T, host);
  },
};
