// 한글 문서 양식 맞추기: 줄 간격·글꼴·크기를 눌러 바꿔서 지정 양식과 맞춘 뒤 저장한다(문서 2개).
// 틀린 채 저장하면 hit. "자동 서식"이 가끔 하나를 멋대로 바꾼다.
import { makeTimers, button, pick, handle } from './ui.js';
const OPTS = {
  '줄 간격': ['100%', '130%', '160%', '180%', '200%'],
  '글꼴': ['바탕', '돋움', '굴림', '궁서', '맑은 고딕'],
  '크기': ['9pt', '10pt', '11pt', '12pt'],
};
const KEYS = Object.keys(OPTS);

export default {
  id: 'hwp-format', slot: 'morning', title: '보고서_양식.hwp', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;font-size:12px"></div><div style="display:flex;flex-direction:column;gap:6px;margin:8px 0"></div><div style="min-height:18px;font-size:12px"></div>';
    const want = host.firstChild, box = host.children[1], note = host.lastChild;
    let doc = 0, target = {}, cur = {};
    const btns = {};
    const draw = () => KEYS.forEach((k) => { btns[k].textContent = `${k}: ${OPTS[k][cur[k]]} ▼`; });
    const start = () => {
      KEYS.forEach((k) => { target[k] = Math.floor(ctx.rng() * OPTS[k].length); do cur[k] = Math.floor(ctx.rng() * OPTS[k].length); while (cur[k] === target[k]); });
      if (doc === 0) { target['줄 간격'] = 2; target['글꼴'] = 0; }
      want.textContent = `📋 지정 양식 (${doc + 1}/2): ` + KEYS.map((k) => `${k} ${OPTS[k][target[k]]}`).join(' · ');
      draw();
    };
    KEYS.forEach((k) => {
      btns[k] = button('', () => { cur[k] = (cur[k] + 1) % OPTS[k].length; draw(); }, 'text-align:left');
      box.append(btns[k]);
    });
    host.append(button('💾 저장', () => {
      if (KEYS.some((k) => cur[k] !== target[k])) { note.textContent = '🧓 "양식이 하나도 안 맞잖아"'; return ctx.hit(); }
      if (++doc >= 2) return ctx.clear();
      note.textContent = '🧓 "이번엔 이 양식으로 다시"';
      start();
    }, 'width:100%'));
    T.every(() => {
      if (ctx.rng() < 0.5) return;
      const k = pick(KEYS, ctx.rng);
      cur[k] = (cur[k] + 1) % OPTS[k].length; draw();
      note.textContent = `⚙ 자동 서식이 ${k}을(를) 바꿨습니다`;
    }, 2600 / ctx.speed);
    start();
    return handle(T, host);
  },
};
