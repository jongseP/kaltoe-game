import { RANKS, STARS_TO_PROMOTE, END_MIN } from '../config.js';
import { formatClock } from '../clock.js';

const START_MIN = 530;
const cells = (n) => Array.from({ length: 10 }, (_, i) => `<i${i < n ? '' : ' class="off"'}></i>`).join('');

export function renderStatus(el, { progress, run }) {
  const now = run.now();
  const filled = Math.max(0, Math.min(10, Math.floor(10 * (now - START_MIN) / (END_MIN - START_MIN))));
  const top = progress.rank >= RANKS.length - 1;
  const stars = top ? `★ ${progress.stars}`
    : '★'.repeat(progress.stars) + '☆'.repeat(Math.max(0, STARS_TO_PROMOTE - progress.stars));
  el.innerHTML = `
    <div class="row">
      <span class="sunken chip">👔 ${RANKS[progress.rank]}</span>
      <span class="promo">진급 ${stars}</span>
      <span class="sunken chip push">💰 보너스 ${progress.coins + run.coins}</span>
    </div>
    <div class="row">
      <span class="lcd">${formatClock(now)}</span>
      <span class="sunken blocks">${cells(filled)}</span>
      ${run.overtimeHours ? `<span class="ot">야근 +${run.overtimeHours}h</span>` : '<span>18:00 퇴근</span>'}
    </div>
    <div class="row">
      <span class="lbl">멘탈</span>
      <span class="sunken blocks green">${cells(Math.ceil(run.mental / 10))}</span>
      <span class="pct">${run.mental}%</span>
      ${run.stageLeft ? `<span class="pct">⏱${Math.ceil(run.stageLeft())}초</span>` : ''}
    </div>`;
}
