// 화면·소리 효과. 소리는 첫 터치 뒤에만 나고, 끄기 설정은 브라우저에 저장한다.
let ac = null, muted = false;
try { muted = localStorage.getItem('kaltoe.mute') === '1'; } catch { /* 저장소 차단 */ }
const audio = () => {
  try { ac ??= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch { /* 소리 없음 */ }
  return ac;
};
addEventListener('pointerdown', audio, { passive: true });

function beep(freq, dur, type = 'square', at = 0, vol = 0.05) {
  if (muted || !ac || ac.state !== 'running') return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
}
const seq = (notes, step, dur = step, type) => notes.forEach((f, i) => beep(f, dur, type, i * step));
const buzz = (p) => { try { navigator.vibrate?.(p); } catch { /* 진동 없음 */ } };
export const sfx = {
  hit: () => { beep(130, 0.2, 'sawtooth', 0, 0.08); buzz(60); },
  clear: () => seq([660, 990], 0.08, 0.12),
  clean: () => seq([660, 880, 1320], 0.07, 0.12),
  coin: () => seq([1320, 1760], 0.06, 0.1),
  timeout: () => seq([330, 220], 0.15, 0.2, 'triangle'),
  burnout: () => { seq([300, 240, 180, 120], 0.16, 0.2, 'sawtooth'); buzz([80, 60, 200]); },
  slot: () => seq([523, 659, 784, 1046], 0.09, 0.14),
  tick: () => beep(1000, 0.03),
  alert: () => seq([880, 880], 0.12, 0.08),
};
export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('kaltoe.mute', muted ? '1' : '0'); } catch { /* 저장 실패해도 괜찮다 */ }
  return muted;
}

const desk = () => document.getElementById('desk');
// 잠깐 떴다 사라지는 글자. cls: '' | 'bad' | 'cmd' | 'big'
export function toast(text, cls = '', ms = 900) {
  const n = document.createElement('div');
  n.className = `toast ${cls}`;
  n.textContent = text;
  n.style.animationDuration = `${ms}ms`;
  desk().append(n);
  setTimeout(() => n.remove(), ms);
  return n;
}
export function flash(color) {
  const n = document.createElement('div');
  n.className = 'flash';
  n.style.background = color;
  desk().append(n);
  setTimeout(() => n.remove(), 350);
}
export function shake() {
  const d = desk();
  d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
}
