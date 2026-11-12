// 양식 변경: 빈칸 3개를 채우면 "양식이 바뀌었습니다"가 한 번 뜨고 칸이 섞인다. 새 양식은 번호 순서대로 눌러야 하고 틀리면 hit.
const NAMES = ['성명', '소속', '사유'];

export default {
  id: 'form-change', slot: 'morning', title: '기획안_양식.doc', tag: '💼',
  create(host, ctx) {
    host.innerHTML = '<div></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>';
    const msg = host.firstChild, box = host.lastChild;
    let phase = 1, filled = 0, next = 1, order = NAMES.map((n, i) => ({ n, i }));
    const draw = () => {
      box.replaceChildren(...order.map(({ n, i }) => {
        const b = document.createElement('button');
        b.className = 'raised bt';
        b.style.cssText = 'text-align:left;width:100%';
        b.textContent = `${phase === 2 ? `${i + 1}. ` : ''}${n}: ______`;
        b.addEventListener('click', () => {
          if (b.dataset.done) return;
          if (phase === 2 && i + 1 !== next) return ctx.hit();
          b.dataset.done = 1; b.textContent = `${n}: 김칼퇴`;
          if (phase === 1) {
            if (++filled < 3) return;
            phase = 2; next = 1;
            order = order.map((o) => [ctx.rng(), o]).sort((a, c) => a[0] - c[0]).map((x) => x[1]);
            msg.textContent = '⚠ 양식이 바뀌었습니다. 번호 순서대로 다시 입력하세요';
            draw();
          } else if (++next > 3) ctx.clear();
        });
        return b;
      }));
    };
    msg.textContent = '빈칸을 모두 채우세요';
    draw();
    return { pause() {}, resume() {}, destroy() { host.replaceChildren(); } };
  },
};
