import { SLOTS, END_MIN, DAY_SECONDS } from './config.js';

const START_MIN = SLOTS[0].start;

// 하루 경과(실제 초) → 게임 시각(분). 08:50에서 18:00까지 고르게 흐른다.
export const minuteAt = (dayElapsed) => START_MIN + (END_MIN - START_MIN) * Math.min(1, dayElapsed / DAY_SECONDS);

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
