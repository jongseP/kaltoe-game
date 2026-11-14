// 회식 제안: 팀장님이 핑계를 미리 막는다. 막히지 않은 핑계 하나를 고른다(3번). 막힌 핑계나 시간 초과는 hit.
import { makeTimers, shuffled, handle, ask } from './ui.js';
const EXCUSES = {
  '집에 강아지가 기다려요': '강아지는 자고 있을 거야',
  '병원 예약이 있어요': '병원은 내일 가도 되잖아',
  '부모님이 오셨어요': '부모님도 이해하실 거야',
  '운동 PT 예약했어요': '운동은 회식에서 하면 돼',
  '택배 받아야 해요': '택배는 문 앞에 두고 가',
  '오늘 이사해요': '이사는 주말에 하는 거지',
};

export default {
  id: 'hoesik', slot: 'leave', title: '🍻 오늘_회식_공지', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:64px;font-size:12px;white-space:pre-line"></div><div style="display:flex;flex-direction:column;gap:5px;margin-top:6px"></div>';
    const say = host.firstChild, box = host.lastChild;
    let round = 0;
    const start = () => {
      const four = shuffled(Object.keys(EXCUSES), ctx.rng).slice(0, 4);
      const free = four[0];
      say.textContent = `🧓 팀장님 (${round + 1}/3): "오늘 1차만 딱 하자~"\n` + four.slice(1).map((b) => `🧓 "${EXCUSES[b]}"`).join('\n');
      ask(T, box, {
        options: shuffled(four, ctx.rng), right: free, ms: 7000 / ctx.speed, css: 'font-size:12px',
        onPick: (ok, e) => {
          if (ok) { ctx.goal(++round, 3); say.textContent = '🧓 "음… 그건 어쩔 수 없네"'; return; }
          say.textContent = e ? `🧓 "${EXCUSES[e]}... 라고 했잖아?"` : '🧓 "대답 없으면 가는 걸로~"';
          ctx.hit();
        },
        then: () => (round >= 3 ? ctx.clear() : start()),
      });
    };
    start();
    return handle(T, host);
  },
};
