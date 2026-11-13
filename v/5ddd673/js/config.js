// 시각은 자정부터 센 분이다 (08:50 = 530). 밸런스 숫자는 모두 시작값이며 조정 가능하다.
export const SLOTS = [
  { id: 'commute', start: 530 },
  { id: 'morning', start: 600 },
  { id: 'lunch', start: 720 },
  { id: 'early', start: 780 },
  { id: 'late', start: 900 },
  { id: 'leave', start: 1050 },
];
export const END_MIN = 1080;

export const RANKS = ['인턴', '사원', '대리', '과장', '부장', '임원'];
export const STARS_TO_PROMOTE = 3;
export const STAR_PRICE = 5;

export const MENTAL_START = 100;
export const HIT_DAMAGE = 6;
export const TIMEOUT_DAMAGE = 15;
export const BURNOUT_REFILL = 60;     // 멘탈이 바닥나면 야근 +1시간, 멘탈은 여기까지 다시 찬다
export const COMBO_BONUS_EVERY = 3;  // 실수 없이 연속으로 이만큼 깰 때마다 💰 +1
export const STAGE_SECONDS = 25;     // 스테이지 하나의 제한 시간(실제 초)
export const DAY_SECONDS = 600;      // 08:50~18:00 하루가 실제로 걸리는 시간(10분)
export const CLEAR_HEAL = 3;         // 실수 없이 깨면 멘탈 회복
// 오후로 갈수록 빨라진다: 칸 번호(0~5)마다 5%
export const slotSpeed = (slotIndex) => 1 + 0.05 * slotIndex;

export const speedFor = (rankIndex) => 0.8 + 0.12 * rankIndex;
export const SLOWDOWN_AFTER_FAILS = 3;
export const SLOWDOWN_FACTOR = 0.8;
// 직급이 오를수록 🆕 MZ 스테이지 비중이 커진다 (인턴 1배 → 임원 3배)
export const mzWeight = (rankIndex) => 1 + 0.4 * rankIndex;
export const interruptChance = (rankIndex) => 0.2 + 0.04 * rankIndex;
