// 트집 피드백 "숫자 좀 예쁘게": 팀장님 요청대로 숫자 표기를 고른다(3번). 마지막엔 "처음 게 낫네" → 원래 숫자를 골라야 한다.
// 틀리면 hit.
import { makeTimers, button, shuffled, handle } from './ui.js';

const fmt = {
  '쉼표 넣어서': (v) => v.toLocaleString('ko-KR'),
  '억 단위로': (v) => `${(v / 1e8).toFixed(1)}억`,
  '만 원 단위로': (v) => `${Math.round(v / 1e4).toLocaleString('ko-KR')}만 원`,
  '퍼센트로 (목표 대비)': (v) => `${Math.round((v / 2e9) * 100)}%`,
};

export default {
  id: 'nitpick', slot: 'early', title: '월간실적_수정7.pptx', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:40px"></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>';
    const say = host.firstChild, box = host.lastChild;
    const v = Math.floor(5e8 + ctx.rng() * 1.4e9);
    const raw = String(v);
    const asks = shuffled(Object.keys(fmt), ctx.rng).slice(0, 3);
    let n = 0;
    const show = () => {
      const want = n < asks.length ? fmt[asks[n]](v) : raw;
      say.textContent = n < asks.length ? `🧓 팀장님 (${n + 1}/4): "숫자 좀 예쁘게... ${asks[n]}"` : '🧓 팀장님 (4/4): "음... 그냥 처음 게 낫네"';
      const opts = shuffled([raw, ...Object.values(fmt).map((f) => f(v))], ctx.rng);
      box.replaceChildren(...opts.map((o) => button(o, () => {
        if (o !== want) { say.textContent = '🧓 팀장님: "내 말을 못 알아듣네"'; ctx.hit(); return; }
        if (ctx.goal(++n - 1, asks.length)) return ctx.clear();
        show();
      })));
    };
    show();
    return handle(T, host);
  },
};
