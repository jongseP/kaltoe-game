import { RANKS, STARS_TO_PROMOTE, STAR_PRICE, SLOWDOWN_AFTER_FAILS } from './config.js';

const KEY = 'kaltoe.progress.v1';
const TOP = RANKS.length - 1;
const SKILLS = ['delegate', 'postpone', 'coffee', 'goHome'];

export const defaultProgress = () => ({ rank: 0, stars: 0, coins: 0, name: '김칼퇴', nameSet: false, failStreak: {}, clearStreak: 0 });

const isNat = (v) => Number.isInteger(v) && v >= 0;

// 필드별로 검사해서 잘못된 값만 기본값으로 대체한다
export function load(storage) {
  const d = defaultProgress();
  try {
    const o = JSON.parse(storage.getItem(KEY));
    if (!o || typeof o !== 'object' || Array.isArray(o)) return d;
    const fs = o.failStreak;
    const fsOk = fs && typeof fs === 'object' && !Array.isArray(fs) && Object.values(fs).every(isNat);
    return {
      rank: isNat(o.rank) && o.rank <= TOP ? o.rank : d.rank,
      stars: isNat(o.stars) ? o.stars : d.stars,
      coins: isNat(o.coins) ? o.coins : d.coins,
      name: typeof o.name === 'string' ? o.name : d.name,
      nameSet: typeof o.nameSet === 'boolean' ? o.nameSet : d.nameSet,
      failStreak: fsOk ? { ...fs } : d.failStreak,
      clearStreak: isNat(o.clearStreak) ? o.clearStreak : d.clearStreak,
    };
  } catch { return d; }
}

export function save(storage, p) {
  try { storage.setItem(KEY, JSON.stringify(p)); } catch { /* 저장 실패는 무시 */ }
}

// ★ +1 공통 규칙: 3개면 진급(임원은 계속 쌓기)
function addStar(p) {
  const stars = p.stars + 1;
  if (p.rank < TOP && stars >= STARS_TO_PROMOTE) return { p: { ...p, rank: p.rank + 1, stars: 0 }, promoted: true };
  return { p: { ...p, stars }, promoted: false };
}

export function applyClear(p, coinsEarned) {
  return addStar({ ...p, coins: p.coins + coinsEarned, clearStreak: p.clearStreak + 1 });
}

export function applyOvertime(p, failedStageId) {
  return {
    p: { ...p, stars: Math.max(0, p.stars - 1), clearStreak: 0,
      failStreak: { ...p.failStreak, [failedStageId]: (p.failStreak[failedStageId] || 0) + 1 } },
    lostStar: p.stars > 0,
  };
}

export function applyStageResult(p, stageId, failed) {
  return { ...p, failStreak: failed ? { ...p.failStreak } : { ...p.failStreak, [stageId]: 0 } };
}

export function buyStar(p) {
  if (p.coins < STAR_PRICE) return { p: { ...p }, ok: false };
  return { ...addStar({ ...p, coins: p.coins - STAR_PRICE }), ok: true };
}

export const daysToPromote = (p) => (p.rank >= TOP ? null : STARS_TO_PROMOTE - p.stars);
export const isSlowed = (p, stageId) => (p.failStreak[stageId] || 0) >= SLOWDOWN_AFTER_FAILS;
export const skillsFor = (rank) => SKILLS.slice(0, Math.max(0, rank - 1));
