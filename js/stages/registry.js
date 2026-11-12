import checkin from './checkin.js';
import mailReply from './mail-reply.js';
import weeklyReport from './weekly-report.js';
import formChange from './form-change.js';
import lunchMenu from './lunch-menu.js';
import spoons from './spoons.js';
import excelRef from './excel-ref.js';
import latte from './latte.js';
import watch from './watch.js';
import printer from './printer.js';
import fiveMinMeeting from './five-min-meeting.js';
import lastOrder from './last-order.js';
import bossBehind from './boss-behind.js';
import bossAway from './boss-away.js';
import { SLOTS } from '../config.js';

export const STAGES = [checkin, mailReply, weeklyReport, formChange, lunchMenu, spoons, excelRef, latte, watch, printer, fiveMinMeeting, lastOrder];
// 끼어들기 약속: { id, title, create(host, ctx: {close, hit, addCoin}) → { pause, resume, destroy } }
export const INTERRUPTS = [bossBehind, bossAway];

export const getStage = (id) => STAGES.find((s) => s.id === id);

// 칸마다 그 칸의 스테이지 id 목록
export const poolsBySlot = () => Object.fromEntries(SLOTS.map((sl) => [sl.id, STAGES.filter((s) => s.slot === sl.id).map((s) => s.id)]));
