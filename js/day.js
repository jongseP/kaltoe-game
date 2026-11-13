import { SLOTS, END_MIN, DAY_SECONDS } from './config.js';

const START_MIN = SLOTS[0].start;

// 하루 경과(실제 초) → 게임 시각(분). 칸마다 실제 시간을 똑같이 나눠 준다(10분이면 칸당 100초).
export function minuteAt(dayElapsed) {
  const per = DAY_SECONDS / SLOTS.length;
  const t = Math.min(dayElapsed, DAY_SECONDS);
  const i = Math.min(SLOTS.length - 1, Math.floor(t / per));
  const end = i + 1 < SLOTS.length ? SLOTS[i + 1].start : END_MIN;
  return SLOTS[i].start + (end - SLOTS[i].start) * ((t - i * per) / per);
}

// 게임 시각이 속한 칸 번호
export const slotAt = (min) => SLOTS.reduce((idx, s, i) => (min >= s.start ? i : idx), 0);

// 칸 풀에서 다음 스테이지를 뽑는다. 풀이 2개 이상이면 방금 한 것은 피한다.
// weight(id): 뽑힐 비중 (기본 1)
export function pickStage(pool, prevId, rng, weight = () => 1) {
  const choices = pool.length > 1 ? pool.filter((id) => id !== prevId) : pool;
  let r = rng() * choices.reduce((s, id) => s + weight(id), 0);
  for (const id of choices) { r -= weight(id); if (r < 0) return id; }
  return choices[choices.length - 1];
}
