// 방해 요소: 끼어들기와 달리 판을 멈추지 않는다. 벌점도 없다. 그냥 귀찮게 한다.
// 약속: (area, rng) → 없음. area(#stage-area)는 다음 게임이 뜰 때 통째로 비워지므로 따로 치울 필요가 없다.
// ponytail: setTimeout이라 일시정지 중에도 시간이 간다(길어야 6초라 그냥 둔다). 문제 되면 makeTimers로 바꾼다.
import { el, pick } from './ui.js';

const NOTI = ['💬 팀장님: 김 사원 잠깐 될까?', '💬 단톡방: 오늘 점심 뭐 먹어요? (99+)', '📧 [전체] 사내 주차 안내 (필독)', '💬 후배: 선배 혹시 지금 바쁘세요?', '📅 5분 뒤: 주간 회의'];
const HELP = ['보고서를 쓰는 중이신 것 같네요!', '퇴근하고 싶으신 것 같네요!', '한숨을 쉬신 것 같네요!'];
const later = (n, ms) => setTimeout(() => n.remove(), ms);

export default [
  // 알림 배너: 게임 위를 가린다. 누르면 닫힌다
  (area, rng) => {
    const n = el(`<div class="nz noti" style="top:${30 + Math.floor(rng() * 40)}%">${pick(NOTI, rng)} <small>✕ 눌러서 닫기</small></div>`);
    n.addEventListener('click', () => n.remove());
    area.append(n); later(n, 5000);
  },
  // 도우미: 버튼 쪽을 가리고 [필요 없어요]를 눌러야 사라진다
  (area, rng) => {
    const n = el(`<div class="nz noti" style="bottom:0">🖇 도우미: ${pick(HELP, rng)} 도와드릴까요?<br><button class="raised bt">필요 없어요</button></div>`);
    n.querySelector('button').addEventListener('click', () => n.remove());
    area.append(n); later(n, 6000);
  },
  // 렉: 1.5초 동안 입력이 먹지 않는다
  (area) => {
    const n = el('<div class="nz cover" style="background:rgba(255,255,255,.6);color:#000">⏳ (응답 없음)</div>');
    area.append(n); later(n, 1500);
  },
  // 화면 보호기: 누르면 깬다
  (area) => {
    const n = el('<div class="nz cover" style="background:rgba(0,0,0,.88)">💤 화면 보호기<br>눌러서 깨우기</div>');
    n.addEventListener('click', () => n.remove());
    area.append(n); later(n, 6000);
  },
  // 창 흔들림: 5초 동안 창이 좌우로 흔들린다
  (area) => {
    const w = area.firstElementChild;
    w?.classList.add('sway');
    setTimeout(() => w?.classList.remove('sway'), 5000);
  },
];
