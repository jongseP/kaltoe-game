// 추가 스테이지 6개 (시간대마다 1개). 약속은 run.js 머리말과 같다.
import { makeTimers, button, shuffled, handle, ask } from './ui.js';

// 사원증 찾기: 가방 속 9칸에서 🪪를 찾는다(3번). 칸은 계속 섞이고, 닮은 카드(💳 🎫)나 다른 물건을 누르면 hit.
const badge = {
  id: 'badge', slot: 'commute', title: '사원증_어디갔지.zip', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    const JUNK = ['💳', '🎫', '🔑', '💄', '🎧', '🧻', '🍬', '🔋', '📎', '🪥', '💊'];
    host.innerHTML = '<div style="min-height:20px">🚪 출입 게이트 앞... 가방을 뒤진다</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:6px"></div>';
    const msg = host.firstChild, grid = host.lastChild;
    let n = 0;
    const deal = () => {
      const items = shuffled(['🪪', '💳', '🎫', ...shuffled(JUNK.slice(2), ctx.rng).slice(0, 6)], ctx.rng);
      grid.replaceChildren(...items.map((it) => button(it, () => {
        if (it !== '🪪') { msg.textContent = it === '💳' ? '💳 그건 교통카드' : it === '🎫' ? '🎫 그건 식권' : `${it} 이게 왜 여기 있지`; return ctx.hit(); }
        if (ctx.goal(++n, 3)) return ctx.clear();
        msg.textContent = '삑! ...인식 실패. 다시 찾기'; deal();
      }, 'height:46px;font-size:22px')));
    };
    deal();
    T.every(deal, 1500 / ctx.speed);
    return handle(T, host);
  },
};

// 회의실 예약: 빈 방(🟢)을 눌러 4번 예약한다. 방 상태는 계속 바뀐다. 사용 중(🔴)이나 임원 전용 방을 누르면 hit.
const meetingRoom = {
  id: 'meeting-room', slot: 'morning', title: '회의실_예약.xls', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:20px">빈 회의실(🟢)을 잡으세요</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:6px"></div>';
    const msg = host.firstChild, grid = host.lastChild;
    const vip = Math.floor(ctx.rng() * 6);
    let n = 0;
    const rooms = Array.from({ length: 6 }, (_, i) => {
      const r = { free: ctx.rng() < 0.3 };
      r.b = button('', () => {
        if (i === vip) { msg.textContent = '🧓 "거긴 임원 전용이야"'; return ctx.hit(); }
        if (!r.free) { msg.textContent = '🔴 이미 다른 팀이 쓰는 중'; return ctx.hit(); }
        r.free = false; draw(r, i); msg.textContent = '✅ 예약 완료!';
        if (ctx.goal(++n, 4)) ctx.clear();
      }, 'height:48px;font-size:12px');
      return r;
    });
    function draw(r, i) { r.b.textContent = i === vip ? '🟢 임원 전용' : `${r.free ? '🟢' : '🔴'} ${i + 1}회의실`; }
    rooms.forEach(draw);
    grid.append(...rooms.map((r) => r.b));
    T.every(() => { const i = Math.floor(ctx.rng() * 6); if (i === vip) return; rooms[i].free = !rooms[i].free; draw(rooms[i], i); }, 450 / ctx.speed);
    return handle(T, host);
  },
};

// 더치페이: 1인당 얼마인지 고른다(3번). "난 지갑 두고 왔네"가 나오면 팀장님을 빼고 나눠야 한다. 틀리거나 5초 넘기면 hit.
const splitBill = {
  id: 'split-bill', slot: 'lunch', title: '더치페이.calc', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:62px;white-space:pre-line"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px"></div>';
    const say = host.firstChild, row = host.lastChild;
    const won = (v) => `${v.toLocaleString('ko-KR')}원`;
    let n = 0;
    const round = () => {
      const people = 3 + Math.floor(ctx.rng() * 2), total = 12000 * (2 + Math.floor(ctx.rng() * 3));
      const boss = ctx.rng() < 0.5;
      const answer = total / (boss ? people - 1 : people);
      const wrong = [...new Set([boss ? total / people : total / (people - 1), answer + 1000, answer - 2000])].filter((v) => v !== answer).slice(0, 2);
      say.textContent = `🧾 ${people}명이 ${won(total)}\n${boss ? '🧓 "아이고, 난 지갑을 두고 왔네"' : '🧓 "오늘은 각자 내자"'}\n내는 사람 1인당?`;
      ask(T, row, {
        options: shuffled([answer, ...wrong], ctx.rng).map(won), right: won(answer), ms: 8000 / ctx.speed, css: 'height:48px;font-size:12px',
        onPick: (ok, v) => {
          if (ok) return void ctx.goal(++n, 3);
          say.textContent = v ? `🧮 계산이 안 맞는데요... (${won(total)} ÷ ${boss ? people - 1 : people}명)` : '🧓 "그냥 김 사원이 다 내"'; ctx.hit();
        },
        then: () => (n >= 3 ? ctx.clear() : round()),
      });
    };
    round();
    return handle(T, host);
  },
};

// 빨간펜: 문장에서 틀린 낱말 하나를 누른다(4번). 맞는 낱말을 누르면 hit.
const TYPOS = [
  [['금일', '회의', '결과를', '공유', '드림니다'], 4], [['검토', '후', '회신', '부탁드립니다', '감사함니다'], 4],
  [['첨부', '화일', '확인', '바랍니다'], 1], [['내일까지', '제츨', '하겠습니다'], 1],
  [['일정', '변경', '않내', '드립니다'], 2], [['수고', '하셨읍니다', '내일', '뵙겠습니다'], 1],
  [['결제', '서류', '올렸습니다', '결재', '부탁드립니다'], 0], [['문의', '주신', '건', '답변', '드리겟습니다'], 4],
];
const typo = {
  id: 'typo', slot: 'early', title: '보고서_빨간펜.hwp', tag: '🧓',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div style="min-height:20px">🧓 "틀린 글자 하나 있잖아. 안 보여?"</div><div class="sunken" style="display:flex;flex-wrap:wrap;gap:5px;padding:8px;margin-top:6px;min-height:92px;align-content:flex-start"></div>';
    const msg = host.firstChild, box = host.lastChild;
    const list = shuffled(TYPOS, ctx.rng);
    let n = 0;
    const show = () => {
      const [words, bad] = list[n % list.length];
      box.replaceChildren(...words.map((w, i) => button(w, () => {
        if (i !== bad) { msg.textContent = `🧓 "${w}"는 맞는 말이야`; return ctx.hit(); }
        if (ctx.goal(++n, 4)) return ctx.clear();
        msg.textContent = '🧓 "그래 그거. 다음 줄"'; show();
      })));
    };
    show();
    return handle(T, host);
  },
};

// 대표전화 당겨받기: 용건에 맞는 팀으로 돌린다(5번). "잘못 걸었습니다"는 [끊기]. 틀리거나 3.5초 넘기면 hit.
const TEAMS = { 영업팀: '견적 좀 받고 싶은데요', 인사팀: '채용 공고 보고 전화드렸어요', 총무팀: '주차권 문의드립니다', 전산팀: '비밀번호를 잊어버렸어요', 재무팀: '세금계산서 발행해 주세요', 홍보팀: '취재 요청드립니다' };
const phone = {
  id: 'phone', slot: 'late', title: '☎ 대표전화_당겨받기', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="padding:6px;min-height:44px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px"></div>';
    const say = host.firstChild, box = host.lastChild;
    let n = 0;
    const ring = () => {
      const wrongCall = ctx.rng() < 0.25;
      const teams = shuffled(Object.keys(TEAMS), ctx.rng).slice(0, 4);
      const HANG = '📵 끊기';
      say.textContent = `☎ 따르릉! "${wrongCall ? '어? 거기 중국집 아니에요?' : TEAMS[teams[0]]}"`;
      ask(T, box, {
        options: [...shuffled(teams, ctx.rng).map((t) => `→ ${t}`), HANG], right: wrongCall ? HANG : `→ ${teams[0]}`, ms: 5500 / ctx.speed, css: 'height:40px',
        onPick: (ok, a) => {
          if (ok) return void ctx.goal(++n, 5);
          say.textContent = !a ? '☎ "여보세요? 여보세요?"' : a === HANG ? '🧓 "고객 전화를 끊어?"' : wrongCall ? '☎ "저 짜장면 시킬 건데요?"' : `☎ "${a.slice(2)} 아닌데요..." (다시 돌아옴)`;
          ctx.hit();
        },
        then: () => (n >= 5 ? ctx.clear() : ring()),
      });
    };
    ring();
    return handle(T, host);
  },
};

// 퇴근 엘리베이터: 자리가 있고 팀장님이 없는 엘리베이터가 왔을 때만 [타기](2번). 만원이거나 팀장님이 타 있으면 hit.
const elevatorDown = {
  id: 'elevator-down', slot: 'leave', title: '퇴근_엘리베이터.exe', tag: '💼',
  create(host, ctx) {
    const T = makeTimers();
    host.innerHTML = '<div class="sunken" style="text-align:center;padding:8px;min-height:74px"><div style="font-size:26px;line-height:36px"></div><div></div></div>';
    const car = host.firstChild.firstChild, info = host.firstChild.lastChild;
    let state = 'wait', n = 0;
    const wait = () => { state = 'wait'; car.textContent = '🔽'; info.textContent = '내려오는 중...'; T.after(arrive, (500 + ctx.rng() * 700) / ctx.speed); };
    const arrive = () => {
      const r = ctx.rng();
      state = r < 0.4 ? 'full' : r < 0.65 ? 'boss' : 'ok';
      const riders = state === 'full' ? 8 : 2 + Math.floor(ctx.rng() * 5);
      car.textContent = `🛗 ${state === 'boss' ? '🧓' : ''}${'👤'.repeat(Math.min(riders, 6))}`;
      info.textContent = `${riders}명 / 정원 8명${state === 'boss' ? ' (팀장님 탑승)' : ''}`;
      T.after(() => { if (state !== 'wait') wait(); }, 1100 / ctx.speed);
    };
    host.append(button('🏃 타기', () => {
      if (state === 'wait' || state === 'used') return;
      if (state === 'full') { info.textContent = '삐— 정원 초과입니다'; ctx.hit(); }
      else if (state === 'boss') { info.textContent = '🧓 "어, 김 사원. 저녁 먹고 가지?"'; ctx.hit(); }
      else if (ctx.goal(++n, 2)) return ctx.clear();
      else info.textContent = '🚪 닫힘 버튼 연타... 중간층에서 다시 내림';
      state = 'used'; // 이번 엘리베이터는 끝. 다음 것이 올 때까지 기다린다
    }, 'width:100%;height:52px;margin-top:8px'));
    wait();
    return handle(T, host);
  },
};

export default [badge, meetingRoom, splitBill, typo, phone, elevatorDown];
