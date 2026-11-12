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
export const HIT_DAMAGE = 15;
export const TIMEOUT_DAMAGE = 35;
export const STAGE_SECONDS = 25;

export const speedFor = (rankIndex) => 1 + 0.15 * rankIndex;
export const SLOWDOWN_AFTER_FAILS = 3;
export const SLOWDOWN_FACTOR = 0.8;
export const interruptChance = (rankIndex) => 0.2 + 0.08 * rankIndex;
