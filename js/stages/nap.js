// 점심 낮잠: 알람보다 먼저 깬다. 휴대폰이 "진동"하는 순간부터 알람 전까지만 일어나야 한다(3번).
// 너무 일찍 일어나면 잠을 못 자서 hit, 알람이 울려 버리면 사무실이 다 깨서 hit.
import { makeTimers, button, handle } from './ui.js';

export default {
  id: 'nap', slot: 'lunch', title: '낮잠_알람.apk', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = `<div style="min-height:20px"></div><div style="text-align:center;font-size:44px;line-height:70px">😴</div>`;
    const msg = host.firstChild, face = host.children[1];
    let state = 'sleep', naps = 0, cancel = () => {};
    const sleep = () => {
      state = 'sleep'; face.textContent = '😴 💤'; face.style.transform = '';
      msg.textContent = `낮잠 ${naps}/3 · 진동이 오면 일어나세요`;
      cancel = T.after(buzz, (1500 + ctx.rng() * 2500) / ctx.speed);
    };
    const buzz = () => {
      state = 'buzz'; face.textContent = '😴 📳';
      cancel = T.after(() => { state = 'ring'; face.textContent = '😱 ⏰ 삐비비빅!'; msg.textContent = '😡 옆자리: "알람 좀 꺼요!"'; ctx.hit(); cancel = T.after(sleep, 900); }, 700 / ctx.speed);
    };
    let wiggle = 0;
    T.every(() => { if (state === 'buzz') face.style.transform = `translateX(${(wiggle ^= 1) ? 3 : -3}px)`; }, 60);
    host.append(button('🙆 일어나기', () => {
      if (state === 'ring') return;
      cancel();
      if (state === 'sleep') { msg.textContent = '🥱 너무 일찍 깼다... 오후가 피곤하다'; ctx.hit(); return sleep(); }
      face.textContent = '😎'; face.style.transform = '';
      if (++naps >= 3) return ctx.clear();
      state = 'wake'; cancel = T.after(sleep, 500);
    }, 'width:100%;height:48px'));
    sleep();
    return handle(T, host);
  },
};
