// 한 판 상태 기계. 시계를 쓰지 않고 시간은 tick(dt)로 밖에서 넣는다.
// 하루는 DAY_SECONDS 동안 흐르고, 그동안 지금 칸의 스테이지를 계속 이어서 한다.
// 18:00까지 멘탈이 남으면 칼퇴, 멘탈이 0이 되면 야근.
//
// 스테이지 약속 (js/stages/<id>.js):
//   export default {
//     id: 'weekly-report', slot: 'morning', title: '주간보고_v3.doc', tag: '💼',
//     create(host, ctx) {   // host: 그릴 HTMLElement
//       // ctx: { hit(), clear(), speed:number, rng() }
//       return { pause(){}, resume(){}, destroy(){} };
//     }
//   };
import { MENTAL_START, HIT_DAMAGE, TIMEOUT_DAMAGE, STAGE_SECONDS, DAY_SECONDS, CLEAR_HEAL, END_MIN } from './config.js';
import { minuteAt, slotAt } from './day.js';

// pick(slotIndex, prevId) → 다음 스테이지 id
export function createRun({ pick, skills }) {
  const run = {
    slotIndex: 0, stageId: null, serial: 0, mental: MENTAL_START, coins: 0, status: 'playing',
    elapsed: 0, dayElapsed: 0,
    stageHadHit: false, usedSkills: new Set(), shield: false,
    failedStageId: null, failMinute: null, clearedIds: [],
    now: () => (run.status === 'cleared' ? END_MIN : minuteAt(run.dayElapsed)),
    stageLeft: () => Math.max(0, STAGE_SECONDS - run.elapsed),
  };
  // clear() 중복 가드: 새 스테이지를 띄운 뒤 tick()이 한 번도 없었으면 clear()를 무시한다.
  let fresh = false;

  function next() {
    run.stageId = pick(run.slotIndex, run.stageId);
    run.serial++; run.elapsed = 0; run.stageHadHit = false; fresh = true;
  }
  function damage(n) {
    run.mental = Math.max(0, run.mental - n);
    if (run.mental > 0) return false;
    run.status = 'overtime'; run.failedStageId = run.stageId; run.failMinute = run.now();
    return true;
  }

  run.tick = (dt) => {
    if (run.status !== 'playing') return;
    fresh = false;
    run.dayElapsed += dt;
    run.elapsed += dt;
    if (run.dayElapsed >= DAY_SECONDS) { run.status = 'cleared'; return; }
    const slot = slotAt(run.now());
    if (slot !== run.slotIndex) { run.slotIndex = slot; next(); return; }
    if (run.elapsed >= STAGE_SECONDS) run.timeout();
  };
  run.hit = () => {
    if (run.status !== 'playing') return;
    run.stageHadHit = true;
    if (run.shield) { run.shield = false; return; }
    damage(HIT_DAMAGE);
  };
  run.timeout = () => {
    if (run.status !== 'playing') return;
    if (!damage(TIMEOUT_DAMAGE)) next();
  };
  run.clear = () => {
    if (run.status !== 'playing' || fresh) return;
    if (!run.stageHadHit) { run.coins++; run.mental = Math.min(100, run.mental + CLEAR_HEAL); }
    run.clearedIds.push(run.stageId);
    next();
  };
  run.addCoin = () => { run.coins++; };
  run.pause = () => { if (run.status === 'playing') run.status = 'paused'; };
  run.resume = () => { if (run.status === 'paused') run.status = 'playing'; };
  run.useSkill = (id) => {
    if (run.status !== 'playing' || !skills.includes(id) || run.usedSkills.has(id)) return;
    if (id === 'goHome') { if (run.slotIndex !== 5) return; run.status = 'cleared'; }
    else if (id === 'delegate') { run.clearedIds.push(run.stageId); next(); }
    else if (id === 'postpone') run.shield = true;
    else if (id === 'coffee') run.mental = Math.min(100, run.mental + 30);
    else return;
    run.usedSkills.add(id);
  };
  next();
  return run;
}
