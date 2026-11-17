import { END_MIN } from './config.js';

export function minutesLeft(min) {
  return Math.floor(Math.max(0, END_MIN - min));
}

export function formatClock(min) {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
