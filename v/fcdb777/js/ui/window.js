// 파란 제목줄과 _ ✕ 단추가 달린 회색 창. ✕는 장식이다.
export function makeWindow({ title, body }) {
  const win = document.createElement('div');
  win.className = 'win raised';

  const bar = document.createElement('div');
  bar.className = 'title';
  const name = document.createElement('span');
  name.textContent = title;
  const btns = document.createElement('span');
  btns.className = 'x';
  for (const ch of ['_', '✕']) {
    const b = document.createElement('span');
    b.textContent = ch;
    btns.append(b);
  }
  bar.append(name, btns);

  const bd = document.createElement('div');
  bd.className = 'bd';
  if (body instanceof Node) bd.append(body);
  else bd.textContent = body;

  win.append(bar, bd);
  return win;
}
