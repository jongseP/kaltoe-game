// 사내정치 단톡방: 편 가르기 메시지가 쏟아진다. 나를 부를 때(@나)만 중립 대답 [넵 확인했습니다]를 고른다.
// 편을 들거나, 나를 안 불렀는데 대답하거나, 2초 안에 답을 안 하면 hit. 5번 넘기면 성공.
import { makeTimers, button, shuffled, pick, handle } from './ui.js';
const NOISE = ['A팀장: 그 건은 B팀 책임이죠', 'B팀장: A팀 일정이 늦어서요', 'A팀장: ㅋㅋ 그렇게 보세요?', '최차장: 다들 진정하시고...', 'B팀장: 회의록 보시죠'];
const BAIT = ['A팀장: @나 너는 어떻게 생각해?', 'B팀장: @나 너도 봤잖아 그치?', '최차장: @나 솔직히 말해 봐'];
const ANS = ['넵 확인했습니다', 'A팀장님 말이 맞죠', 'B팀장님 말이 맞죠'];

export default {
  id: 'politics-chat', slot: 'late', title: '💬 팀장단_단톡방(17)', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;height:110px;overflow:hidden;font-size:12px;display:flex;flex-direction:column;justify-content:flex-end"></div><div style="min-height:18px;margin:4px 0"></div><div style="display:flex;flex-direction:column;gap:4px"></div>';
    const log = host.firstChild, note = host.children[1], box = host.lastChild;
    let bait = false, ok = 0, cancel = () => {};
    const add = (t) => { const d = document.createElement('div'); d.textContent = t; log.append(d); while (log.children.length > 6) log.firstChild.remove(); };
    const status = () => { note.textContent = `엮이지 않기 ${ok}/5`; };
    const next = () => {
      if (ctx.rng() < 0.4) {
        bait = true; add(pick(BAIT, ctx.rng)); note.textContent = '⚠ 나를 불렀다!';
        cancel = T.after(() => { bait = false; add('A팀장: 읽씹이네?'); ctx.hit(); status(); cancel = T.after(next, 500); }, 2000 / ctx.speed);
      } else {
        bait = false; add(pick(NOISE, ctx.rng));
        cancel = T.after(next, (500 + ctx.rng() * 500) / ctx.speed);
      }
    };
    const answer = (a) => () => {
      if (!bait) { add(`나: ${a}`); add('B팀장: 갑자기?'); return ctx.hit(); }
      bait = false; cancel(); add(`나: ${a}`);
      if (a !== ANS[0]) { add('😱 다른 팀장: 아 그래?'); ctx.hit(); }
      else if (ctx.goal(++ok, 5)) return ctx.clear();
      status(); cancel = T.after(next, 400);
    };
    box.append(...shuffled(ANS, ctx.rng).map((a) => button(a, answer(a), 'font-size:12px')));
    status(); next();
    return handle(T, host);
  },
};
