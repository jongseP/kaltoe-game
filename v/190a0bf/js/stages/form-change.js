// 양식 변경: 빈칸 5개를 적힌 번호 순서대로 채운다. 하나 채울 때마다 양식이 바뀌어 칸이 섞인다. 순서가 틀리면 hit.
const NAMES = ['성명', '소속', '직급', '사유', '연락처'];

export default {
  id: 'form-change', slot: 'morning', title: '기획안_양식.doc', tag: '💼',
  create(host, ctx) {
    host.innerHTML = '<div></div><div style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>';
    const msg = host.firstChild, box = host.lastChild;
    // 각 칸에 무작위 번호를 붙인다
    const nums = NAMES.map((_, i) => i + 1).map((n) => [ctx.rng(), n]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const fields = NAMES.map((n, i) => ({ n, num: nums[i], done: false }));
    let next = 1;
    const draw = () => {
      const order = fields.map((f) => [ctx.rng(), f]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      box.replaceChildren(...order.map((f) => {
        const b = document.createElement('button');
        b.className = 'raised bt';
        b.style.cssText = 'text-align:left;width:100%';
        b.textContent = f.done ? `${f.num}. ${f.n}: 김칼퇴` : `${f.num}. ${f.n}: ______`;
        b.disabled = f.done;
        b.addEventListener('click', () => {
          if (f.num !== next) { msg.textContent = `⚠ ${next}번부터 쓰라고 했잖아요`; return ctx.hit(); }
          f.done = true;
          if (ctx.goal(++next - 1, NAMES.length)) return ctx.clear();
          msg.textContent = '⚠ 양식이 바뀌었습니다 (v' + (next + 1) + ')';
          draw();
        });
        return b;
      }));
    };
    msg.textContent = '번호 순서대로 채우세요';
    draw();
    return { pause() {}, resume() {}, destroy() { host.replaceChildren(); } };
  },
};
