// 팀장님 AI 보고서: 위의 실제 자료와 챗봇 초안을 비교해 틀린 문장 하나를 찾는다(3번). 맞는 문장을 누르면 hit.
import { makeTimers, button, shuffled, handle } from './ui.js';
const FACTS = [
  ['매출', (r) => 10 + Math.floor(r() * 80), '억 원'],
  ['직원 수', (r) => 20 + Math.floor(r() * 200), '명'],
  ['지점', (r) => 2 + Math.floor(r() * 15), '곳'],
  ['고객 만족도', (r) => 60 + Math.floor(r() * 39), '점'],
  ['신규 계약', (r) => 3 + Math.floor(r() * 40), '건'],
];

export default {
  id: 'ai-report', slot: 'early', title: 'AI_초안_최종.docx', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;font-size:12px"></div><div style="margin:6px 0;font-size:12px"></div><div style="display:flex;flex-direction:column;gap:4px"></div>';
    const data = host.firstChild, msg = host.children[1], box = host.lastChild;
    let round = 0;
    const start = () => {
      const facts = shuffled(FACTS, ctx.rng).slice(0, 4).map(([k, gen, u]) => ({ k, v: gen(ctx.rng), u }));
      const wrong = Math.floor(ctx.rng() * facts.length);
      data.textContent = '📊 실제 자료: ' + facts.map((f) => `${f.k} ${f.v}${f.u}`).join(' · ');
      msg.textContent = `🤖 챗봇 초안 (${round + 1}/3) — 틀린 문장을 찾으세요`;
      box.replaceChildren(...shuffled(facts.map((f, i) => {
        const v = i === wrong ? f.v + (ctx.rng() < 0.5 && f.v > 12 ? -1 : 1) * (1 + Math.floor(ctx.rng() * 9)) : f.v;
        return [`올해 ${f.k}은(는) ${v}${f.u}로 집계되었습니다.`, i === wrong];
      }), ctx.rng).map(([t, bad]) => button(t, () => {
        if (!bad) { msg.textContent = '🧓 "그거 맞는 건데?"'; return ctx.hit(); }
        if (ctx.goal(++round, 3)) return ctx.clear();
        start();
      }, 'text-align:left;font-size:12px')));
    };
    start();
    return handle(T, host);
  },
};
