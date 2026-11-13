import checkin from './checkin.js';
import elevator from './elevator.js';
import mailReply from './mail-reply.js';
import early30 from './early-30.js';
import standupEmoji from './standup-emoji.js';
import morningSpeech from './morning-speech.js';
import weeklyReport from './weekly-report.js';
import formChange from './form-change.js';
import dumpTask from './dump-task.js';
import leaveApproval from './leave-approval.js';
import hwpFormat from './hwp-format.js';
import collabNoti from './collab-noti.js';
import juniorWhy from './junior-why.js';
import stampRelay from './stamp-relay.js';
import lunchMenu from './lunch-menu.js';
import queue from './queue.js';
import nap from './nap.js';
import spoons from './spoons.js';
import soloEscape from './solo-escape.js';
import lunchWorkout from './lunch-workout.js';
import excelRef from './excel-ref.js';
import nitpick from './nitpick.js';
import latte from './latte.js';
import scoldNod from './scold-nod.js';
import aiReport from './ai-report.js';
import airpods from './airpods.js';
import blameDodge from './blame-dodge.js';
import politicsChat from './politics-chat.js';
import watch from './watch.js';
import abuseDodge from './abuse-dodge.js';
import salaryThief from './salary-thief.js';
import printer from './printer.js';
import fiveMinMeeting from './five-min-meeting.js';
import lastOrder from './last-order.js';
import hoesik from './hoesik.js';
import bossBag from './boss-bag.js';
import juniorLeft from './junior-left.js';
import quietQuit from './quiet-quit.js';
import bossBehind from './boss-behind.js';
import bossAway from './boss-away.js';
import moreInterrupts from './interrupts.js';
import { SLOTS } from '../config.js';

export const STAGES = [
  checkin, elevator, mailReply, early30, standupEmoji, morningSpeech,
  weeklyReport, formChange, dumpTask, leaveApproval, hwpFormat, collabNoti, juniorWhy, stampRelay,
  lunchMenu, queue, nap, spoons, soloEscape, lunchWorkout,
  excelRef, nitpick, latte, scoldNod, aiReport, airpods,
  blameDodge, politicsChat, watch, abuseDodge, salaryThief, printer,
  fiveMinMeeting, lastOrder, hoesik, bossBag, juniorLeft, quietQuit,
];
// 끼어들기 약속: { id, title, create(host, ctx: {close, hit, addCoin}) → { pause, resume, destroy } }
export const INTERRUPTS = [bossBehind, bossAway, ...moreInterrupts];

export const getStage = (id) => STAGES.find((s) => s.id === id);

// 칸마다 그 칸의 스테이지 id 목록
export const poolsBySlot = () => Object.fromEntries(SLOTS.map((sl) => [sl.id, STAGES.filter((s) => s.slot === sl.id).map((s) => s.id)]));
