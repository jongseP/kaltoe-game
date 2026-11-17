// 끼어들기 6개 (설계 문서 §4.3). 약속: create(host, ctx{close, hit, addCoin, rng, speed}) → {pause, resume, destroy}
// hit만 하고 닫지 않으면 판은 계속 멈춰 있다. 시간 초과는 hit 후 닫는다.
import { makeWindow } from '../ui/window.js';
import { makeTimers, button, shuffled, handle, ask, el } from './ui.js';

// 고르기형: right를 누르면 닫힘, wrong을 누르거나 ms 안에 못 고르면 hit. 어느 쪽이든 정답을 잠깐 보여 주고 닫힌다.
const choice = (id, title, prompt, right, wrong, ms) => ({
  id, title,
  create(host, ctx) {
    const T = makeTimers();
    const body = document.createElement('div');
    body.innerHTML = `<div style="margin-bottom:6px">${prompt}</div><div style="display:flex;flex-direction:column;gap:4px"></div>`;
    ask(T, body.lastChild, {
      options: shuffled([right, ...wrong], ctx.rng), right, ms: ms / ctx.speed,
      onPick: (ok) => { if (!ok) ctx.hit(); }, then: () => ctx.close(),
    });
    host.append(makeWindow({ title, body }));
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
    T.after(() => { ctx.hit(); ctx.close(); }, 4000 / ctx.speed);
    return handle(T, host);
  },
};

const comeHere = choice('come-here', '🧓 팀장님', '🧓 "김 사원, 잠깐 내 자리로 와 봐"',
  '네! 바로 가겠습니다', ['지금 좀 바쁜데요', '(못 들은 척)'], 5000);
const dadJoke = choice('dad-joke', '💬 팀 단톡방', '🧓 "세상에서 가장 가난한 왕은? 최저임금 ㅋㅋ"',
  'ㅋㅋㅋㅋㅋㅋ 팀장님 최고👍', ['ㅋ', '(읽씹)', '그거 작년에도 하셨어요'], 5000);
const quitTalk = choice('quit-talk', '🆕 후배', '🧑 "선배… 저 퇴사 고민 상담 좀…"',
  '많이 힘들었구나, 점심 때 얘기하자', ['나 때는 더 했어', '다들 그렇게 버텨', '(이어폰 낀 척)'], 6000);
const emojiReact = {
  id: 'emoji-react', title: '💬 공지',
  create(host, ctx) {
    const want = ['👍', '🔥', '🙏', '👀'][Math.floor(ctx.rng() * 4)];
    return choice('emoji-react', '💬 전체 공지', `📢 "다음 주 워크숍 공지입니다. 확인하신 분은 ${want} 눌러 주세요"`,
      want, ['👍', '🔥', '🙏', '👀', '😂'].filter((e) => e !== want).slice(0, 3), 5000).create(host, ctx);
  },
};

// 속임수 팝업: 눈에 띄는 버튼이 함정이다
const fakeUpdate = choice('fake-update', '💻 시스템', '💻 "업데이트가 준비되었습니다 (예상 3시간)"',
  '나중에', ['✅ 지금 설치하고 다시 시작', '예 (작업 내용 사라짐)'], 5500);
const consent = choice('consent', '📜 인사팀 공지', '📜 "이번 달 야근 수당 포기에 동의하십니까?"',
  '동의하지 않음', ['✅ 전체 동의', '동의하지 않지 않음'], 6000);
const captcha = choice('captcha', '🤖 로봇 확인', '🤖 "사람이라면 야근이 아닌 것을 고르세요"',
  '칼퇴', ['야근', '철야', '주말 특근'], 5500);
const fakePrize = choice('fake-prize', '🎁 축하합니다', '🎁 "당첨! 지금 누르면 즉시 퇴근!"',
  '✕ 닫기', ['🎁 즉시 퇴근하기', '당첨금 받기'], 6000);
const bossCall = choice('boss-call', '📞 전화 수신', '📞 팀장님 전화가 오고 있습니다',
  '받기', ['거절', '🔇 무음으로', '(휴대폰 뒤집기)'], 5000);

// ---- 함정 팝업: 습관대로 누르면 당한다
// 파란 화면: 3초 동안 아무 데도 누르지 않아야 한다
const blueScreen = {
  id: 'blue-screen', title: '💀',
  create(host, ctx) {
    const T = makeTimers();
    const d = el('<div style="background:#0000a8;color:#fff;padding:22px 12px;text-align:center;line-height:1.9">💀 치명적인 오류가 발생했습니다<br><b>아무 데도 누르지 마십시오</b><br><span>복구 중... 3</span></div>');
    let left = 3, over = false;
    d.addEventListener('pointerdown', () => {
      if (over) return;
      over = true; d.lastChild.textContent = '누르지 말라니까요...'; ctx.hit(); T.after(ctx.close, 800);
    });
    T.every(() => { if (over) return; if (--left <= 0) { over = true; ctx.close(); } else d.lastChild.textContent = `복구 중... ${left}`; }, 900);
    host.append(d);
    return handle(T, host);
  },
};
// 도망가는 [아니요]: 두 번 도망간 뒤에야 눌린다. 제자리에 있는 큰 버튼은 야근 신청
const runaway = {
  id: 'runaway', title: '📥 야근 신청',
  create(host, ctx) {
    const T = makeTimers();
    const body = el('<div><div>📥 "오늘 야근을 신청하시겠습니까?"</div><div style="position:relative;height:100px;margin-top:6px"></div></div>');
    const SPOTS = [['4%', '54px', '아니요!'], ['58%', '54px', '아니라고요!!']];
    let jumps = 0;
    const no = button('아니요', () => {
      if (jumps >= SPOTS.length) return ctx.close();
      [no.style.left, no.style.top, no.textContent] = SPOTS[jumps++];
    }, 'position:absolute;left:62%;top:0;width:38%;height:44px');
    body.lastChild.append(button('📥 네, 신청합니다', () => { ctx.hit(); ctx.close(); }, 'position:absolute;left:0;top:0;width:58%;height:44px'), no);
    host.append(makeWindow({ title: '📥 야근 신청', body }));
    T.after(() => { ctx.hit(); ctx.close(); }, 6000 / ctx.speed);
    return handle(T, host);
  },
};
// 미리 체크된 동의: 체크를 풀고 제출해야 한다
const precheck = {
  id: 'precheck', title: '📜 동의서',
  create(host, ctx) {
    const T = makeTimers();
    const body = el('<div><div>📜 워크숍 참가 신청서</div><label style="display:block;margin:8px 0;padding:6px;background:#fff;border:1px solid #808080"><input type="checkbox" checked style="width:20px;height:20px;vertical-align:middle"> 주말 근무에도 동의합니다 <small>(선택)</small></label></div>');
    body.append(button('제출', () => { if (body.querySelector('input').checked) ctx.hit(); ctx.close(); }, 'width:100%;height:44px'));
    host.append(makeWindow({ title: '📜 동의서', body }));
    T.after(() => { ctx.hit(); ctx.close(); }, 7000 / ctx.speed);
    return handle(T, host);
  },
};
// 자리 바꾸는 버튼: 누르려는 순간 [예]와 [아니요]가 자리를 바꾼다
const swap = {
  id: 'swap', title: '💾 종료',
  create(host, ctx) {
    const T = makeTimers();
    const body = el('<div><div>💾 "저장하지 않고 종료할까요?"</div><div style="display:flex;gap:6px;margin-top:8px"></div></div>');
    const row = body.lastChild;
    row.append(button('아니요', () => ctx.close(), 'flex:1;height:48px'), button('예', () => { ctx.hit(); ctx.close(); }, 'flex:1;height:48px'));
    const flip = () => row.append(row.firstChild);
    T.after(flip, 1100); T.after(flip, 2000);
    host.append(makeWindow({ title: '💾 종료', body }));
    T.after(() => { ctx.hit(); ctx.close(); }, 6000 / ctx.speed);
    return handle(T, host);
  },
};
// 습관의 함정: [확인] [확인] 다음에 같은 자리의 [확인]은 "전부 삭제"
const habit = {
  id: 'habit', title: '⚠ 알림',
  create(host, ctx) {
    const T = makeTimers();
    const body = document.createElement('div');
    const STEPS = ['💾 저장되었습니다', '🖨 인쇄 대기열에 추가되었습니다', '🗑 보고서를 전부 삭제할까요?'];
    let i = 0;
    const show = () => {
      const last = i === STEPS.length - 1;
      body.replaceChildren(el(`<div style="min-height:44px">${STEPS[i]} <small>(${i + 1}/3)</small></div>`),
        ...(last ? ['확인', '취소'] : ['확인']).map((b) => button(b, () => {
          if (!last) { i++; return show(); }
          if (b === '확인') ctx.hit();
          ctx.close();
        }, 'width:48%;height:44px;margin-right:2%')));
    };
    show();
    host.append(makeWindow({ title: '⚠ 알림', body }));
    T.after(() => { ctx.hit(); ctx.close(); }, 7000 / ctx.speed);
    return handle(T, host);
  },
};

export default [messengerBomb, printerJam, comeHere, dadJoke, quitTalk, emojiReact, fakeUpdate, consent, captcha, fakePrize, bossCall,
  blueScreen, runaway, precheck, swap, habit];
