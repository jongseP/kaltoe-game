const TEXT = '칼퇴.exe — 오늘도 칼퇴할 수 있을까?';
const FONT = '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

// 600×400 옛날 PC 창 모양 결과 카드를 PNG Blob으로 그린다
export function drawCard({ name, rankName, cleared, timeText, starsText }) {
  const c = document.createElement('canvas');
  c.width = 600; c.height = 400;
  const g = c.getContext('2d');
  g.fillStyle = '#008080'; g.fillRect(0, 0, 600, 400);
  // 창
  g.fillStyle = '#c0c0c0'; g.fillRect(40, 40, 520, 320);
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(41.5, 41.5, 517, 317);
  g.strokeStyle = '#404040'; g.strokeRect(43.5, 43.5, 517, 317);
  // 제목줄
  const grad = g.createLinearGradient(48, 0, 552, 0);
  grad.addColorStop(0, '#000080'); grad.addColorStop(1, '#1084d0');
  g.fillStyle = grad; g.fillRect(48, 48, 504, 36);
  g.fillStyle = '#fff'; g.font = `bold 22px ${FONT}`; g.textBaseline = 'middle';
  g.fillText('📋 칼퇴.exe', 60, 67);
  // 본문
  g.textAlign = 'center'; g.fillStyle = '#000';
  g.font = `bold 40px ${FONT}`;
  g.fillStyle = cleared ? '#006000' : '#a00000';
  g.fillText(cleared ? '칼퇴 성공!' : '야근 확정', 300, 150);
  g.fillStyle = '#000'; g.font = `bold 26px ${FONT}`;
  g.fillText(`${name} ${rankName} · ${timeText}`, 300, 225, 480);
  g.font = `bold 32px ${FONT}`;
  g.fillText(starsText, 300, 290, 480);
  g.font = `16px ${FONT}`; g.fillStyle = '#404040';
  g.fillText('칼퇴.exe', 300, 335);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
}

// 공유창(파일) → 공유창(글만) → 주소 복사 순서로 시도한다. 취소는 오류가 아니다.
export async function shareResult(blob, url) {
  const nav = navigator;
  const file = new File([blob], 'kaltoe.png', { type: 'image/png' });
  const tiers = [
    nav.share && nav.canShare?.({ files: [file] }) ? { files: [file], text: TEXT, url } : null,
    nav.share ? { text: TEXT, url } : null,
  ];
  for (const data of tiers) {
    if (!data) continue;
    try { await nav.share(data); return 'shared'; } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  await nav.clipboard.writeText(url);
  return 'copied';
}
