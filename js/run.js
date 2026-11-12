// 한 판 상태 기계. 시계를 쓰지 않고 시간은 tick(dt)로 밖에서 넣는다.
//
// 스테이지 약속 (js/stages/<id>.js):
//   export default {
//     id: 'weekly-report', slot: 'morning', title: '주간보고_v3.doc', tag: '💼',
//     create(host, ctx) {   // host: 그릴 HTMLElement
//       // ctx: { hit(), clear(), speed:number, rng() }
//       return { pause(){}, resume(){}, destroy(){} };
//     }
//   };
import { MENTAL_START, HIT_DAMAGE, TIMEOUT_DAMAGE, STAGE_SECONDS } from './config.js';
import { gameMinute } from './day.js';

export function createRun({ day, skills }) {
  const run = {
    slotIndex: 0, mental: MENTAL_START, coins: 0, status: 'playing', elapsed: 0,
    stageHadHit: false, usedSkills: new Set(), shield: false,
    failedStageId: null, failMinute: null, clearedIds: [],
    get stageId() { return day[run.slotIndex]; },
    now: () => run.status === 'cleared' ? gameMinute(5, 1)
      : gameMinute(run.slotIndex, Math.min(1, run.elapsed / STAGE_SECONDS)),
  };
  const over = () => run.status === 'cleared' || run.status === 'overtime';
  // clear() 중복 가드: 칸을 넘긴 뒤 tick()이 한 번도 없었으면 clear()를 무시한다.
  // (실제 스테이지는 새로 그려져 시간이 흐르므로 정상 플레이에는 영향이 없다.)
  let fresh = false;

  function advance() {
    if (run.slotIndex >= 5) { run.status = 'cleared'; return; }
    run.slotIndex++; run.elapsed = 0; run.stageHadHit = false; fresh = true;
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
    run.elapsed += dt;
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
    if (!damage(TIMEOUT_DAMAGE)) advance();
  };
  run.clear = () => {
    if (run.status !== 'playing' || fresh) return;
    if (!run.stageHadHit) run.coins++;
    run.clearedIds.push(run.stageId);
    advance();
  };
  run.addCoin = () => { run.coins++; };
  run.pause = () => { if (run.status === 'playing') run.status = 'paused'; };
  run.resume = () => { if (run.status === 'paused') run.status = 'playing'; };
  run.useSkill = (id) => {
    if (run.status !== 'playing' || !skills.includes(id) || run.usedSkills.has(id)) return;
    if (id === 'goHome') { if (run.slotIndex !== 5) return; run.status = 'cleared'; }
    else if (id === 'delegate') { run.clearedIds.push(run.stageId); advance(); }
    else if (id === 'postpone') run.shield = true;
    else if (id === 'coffee') run.mental = Math.min(100, run.mental + 30);
    else return;
    run.usedSkills.add(id);
  };
  return run;
}
