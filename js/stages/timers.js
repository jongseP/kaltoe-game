// 일시정지할 수 있는 타이머 묶음. pause() 동안은 시간이 흐르지 않고 resume()은 여러 번 불러도 된다.
export function makeTimers() {
  let paused = false, last = performance.now();
  const jobs = new Set();
  const loop = setInterval(() => {
    const now = performance.now(), dt = now - last;
    last = now;
    if (paused) return;
    for (const j of [...jobs]) {
      if (!jobs.has(j)) continue;
      j.left -= dt;
      if (j.left > 0) continue;
      if (j.every) j.left = Math.max(j.left + j.ms, 1); else jobs.delete(j);
      j.fn();
    }
  }, 50);
  const add = (fn, ms, every) => { const j = { fn, ms, left: ms, every }; jobs.add(j); return () => jobs.delete(j); };
  return {
    after: (fn, ms) => add(fn, ms, false),
    every: (fn, ms) => add(fn, ms, true),
    pause() { paused = true; },
    resume() { paused = false; },
    destroy() { clearInterval(loop); jobs.clear(); },
  };
}
