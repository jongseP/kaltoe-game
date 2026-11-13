// 엘리베이터에서 팀장님과 단둘이: 질문 4개에 무난한 대답을 고른다. 어색한 대답이나 3초 침묵은 hit.
import { makeTimers, button, shuffled, handle } from './ui.js';
const QS = [
  { q: '주말에 뭐 했어?', ok: '그냥 푹 쉬었습니다', bad: ['팀장님 생각했습니다', '말하기 좀 그런데요'] },
  { q: '요즘 일은 할 만해?', ok: '네 배우는 게 많습니다', bad: ['솔직히 힘들어요', '이직 준비 중입니다'] },
  { q: '아침은 먹었어?', ok: '네 간단히 먹었습니다', bad: ['팀장님이 사 주세요', '다이어트 중이라서요'] },
  { q: '어제 회식 재밌었지?', ok: '네 즐거웠습니다', bad: ['기억이 안 나요', '다음엔 빠질게요'] },
  { q: '날씨 좋다 그치?', ok: '그러게요 날씨 좋네요', bad: ['밖에 못 나가는데요', '비 온다던데요?'] },
  { q: '보고서는 언제 돼?', ok: '오늘 오전 중 드리겠습니다', bad: ['언젠가는요', '그거 제 일인가요?'] },
];

export default {
  id: 'elevator', slot: 'commute', title: '엘리베이터_3F→15F', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:48px"></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>';
    const say = host.firstChild, box = host.lastChild;
    const qs = shuffled(QS, ctx.rng).slice(0, 4);
    let n = 0, cancel = () => {};
    const ask = () => {
      cancel();
      const q = qs[n];
      say.textContent = `🛗 ${3 + n * 3}F  🧓 팀장님: ${q.q}`;
      box.replaceChildren(...shuffled([q.ok, ...q.bad], ctx.rng).map((a) => button(a, () => {
        if (a !== q.ok) { ctx.hit(); say.textContent = '🧓 팀장님: ...(정적)'; }
        if (ctx.goal(++n, qs.length)) return ctx.clear();
        ask();
      })));
      cancel = T.after(() => { ctx.hit(); say.textContent = '🧓 팀장님: ...(어색한 침묵)'; cancel = T.after(ask, 600); }, 3000 / ctx.speed);
    };
    ask();
    return handle(T, host);
  },
};
