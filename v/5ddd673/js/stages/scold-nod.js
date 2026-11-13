// 훈계 잔소리: 팀장님 말끝에 맞는 대답을 한다. "알겠어?" → [네!], "...그치?" → [그럼요]. 그냥 말할 때 대답하면 hit.
// 대답할 틈은 짧다(놓치면 hit). 6번 맞히면 성공.
import { makeTimers, button, pick, handle } from './ui.js';
const PLAIN = ['요즘 애들은 말이야', '내가 몇 번을 말했어', '회사가 학교야?', '기본이 안 돼 있어', '라떼는 안 그랬어'];
const ENDS = [['알겠어?', '네!'], ['...그치?', '그럼요']];

export default {
  id: 'scold-nod', slot: 'early', title: '면담실_호출', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:10px;min-height:40px;font-size:16px"></div><div style="text-align:center;margin:6px 0"></div><div style="display:flex;gap:6px"></div>';
    const say = host.firstChild, cnt = host.children[1], row = host.lastChild;
    let want = null, ok = 0, cancel = () => {};
    const status = () => { cnt.textContent = `맞장구 ${ok}/6`; };
    const line = () => {
      if (ctx.rng() < 0.45) {
        const [q, a] = pick(ENDS, ctx.rng);
        want = a; say.textContent = `🧓 "${q}"`;
        cancel = T.after(() => { if (want) { want = null; say.textContent = '🧓 "대답 안 해?"'; ctx.hit(); } cancel = T.after(line, 500); }, 900 / ctx.speed);
      } else {
        want = null; say.textContent = `🧓 "${pick(PLAIN, ctx.rng)}..."`;
        cancel = T.after(line, (700 + ctx.rng() * 600) / ctx.speed);
      }
    };
    const reply = (a) => () => {
      if (!want || a !== want) { say.textContent = '🧓 "내가 말하는데 끼어들어?"'; want = null; cancel(); ctx.hit(); cancel = T.after(line, 600); return; }
      want = null; cancel();
      if (ctx.goal(++ok, 6)) return ctx.clear();
      status(); cancel = T.after(line, 400);
    };
    row.append(button('네!', reply('네!'), 'flex:1;height:48px'), button('그럼요', reply('그럼요'), 'flex:1;height:48px'));
    status(); line();
    return handle(T, host);
  },
};
