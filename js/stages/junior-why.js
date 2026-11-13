// 후배의 "제가요? 이걸요? 왜요?": 후배의 질문마다 맞는 대답을 고른다(6번). 틀리면 "그럼 안 할게요" hit.
import { makeTimers, button, shuffled, pick, handle } from './ui.js';
const QA = { '제가요?': '응 너밖에 없어', '이걸요?': '응 바로 그거', '왜요?': '팀장님이 시키셨어' };

export default {
  id: 'junior-why', slot: 'morning', title: '후배_업무요청.msg', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:8px;min-height:40px;font-size:18px;text-align:center"></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>';
    const say = host.firstChild, box = host.lastChild;
    let n = 0, q = '', cancel = () => {};
    const ask = () => {
      cancel();
      q = pick(Object.keys(QA), ctx.rng);
      say.textContent = `🧑 후배 (${n + 1}/6): "${q}"`;
      box.replaceChildren(...shuffled(Object.values(QA), ctx.rng).map((a) => button(a, () => {
        if (a !== QA[q]) { say.textContent = '🧑 후배: "그럼 안 할게요"'; ctx.hit(); return (cancel = T.after(ask, 500)); }
        if (ctx.goal(++n, 6)) return ctx.clear();
        ask();
      })));
      cancel = T.after(() => { say.textContent = '🧑 후배: "답이 없으시네요? 퇴근할게요"'; ctx.hit(); cancel = T.after(ask, 500); }, 2500 / ctx.speed);
    };
    ask();
    return handle(T, host);
  },
};
