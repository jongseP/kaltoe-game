// 한 판 상태 기계. 시계를 쓰지 않고 시간은 tick(dt)로 밖에서 넣는다.
// 하루는 DAY_SECONDS 동안 흐르고, 그동안 지금 칸의 스테이지를 계속 이어서 한다.
// 하루는 항상 끝까지 간다. 멘탈이 0이 되면 야근 +1시간이 쌓이고 멘탈이 다시 찬다.
// 18:00에 야근이 0시간이면 칼퇴, 아니면 야근.
// run.events: 화면 효과용 사건 목록 ({type}). 화면 쪽이 읽고 비운다.
//
// 스테이지 약속 (js/stages/<id>.js):
//   export default {
//     id: 'weekly-report', slot: 'morning', title: '주간보고_v3.doc', tag: '💼',
//     create(host, ctx) {   // host: 그릴 HTMLElement
//       // ctx: { hit(), clear(), speed:number, rng() }
//       return { pause(){}, resume(){}, destroy(){} };
//     }
//   };
import { MENTAL_START, HIT_DAMAGE, TIMEOUT_DAMAGE, STAGE_SECONDS, DAY_SECONDS, CLEAR_HEAL, END_MIN, BURNOUT_REFILL, COMBO_BONUS_EVERY } from './config.js';
import { minuteAt, slotAt } from './day.js';

// pick(slotIndex, prevId) → 다음 스테이지 id
export function createRun({ pick, skills }) {
  const run = {
    slotIndex: 0, stageId: null, serial: 0, mental: MENTAL_START, coins: 0, status: 'playing',
    elapsed: 0, dayElapsed: 0,
    stageHadHit: false, usedSkills: new Set(), shield: false,
    failedStageId: null, failMinute: null, clearedIds: [],
    overtimeHours: 0, played: 0, cleanClears: 0, combo: 0, bestCombo: 0, events: [],
    now: () => (run.status === 'cleared' || run.status === 'overtime' ? END_MIN : minuteAt(run.dayElapsed)),
    stageLeft: () => Math.max(0, STAGE_SECONDS - run.elapsed),
  };
  // clear() 중복 가드: 새 스테이지를 띄운 뒤 tick()이 한 번도 없었으면 clear()를 무시한다.
  let fresh = false;

  function next() {
    run.stageId = pick(run.slotIndex, run.stageId);
    run.serial++; run.elapsed = 0; run.stageHadHit = false; fresh = true; run.played++;
  }
  const end = () => { run.status = run.overtimeHours ? 'overtime' : 'cleared'; };
  let graceUntil = 0; // 번아웃 직후 3초는 멘탈이 깎이지 않는다 (연달아 번아웃 방지)
  function damage(n) {
    if (run.dayElapsed < graceUntil) return;
    run.mental = Math.max(0, run.mental - n);
    run.combo = 0;
    if (run.mental > 0) return;
    // 번아웃: 판은 계속되고 야근이 1시간 늘어난다
    if (!run.overtimeHours) { run.failedStageId = run.stageId; run.failMinute = run.now(); }
    run.overtimeHours++; run.mental = BURNOUT_REFILL; graceUntil = run.dayElapsed + 3;
    run.events.push({ type: 'burnout' });
  }

  run.tick = (dt) => {
    if (run.status !== 'playing') return;
    fresh = false;
    run.dayElapsed += dt;
    run.elapsed += dt;
    if (run.dayElapsed >= DAY_SECONDS) return end();
    const slot = slotAt(run.now());
    if (slot !== run.slotIndex) { run.slotIndex = slot; next(); run.events.push({ type: 'slot' }); return; }
    if (run.elapsed >= STAGE_SECONDS) run.timeout();
  };
  run.hit = () => {
    if (run.status !== 'playing') return;
    run.stageHadHit = true;
    if (run.shield) { run.shield = false; run.events.push({ type: 'shield' }); return; }
    run.events.push({ type: 'hit' });
    damage(HIT_DAMAGE);
  };
  run.timeout = () => {
    if (run.status !== 'playing') return;
    run.events.push({ type: 'timeout' });
    damage(TIMEOUT_DAMAGE); next();
  };
  run.clear = () => {
    if (run.status !== 'playing' || fresh) return;
    if (!run.stageHadHit) {
      run.coins++; run.mental = Math.min(100, run.mental + CLEAR_HEAL);
      run.cleanClears++; run.combo++; run.bestCombo = Math.max(run.bestCombo, run.combo);
      const bonus = run.combo % COMBO_BONUS_EVERY === 0;
      if (bonus) run.coins++;
      run.events.push({ type: 'clean', combo: run.combo, bonus });
    } else run.events.push({ type: 'clear' });
    run.clearedIds.push(run.stageId);
    next();
  };
  run.addCoin = () => { run.coins++; };
  run.pause = () => { if (run.status === 'playing') run.status = 'paused'; };
  run.resume = () => { if (run.status === 'paused') run.status = 'playing'; };
  run.useSkill = (id) => {
    if (run.status !== 'playing' || !skills.includes(id) || run.usedSkills.has(id)) return;
    if (id === 'goHome') { if (run.slotIndex !== 5) return; end(); }
    else if (id === 'delegate') { run.clearedIds.push(run.stageId); next(); }
    else if (id === 'postpone') run.shield = true;
    else if (id === 'coffee') run.mental = Math.min(100, run.mental + 30);
    else return;
    run.usedSkills.add(id);
  };
  next();
  return run;
}
