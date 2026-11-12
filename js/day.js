import { SLOTS, END_MIN } from './config.js';

// 칸마다 풀에서 스테이지 id를 1개씩 뽑는다. SLOTS 순서대로 6개가 나온다.
export function buildDay(pools, rng) {
  return SLOTS.map((slot) => {
    const pool = pools[slot.id];
    return pool[Math.floor(rng() * pool.length)];
  });
}

// 칸 시작 시각과 다음 칸 시작 시각(마지막 칸은 END_MIN) 사이를 fraction만큼 보간한다.
export function gameMinute(slotIndex, fraction) {
  const start = SLOTS[slotIndex].start;
  const next = slotIndex + 1 < SLOTS.length ? SLOTS[slotIndex + 1].start : END_MIN;
  return start + (next - start) * fraction;
}
