// 엘리베이터에서 팀장님과 단둘이: 질문 4개에 무난한 대답을 고른다. 어색한 대답이나 5초 침묵은 hit.
import { makeTimers, shuffled, handle, ask } from './ui.js';
const QS = [
  { q: '주말에 뭐 했어?', ok: '그냥 푹 쉬었습니다', bad: ['이직 면접 봤습니다', '팀장님 뒷담화 했습니다'] },
  { q: '요즘 일은 할 만해?', ok: '네 배우는 게 많습니다', bad: ['퇴사하고 싶습니다', '월급에 비해선 많네요'] },
  { q: '아침은 먹었어?', ok: '네 간단히 먹었습니다', bad: ['팀장님이 사 주세요', '그게 왜 궁금하세요?'] },
  { q: '어제 회식 재밌었지?', ok: '네 즐거웠습니다', bad: ['끔찍했습니다', '다음엔 빠질게요'] },
  { q: '날씨 좋다 그치?', ok: '그러게요 날씨 좋네요', bad: ['그래서 퇴근하고 싶네요', '말 걸지 말아 주세요'] },
  { q: '보고서는 언제 돼?', ok: '오늘 오전 중 드리겠습니다', bad: ['언젠가는요', '그거 제 일인가요?'] },
];

export default {
  id: 'elevator', slot: 'commute', title: '엘리베이터_3F→15F', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:48px"></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>';
    const say = host.firstChild, box = host.lastChild;
    const qs = shuffled(QS, ctx.rng).slice(0, 4);
    let n = 0;
    const next = () => {
      const q = qs[n];
      say.textContent = `🛗 ${3 + n * 3}F  🧓 팀장님: ${q.q}`;
      ask(T, box, {
        options: shuffled([q.ok, ...q.bad], ctx.rng), right: q.ok, ms: 5000 / ctx.speed,
        onPick: (ok, a) => {
          if (ok) say.textContent = '🧓 팀장님: 허허, 그래';
          else { ctx.hit(); say.textContent = a ? '🧓 팀장님: ...(정적)' : '🧓 팀장님: ...(어색한 침묵)'; }
          if (a) ctx.goal(++n, qs.length); // 대답을 했으면 다음 층으로, 침묵했으면 같은 질문 다시
        },
        then: () => (n >= qs.length ? ctx.clear() : next()),
      });
    };
    next();
    return handle(T, host);
  },
};
