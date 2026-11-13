import { makeWindow } from './ui/window.js';
import { renderStatus } from './ui/statusbar.js';
import { showCleared, showOvertime } from './ui/result.js';
import { makeRng } from './rng.js';
import { pickStage } from './day.js';
import { createRun } from './run.js';
import { drawCard, shareResult } from './share.js';
import { RANKS, STARS_TO_PROMOTE, SLOTS, speedFor, slotSpeed, SLOWDOWN_FACTOR, interruptChance, mzWeight } from './config.js';
import { load, save, applyClear, applyOvertime, applyStageResult, buyStar, daysToPromote, isSlowed, skillsFor } from './progress.js';
import { getStage, poolsBySlot, INTERRUPTS } from './stages/registry.js';
import { GUIDE, SLOT_BANNER } from './stages/guide.js';
import { sfx, toast, flash, shake, isMuted, toggleMute } from './fx.js';

const $ = (id) => document.getElementById(id);
let store = null;
try { store = window.localStorage; } catch { /* 저장소 차단: 저장 없이 진행 */ }
const SKILL_LABEL = { delegate: '넘기기', postpone: '회의 때', coffee: '커피', goHome: '퇴근' };
let progress = load(store);

function persist(p) { progress = p; save(store, p); }

function note(text) {
  const n = document.createElement('div');
  n.textContent = text;
  n.style.cssText = 'position:absolute;top:4px;left:12px;right:12px;z-index:5;background:#ffffa0;border:1px solid #808000;padding:6px 8px;box-shadow:2px 2px 0 rgba(0,0,0,.4)';
  $('desk').append(n);
  setTimeout(() => n.remove(), 2000);
}

// 처음 공유할 때만 이름을 묻는다 (확인하면 true, 취소하면 false)
function askName() {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;z-index:2;display:flex;align-items:center;padding:12px;background:rgba(0,0,0,.3)';
    const body = document.createElement('div');
    const input = document.createElement('input');
    input.maxLength = 8;
    input.value = progress.name;
    input.setAttribute('aria-label', '이름');
    input.style.cssText = 'font:inherit;width:100%;box-sizing:border-box;margin:6px 0';
    const done = (ok) => {
      wrap.remove();
      if (ok) persist({ ...progress, name: input.value.trim().slice(0, 8) || '김칼퇴', nameSet: true });
      resolve(ok);
    };
    const mk = (t, ok) => { const b = document.createElement('button'); b.className = 'raised bt'; b.textContent = t; b.addEventListener('click', () => done(ok)); return b; };
    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:6px;justify-content:center';
    btns.append(mk('확인', true), mk('취소', false));
    body.append('카드에 표시할 이름 (최대 8자)', input, btns);
    const host = document.createElement('div');
    host.style.width = '100%';
    host.append(makeWindow({ title: '이름 입력', body }));
    wrap.append(host);
    $('overlay-area').append(wrap);
    input.focus();
  });
}

// info: {cleared, timeText}. 진급 정보는 누른 시점의 progress를 쓴다.
let sharing = false;
async function share({ cleared, timeText }) {
  if (sharing) return;
  sharing = true;
  try {
    if (!progress.nameSet && !(await askName())) return;
    const p = progress;
    const top = p.rank >= RANKS.length - 1;
    const starsText = top ? `${RANKS[p.rank]} · 연속 칼퇴 ${p.clearStreak}일`
      : `${RANKS[p.rank + 1]}까지 ${'★'.repeat(p.stars)}${'☆'.repeat(Math.max(0, STARS_TO_PROMOTE - p.stars))}`;
    const blob = await drawCard({ name: p.name, rankName: RANKS[p.rank], cleared, timeText, starsText });
    const r = await shareResult(blob, location.origin + location.pathname);
    if (r === 'copied') note('링크를 복사했습니다');
  } catch { note('공유하지 못했습니다'); } finally { sharing = false; }
}
// 결과 화면이 들고 있는 progress는 낡았을 수 있어(이름 저장 등) 항상 현재 값으로 산다
const onBuyStar = () => { const r = buyStar(progress); if (r.ok) persist(r.p); return r; };

// 소리 켜고 끄기 단추 (작업 표시줄)
{
  const b = document.createElement('button');
  b.className = 'raised task';
  b.setAttribute('aria-label', '소리 켜기/끄기');
  b.textContent = isMuted() ? '🔇' : '🔊';
  b.addEventListener('click', () => { b.textContent = toggleMute() ? '🔇' : '🔊'; });
  $('skills').before(b);
}

// 탭이 숨겨지면 현재 판을 멈추고 돌아오면 잇는다 (startRun이 채운다)
let visibility = null;
document.addEventListener('visibilitychange', () => visibility?.(document.hidden));

// 개발용: ?stage=<id> 이면 하루 내내 그 스테이지
const devStage = getStage(new URLSearchParams(location.search).get('stage') ?? '')?.id;

function startRun() {
  $('result-area').replaceChildren();
  const rng = makeRng(Date.now());
  const skills = skillsFor(progress.rank);
  const pools = poolsBySlot();
  const pick = devStage ? () => devStage : (slot, prev) => pickStage(pools[SLOTS[slot].id], prev, rng, (id) => (getStage(id).tag === '🆕' ? mzWeight(progress.rank) : 1));
  const run = createRun({ pick, skills });

  const skillBtns = skills.map((id) => {
    const b = document.createElement('button');
    b.className = 'raised task';
    b.textContent = SKILL_LABEL[id];
    b.addEventListener('click', () => { run.useSkill(id); b.disabled = true; });
    return b;
  });
  $('skills').replaceChildren(...skillBtns);

  let current = null, shown = -1, last = null, interrupt = null, interruptAt = null;
  let intro = false, fuse = null, lastSec = 0;
  const INTRO_SECONDS = 1; // 한마디가 떠 있는 동안 스테이지는 멈춰 있다
  const mount = () => {
    current?.destroy();
    shown = run.serial;
    const stage = getStage(run.stageId);
    const [cmd, hint] = GUIDE[stage.id];
    const body = document.createElement('div');
    body.innerHTML = '<div class="fuse"><i></i></div><div class="hint"></div><div></div>';
    fuse = body.firstChild;
    body.children[1].textContent = `👉 ${hint}`;
    const host = body.lastChild;
    $('stage-area').replaceChildren(makeWindow({ title: `${stage.tag} ${stage.title}`, body }));
    const speed = speedFor(progress.rank) * slotSpeed(run.slotIndex) * (isSlowed(progress, stage.id) ? SLOWDOWN_FACTOR : 1);
    current = stage.create(host, { hit: () => run.hit(), clear: () => run.clear(), speed, rng });
    current.pause(); intro = true;
    toast(cmd, 'cmd', INTRO_SECONDS * 1000);
    // 스테이지마다 이벤트는 최대 1번: 3~10초 사이 무작위 시점
    interruptAt = rng() < interruptChance(progress.rank) ? 3 + rng() * 7 : null;
  };

  const closeInterrupt = (resume) => {
    if (!interrupt) return;
    interrupt.it.destroy();
    interrupt.wrap.remove();
    interrupt = null;
    if (resume && !document.hidden) { run.resume(); if (!intro) current?.resume(); }
  };
  const openInterrupt = () => {
    interruptAt = null;
    const def = INTERRUPTS[Math.floor(rng() * INTERRUPTS.length)];
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;padding:12px;background:rgba(0,0,0,.3)';
    const host = document.createElement('div');
    host.style.width = '100%';
    wrap.append(host);
    $('overlay-area').append(wrap);
    run.pause(); current?.pause();
    sfx.alert();
    interrupt = { wrap };
    // 멈춘 판은 hit를 무시하므로 잠깐 켜고 hit한 뒤 다시 멈춘다 (닫힐 때 close가 다시 켠다)
    interrupt.it = def.create(host, {
      close: () => closeInterrupt(true),
      hit: () => { run.resume(); run.hit(); run.pause(); },
      addCoin: () => run.addCoin(),
      rng, speed: speedFor(progress.rank),
    });
  };
  visibility = (hidden) => {
    if (hidden) { run.pause(); current?.pause(); interrupt?.it.pause(); return; }
    interrupt?.it.resume();
    if (!interrupt) { run.resume(); if (!intro) current?.resume(); }
  };

  // run이 쌓아 둔 사건을 화면·소리 효과로 바꾼다
  const onEvent = (e) => {
    if (e.type === 'hit') { sfx.hit(); shake(); flash('#c00000'); }
    else if (e.type === 'shield') toast('🛡 "회의 때 말씀드릴게요" 막음!');
    else if (e.type === 'clear') { sfx.clear(); toast('✔ 처리 완료'); }
    else if (e.type === 'clean') { sfx.clean(); flash('#00a000'); toast(e.bonus ? `✔ 완벽! ${e.combo}연속 💰+2` : '✔ 완벽! 💰+1'); }
    else if (e.type === 'timeout') { sfx.timeout(); shake(); toast('⏰ 시간 초과', 'bad'); }
    else if (e.type === 'burnout') { sfx.burnout(); flash('#000'); toast(`😵 번아웃! 야근 +1시간`, 'bad big', 1600); }
    else if (e.type === 'slot') { sfx.slot(); toast(`${SLOT_BANNER[run.slotIndex]} · 속도 UP`, 'big', 1400); }
  };

  const finish = () => {
    visibility = null;
    // 이번 판 💰은 progress에 이미 합쳐졌으니 패널에서는 0으로 보여 준다
    const settled = { now: () => run.now(), mental: run.mental, coins: 0, overtimeHours: run.overtimeHours };
    const stats = `오늘 처리 ${run.clearedIds.length}건 · 완벽 ${run.cleanClears}건 · 최고 ${run.bestCombo}연속`;
    for (const e of run.events.splice(0)) onEvent(e);
    const buy = () => { const r = onBuyStar(); if (r.ok) renderStatus($('statusbar'), { progress, run: settled }); return r; };
    closeInterrupt(false);
    current?.destroy();
    $('stage-area').replaceChildren();
    let p = progress;
    for (const id of run.clearedIds) p = applyStageResult(p, id, false);
    if (run.status === 'cleared') {
      const r = applyClear(p, run.coins);
      persist(r.p);
      showCleared($('result-area'), { progress: r.p, promoted: r.promoted, coinsEarned: run.coins, stats, onNext: startRun, onBuyStar: buy,
        onShare: () => share({ cleared: true, timeText: '오늘 18:00 칼퇴' }) });
    } else {
      const daysBefore = daysToPromote(p);
      const r = applyOvertime({ ...p, coins: p.coins + run.coins }, run.failedStageId); // 이번 판 💰은 야근이어도 잃지 않는다
      persist(r.p);
      showOvertime($('result-area'), {
        progress: r.p, stageTitle: getStage(run.failedStageId).title,
        hours: run.overtimeHours, stats,
        daysBefore, daysAfter: daysToPromote(r.p), lostStar: r.lostStar, onRetry: startRun, onBuyStar: buy,
        onShare: () => share({ cleared: false, timeText: `야근 ${run.overtimeHours}시간 확정` }),
      });
    }
    renderStatus($('statusbar'), { progress, run: settled });
  };

  const frame = (t) => {
    const dt = last === null ? 0 : Math.min(0.1, (t - last) / 1000);
    last = t;
    run.tick(dt);
    if (run.status === 'cleared' || run.status === 'overtime') return finish();
    for (const e of run.events.splice(0)) onEvent(e);
    if (shown !== run.serial) mount();
    if (intro && run.elapsed >= INTRO_SECONDS) { intro = false; if (!interrupt && !document.hidden) current?.resume(); }
    const left = run.stageLeft();
    fuse.firstChild.style.width = `${left * 5}%`;
    fuse.classList.toggle('low', left <= 5);
    if (left <= 5 && Math.ceil(left) !== lastSec && !interrupt) sfx.tick();
    lastSec = Math.ceil(left);
    if (interruptAt !== null && !interrupt && run.elapsed >= interruptAt) openInterrupt();
    skills.forEach((id, i) => { skillBtns[i].disabled = run.usedSkills.has(id) || (id === 'goHome' && run.slotIndex !== 5); });
    renderStatus($('statusbar'), { progress, run });
    requestAnimationFrame(frame);
  };
  mount();
  requestAnimationFrame(frame);
}

startRun();

// 첫 판 안내 쪽지: 한 번 탭하면 닫히고 다시 뜨지 않는다
try {
  if (!store.getItem('kaltoe.tip.v1')) {
    const tip = document.createElement('div');
    tip.textContent = '💡 멘탈이 바닥날 때마다 야근 +1시간! 야근 없이 18:00이 되면 칼퇴 ★, ★ 3개면 진급';
    tip.style.cssText = 'position:absolute;top:4px;left:12px;right:12px;z-index:5;background:#ffffa0;border:1px solid #808000;padding:6px 8px;box-shadow:2px 2px 0 rgba(0,0,0,.4);cursor:pointer';
    tip.addEventListener('click', () => {
      tip.remove();
      try { store.setItem('kaltoe.tip.v1', '1'); } catch { /* 저장 실패해도 괜찮다 */ }
    });
    $('desk').append(tip);
  }
} catch { /* localStorage 접근 불가 */ }
