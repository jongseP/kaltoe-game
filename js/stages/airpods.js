// 후배의 에어팟: 후배가 🎧를 끼고 있으면 [💬 메신저], 빼고 있으면 [🗣 부르기]로 부른다(6번).
// 틀리면 hit (못 듣거나, "말로 하시죠?").
import { makeTimers, button, handle } from './ui.js';

export default {
  id: 'airpods', slot: 'early', title: '후배_호출', tag: '🆕',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="text-align:center;font-size:44px;line-height:64px"></div><div style="text-align:center;min-height:20px"></div><div style="display:flex;gap:6px;margin-top:6px"></div>';
    const face = host.firstChild, note = host.children[1], row = host.lastChild;
    let pods = true, ok = 0;
    const draw = () => { face.textContent = pods ? '🧑🎧' : '🧑👂'; };
    T.every(() => { pods = ctx.rng() < 0.55; draw(); }, (500 + ctx.rng() * 500) / ctx.speed);
    const call = (byMsg) => () => {
      if (byMsg !== pods) {
        note.textContent = pods ? '🧑 (♪ 못 들음)' : '🧑 "바로 옆인데 말로 하시죠?"';
        return ctx.hit();
      }
      if (++ok >= 6) return ctx.clear();
      note.textContent = `🧑 "네~" (${ok}/6)`;
      pods = ctx.rng() < 0.5; draw();
    };
    row.append(button('🗣 부르기', call(false), 'flex:1;height:48px'), button('💬 메신저', call(true), 'flex:1;height:48px'));
    note.textContent = '🎧 끼고 있으면 메신저, 빼면 부르기 (0/6)';
    draw();
    return handle(T, host);
  },
};
