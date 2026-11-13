// 끼어들기 6개 (설계 문서 §4.3). 약속: create(host, ctx{close, hit, addCoin, rng, speed}) → {pause, resume, destroy}
// hit만 하고 닫지 않으면 판은 계속 멈춰 있다. 시간 초과는 hit 후 닫는다.
import { makeWindow } from '../ui/window.js';
import { makeTimers, button, shuffled, handle } from './ui.js';

// 고르기형: right를 누르면 닫힘, wrong을 누르면 hit 후 닫힘, ms 안에 못 고르면 hit 후 닫힘
const choice = (id, title, prompt, right, wrong, ms) => ({
  id, title,
  create(host, ctx) {
    const T = makeTimers();
    const body = document.createElement('div');
    body.innerHTML = `<div style="margin-bottom:6px">${prompt}</div>`;
    const done = (ok) => { if (!ok) ctx.hit(); ctx.close(); };
    const opts = shuffled([[right, true], ...wrong.map((w) => [w, false])], ctx.rng);
    for (const [label, ok] of opts) body.append(button(label, () => done(ok), 'width:100%;margin-top:4px'));
    host.append(makeWindow({ title, body }));
    T.after(() => done(false), ms / ctx.speed);
    return handle(T, host);
  },
});

const messengerBomb = {
  id: 'messenger-bomb', title: '💬 메신저',
  create(host, ctx) {
    const T = makeTimers();
    const LINES = ['김 사원', '혹시', '바빠?', '아니 바쁘면 말고', '그 파일', '어딨지', '??', '김 사원?'];
    const body = document.createElement('div');
    body.innerHTML = '<div>🧓 팀장님 (안 읽음 <b>0</b>)</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;min-height:80px"></div>';
    const count = body.querySelector('b'), list = body.lastChild;
    let i = 0;
    const update = () => { count.textContent = list.children.length; };
    T.every(() => {
      if (i >= LINES.length) return;
      list.append(button(LINES[i++], (e) => { e.currentTarget.remove(); update(); if (i >= LINES.length && !list.children.length) ctx.close(); }, 'font-size:12px'));
      update();
    }, 350 / ctx.speed);
    T.after(() => { if (list.children.length) ctx.hit(); ctx.close(); }, 5000 / ctx.speed);
    host.append(makeWindow({ title: '💬 메신저 폭탄 (눌러서 읽기)', body }));
    return handle(T, host);
  },
};

const printerJam = {
  id: 'printer-jam', title: '🖨 용지 걸림',
  create(host, ctx) {
    const T = makeTimers();
    let left = 5;
    const body = document.createElement('div');
    body.innerHTML = '<div>🖨 용지가 걸렸습니다. 뒤에 줄 선 사람 3명</div>';
    const b = button(`📄 종이 빼기 (${left})`, () => { left--; b.textContent = `📄 종이 빼기 (${left})`; if (!left) ctx.close(); }, 'width:100%;height:52px;margin-top:6px');
    body.append(b);
    host.append(makeWindow({ title: '🖨 용지 걸림', body }));
    T.after(() => { ctx.hit(); ctx.close(); }, 3000 / ctx.speed);
    return handle(T, host);
  },
};

const comeHere = choice('come-here', '🧓 팀장님', '🧓 "김 사원, 잠깐 내 자리로 와 봐"',
  '네! 바로 가겠습니다', ['지금 좀 바쁜데요', '(못 들은 척)'], 3000);
const dadJoke = choice('dad-joke', '💬 팀 단톡방', '🧓 "세상에서 가장 가난한 왕은? 최저임금 ㅋㅋ"',
  'ㅋㅋㅋㅋㅋㅋ 팀장님 최고👍', ['ㅋ', '(읽씹)', '그거 작년에도 하셨어요'], 3000);
const quitTalk = choice('quit-talk', '🆕 후배', '🧑 "선배… 저 퇴사 고민 상담 좀…"',
  '많이 힘들었구나, 점심 때 얘기하자', ['나 때는 더 했어', '다들 그렇게 버텨', '(이어폰 낀 척)'], 4000);
const emojiReact = {
  id: 'emoji-react', title: '💬 공지',
  create(host, ctx) {
    const want = ['👍', '🔥', '🙏', '👀'][Math.floor(ctx.rng() * 4)];
    return choice('emoji-react', '💬 전체 공지', `📢 "다음 주 워크숍 공지입니다. 확인하신 분은 ${want} 눌러 주세요"`,
      want, ['👍', '🔥', '🙏', '👀', '😂'].filter((e) => e !== want).slice(0, 3), 3000).create(host, ctx);
  },
};

export default [messengerBomb, printerJam, comeHere, dadJoke, quitTalk, emojiReact];
