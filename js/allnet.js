/**
 * allnet.js — ALL.NET 服务页面（SPA 模块）
 * 依赖：spa.js 注入 token（localStorage.token）；后端 /api/allnet/*（app.js）
 * Layout：与新站 AllnetPage 统一（768px 宽度 + 3 卡槽 Tab 制 + 官方 my-aime 卡信息格式）
 */
(function () {
  'use strict';

  const API_BASE = 'https://api.am-all.com.cn/api';
  const GAME_LABELS = { ongeki: 'ONGEKI', chunithm: 'CHUNITHM', maimai: 'maimaiDX' };
  const LEVEL_LABELS = { premium: 'ONGEKI PREMIUM 会员', standard: 'STANDARD 会员', free: '免费' };
  const currencyLabel=k=>k==='credit'?'CREDIT':'普通积分';

  function messageBox(message, title = 'Performai 会员说明', confirm = false) {
    return new Promise(resolve => {
      const previous = document.activeElement, overflow = document.body.style.overflow;
      const overlay = document.createElement('div');
      overlay.className = 'allnet-message-overlay';
      overlay.innerHTML = `<section class="allnet-message-box" role="dialog" aria-modal="true" aria-labelledby="allnet-message-title"><header><h3 id="allnet-message-title">${esc(title)}</h3><button type="button" class="allnet-message-close" aria-label="关闭">×</button></header><div class="allnet-message-content">${esc(message).replace(/\n/g, '<br>')}</div><footer>${confirm ? '<button type="button" class="allnet-message-cancel">取消</button>' : ''}<button type="button" class="allnet-message-confirm">确定</button></footer></section>`;
      let settled = false;
      const close = value => {
        if (settled) return; settled = true;
        document.removeEventListener('keydown', keydown);
        overlay.remove(); document.body.style.overflow = overflow;
        if (previous?.isConnected) previous.focus(); resolve(value);
      };
      const keydown = event => {
        if (event.key === 'Escape') { event.preventDefault(); close(false); }
        if (event.key === 'Tab') {
          const buttons = [...overlay.querySelectorAll('button')];
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      };
      overlay.querySelector('.allnet-message-close').onclick = () => close(false);
      overlay.querySelector('.allnet-message-cancel')?.addEventListener('click', () => close(false));
      overlay.querySelector('.allnet-message-confirm').onclick = () => close(true);
      overlay.addEventListener('click', event => { if (event.target === overlay) close(false); });
      document.body.append(overlay); document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', keydown);
      overlay.querySelector('.allnet-message-confirm').focus();
    });
  }

  function getToken() { return localStorage.getItem('token') || ''; }

  async function api(path, opts = {}) {
    const res = await fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken(),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      const err = new Error(data.message || data.error || '请求失败');
      err.code = data.code;
      throw err;
    }
    return data;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtCard(code) {
    return code ? code.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4 $5') : '—';
  }

  function fmtDate(d) {
    if (!d) return '—';
    return String(d).replace('T', ' ').substring(0, 16);
  }

  // 官方 my-aime 风格日期：2026年 10月 02日 07:13（字符串映射，不做时区转换）
  function fmtDateJP(d) {
    if (!d) return '—';
    const s = String(d).replace('T', ' ').substring(0, 16);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
    return m ? `${m[1]}年 ${m[2]}月 ${m[3]}日 ${m[4]}:${m[5]}` : s;
  }

  // 3 个固定卡槽：已绑卡按 slot 归位，无 slot / 冲突卡按顺序填空槽
  function buildSlots(cards) {
    const slots = [null, null, null];
    const rest = [];
    for (const c of cards) {
      const idx = (c.slot && c.slot >= 1 && c.slot <= 3) ? c.slot - 1 : -1;
      if (idx >= 0 && !slots[idx]) slots[idx] = c; else rest.push(c);
    }
    for (const c of rest) {
      const i = slots.indexOf(null);
      if (i >= 0) slots[i] = c;
    }
    return slots;
  }

  let CURRENT = null;      // /status 响应缓存
  let ACTIVE_SLOT = 0;     // 当前卡槽（0-2 固定三槽）
  let REMARK_OPEN = false; // 备注名折叠状态

  // ═══ 三态渲染 ═══
  function renderDenied(container) {
    container.innerHTML = `
      <div class="allnet-state">
        <i class="fas fa-lock allnet-state__icon"></i>
        <p class="allnet-state__text">暂无访问权限。<br>请联系管理员激活游戏使用权。</p>
      </div>`;
  }

  // ═══ 卡槽面板（已绑卡：官方 my-aime 格式；空槽：绑定表单） ═══
  function renderSlotPanel(card, slotIndex) {
    if (card) {
      return `
        <div class="allnet-carddetail">
          <div class="allnet-carddetail__head">
            <span class="allnet-carddetail__no">No.${card.slot || (slotIndex + 1)}</span>
            ${card.isPrimary ? '<span class="allnet-carddetail__main">主卡</span>' : ''}
            ${card.hasArchive ? '<span class="allnet-badge allnet-badge--on">有游戏档案</span>'
                               : '<span class="allnet-badge allnet-badge--off">无档案</span>'}
          </div>
          <div class="allnet-aimeinfo">
            <div class="allnet-aimeinfo__row">
              <div class="allnet-aimeinfo__label">アクセスコード</div>
              <div class="allnet-aimeinfo__code">${esc(fmtCard(card.accessCode))}</div>
            </div>
            <div class="allnet-aimeinfo__row">
              <div class="allnet-aimeinfo__label">登録日</div>
              <div class="allnet-aimeinfo__value">${esc(fmtDateJP(card.boundAt))}</div>
            </div>
            <div class="allnet-aimeinfo__row">
              <div class="allnet-aimeinfo__label">最後にプレイしたゲーム</div>
              <div class="allnet-aimeinfo__value">${esc(card.lastGameName || '—')}</div>
              ${card.lastPlayDate ? `<div class="allnet-aimeinfo__sub">(${esc(fmtDateJP(card.lastPlayDate))})</div>` : ''}
            </div>
            <div class="allnet-aimeinfo__row"><div class="allnet-aimeinfo__label">最後にプレイした場所</div><div class="allnet-aimeinfo__value">${esc(card.lastPlaceName||'—')}</div></div>
          </div>
          <div class="allnet-remark">
            <button type="button" class="allnet-remark__toggle" data-act="remark-toggle">
              <span>修改备注名${card.remark ? `<em>${esc(card.remark)}</em>` : ''}</span><i>▼</i>
            </button>
            <div class="allnet-remark__body" id="allnet-remark-body" style="display:none">
              <input type="text" id="allnet-remark-input" maxlength="12"
                     placeholder="输入备注名（留空清除）" value="${esc(card.remark || '')}">
              <div class="allnet-remark__btns">
                <button type="button" class="allnet-btn allnet-btn--sm" data-act="remark-ok" data-id="${card.bindingId}">确定</button>
                <button type="button" class="allnet-btn allnet-btn--ghost allnet-btn--sm" data-act="remark-cancel">取消</button>
              </div>
            </div>
          </div>
          <div class="allnet-carddetail__ops">
            ${card.isPrimary ? '' : `<button type="button" class="allnet-mini" data-act="primary" data-id="${card.bindingId}">设为主卡</button>`}
            <button type="button" class="allnet-mini" data-act="transfer" data-id="${card.bindingId}">数据转移</button>
            <button type="button" class="allnet-mini allnet-mini--danger" data-act="unbind" data-id="${card.bindingId}">解绑</button>
          </div>
          <div class="allnet-transferform" id="allnet-transfer-${card.bindingId}" style="display:none">
            <input type="text" class="allnet-input" id="allnet-transfer-code-${card.bindingId}"
                   maxlength="20" placeholder="转移目标空白卡 20 位（未注册、无档案）">
            <button type="button" class="allnet-btn allnet-btn--amber allnet-btn--sm" data-act="transfer-go" data-id="${card.bindingId}">执行转移</button>
            <p class="allnet-hint">需要一张「未注册、无档案」的空白卡。执行后，新卡将继承原进度。</p>
          </div>
        </div>`;
    }
    return `
      <div class="allnet-emptyslot">
        <p class="allnet-emptyslot__title">卡槽 No.${slotIndex + 1} 未绑定卡片</p>
        <div class="allnet-bindrow">
          <input type="text" id="allnet-bind-code" class="allnet-input" maxlength="20"
                 placeholder="20 位 Aime 卡号（已在服务器刷卡建档）">
          <button type="button" class="allnet-btn" id="allnet-bind-btn">绑定</button>
        </div>
        <p class="allnet-hint">绑定前需先在服务器机台刷卡建档（有游玩数据才能绑定）；解绑不会删除游戏档案。</p>
      </div>`;
  }

  function renderPanel(container, d) {
    REMARK_OPEN = false;
    const u = d.user;
    const access=d.access||{role:'general',homeEnabled:true,shop:null},fees=d.fees||{standard:{currency:'points',amount:1},premium:{currency:'credit',amount:1}};
    const cards = d.cards || [];
    const m = d.membership || { course: 'free' };
    const slots = buildSlots(cards);
    // 主卡槽优先展开
    const pi = slots.findIndex(c => c && c.isPrimary);
    ACTIVE_SLOT = pi >= 0 ? pi : 0;

    container.innerHTML = `
      <div class="allnet-wrap">
        <div class="allnet-grid">
          <!-- ── ① 游戏使用权 ── -->
          <div class="allnet-card">
            <h3 class="allnet-card__title"><i class="fas fa-gamepad"></i> 游戏使用权</h3>
            ${['ongeki', 'chunithm', 'maimai'].map(g => `
              <div class="allnet-activate-row ${u.activated[g] ? 'is-on' : 'is-off'}">
                <span class="allnet-activate-row__name">${GAME_LABELS[g]}</span>
                ${u.activated[g]
                  ? '<span class="allnet-badge allnet-badge--on">已激活</span>'
                  : '<span class="allnet-badge allnet-badge--off">未开通<span class="allnet-soon">（敬请期待）</span></span>'}
              </div>`).join('')}
          </div>

          ${!['ongeki','chunithm','maimai'].some(g=>u.activated[g])?`<div class="allnet-card"><h3 class="allnet-card__title">NET 与游戏利用权激活</h3><form class="allnet-code-form" data-path="/allnet/activate"><input class="allnet-input" name="code" maxlength="64" required placeholder="NET 利用权激活码"><button class="allnet-btn">激活</button></form></div>`:''}
          ${access.role==='visitor'&&!access.homeEnabled?`<div class="allnet-card"><h3 class="allnet-card__title">家用利用权激活</h3><p class="allnet-hint">输入一般用户激活码获取家用 KEYCHIP。</p><form class="allnet-code-form" data-path="/allnet/activate-home"><input class="allnet-input" name="code" maxlength="64" required placeholder="一般用户激活码（NETG）"><button class="allnet-btn">激活家用</button></form></div>`:''}
          <!-- ── ④ 服务器信息 ── -->
          ${access.homeEnabled&&['ongeki','chunithm','maimai'].some(g=>u.activated[g])?`
          <div class="allnet-card">
            <h3 class="allnet-card__title"><i class="fas fa-server"></i> 服务器信息</h3>
            ${u.keychips.length ? u.keychips.map(k => `
              <div class="allnet-keychip">
                <div class="allnet-keychip__label">${esc(GAME_LABELS[k.game] || k.game)} 完整 KEYCHIP ID</div>
                <code class="allnet-keychip__code" id="allnet-keychip-${esc(k.game)}">${esc(k.keychipId)}</code>
                <button type="button" class="allnet-copy" data-copy="allnet-keychip-${esc(k.game)}">复制</button>
              </div>`).join('')
            : '<p class="allnet-muted">暂无激活生成的 KEYCHIP</p>'}
            <div class="allnet-keychip">
              <div class="allnet-keychip__label">segatools.ini [dns]</div>
              <code class="allnet-keychip__code">default = ${esc(d.dns)}</code>
              <button type="button" class="allnet-copy" data-copy-text="${esc(d.dns)}">复制</button>
            </div>
            <p class="allnet-hint">将 [keychip] serial 设为上方 KEYCHIP ID、[dns] default 设为上方服务器地址，即可配置 segatools.ini。</p>
          </div>`:''}
          ${access.shop?`<div class="allnet-card allnet-card--wide"><h3 class="allnet-card__title">店铺信息</h3><p>${esc(access.shop.name)}</p><p class="allnet-hint">已游玩玩家数：${Number(access.shop.playerCount)}（按 Aime 卡去重）</p></div>`:''}
        </div>

        <!-- ── ② Aime 卡管理（3 卡槽 Tab 制） ── -->
        <div class="allnet-card allnet-card--wide">
          <h3 class="allnet-card__title"><i class="fas fa-id-card"></i> Aime 卡管理
            <span class="allnet-count">${cards.length}/3</span>
          </h3>
          <div class="allnet-tabs">
            ${slots.map((s, i) => `
              <button type="button" class="allnet-tab ${i === ACTIVE_SLOT ? 'isActive' : ''}" data-slot="${i}">
                No.${i + 1}${s && s.isPrimary ? ' ★' : ''}${!s ? '<small>（空）</small>' : ''}
              </button>`).join('')}
          </div>
          <div id="allnet-card-detail">${renderSlotPanel(slots[ACTIVE_SLOT], ACTIVE_SLOT)}</div>
        </div>

        <!-- ── ③ 会员管理 ── -->
        <div class="allnet-card allnet-card--wide">
          <h3 class="allnet-card__title"><i class="fas fa-crown"></i> Performai会员 <button type="button" class="allnet-btn allnet-btn--sm" id="allnet-help" aria-label="会员说明">?</button></h3>
          <div class="allnet-course-state ${m.course}">
            <span class="allnet-course-state__label">${LEVEL_LABELS[m.course] || '免费'}</span>
            ${m.course !== 'free' && m.expire ? `<span class="allnet-course-state__expire">有效期至：${fmtDate(m.expire)}</span>` : ''}
          </div>

          <div class="allnet-shop">
            <div class="allnet-shop__row">
              <div class="allnet-shop__info">
                <b>STANDARD 会员</b>
                <span>${fees.standard.amount} ${currencyLabel(fees.standard.currency)} / 月（首次开通 2 个月起）</span>
                <span class="allnet-shop__balance">持有${currencyLabel(fees.standard.currency)}：${fees.standard.currency==='credit'?u.credit:u.points}</span>
              </div>
              <div class="allnet-shop__actions">
                <input type="number" id="allnet-months-s" class="allnet-input allnet-input--num" min="1" max="12"
                       value="${m.course === 'free' ? 2 : 1}">
                <span class="allnet-shop__unit">个月</span>
                <button type="button" class="allnet-btn" id="allnet-buy-s">
                  ${m.course === 'free' ? '开通' : '续费'}
                </button>
              </div>
            </div>
            <div class="allnet-shop__row ${m.course === 'free' ? 'is-disabled' : ''}">
              <div class="allnet-shop__info">
                <b>ONGEKI PREMIUM 会员</b>
                <span class="allnet-shop__append">※ STANDARD 会员的追加费用（${fees.premium.amount} ${currencyLabel(fees.premium.currency)} / 月）</span>
                <span class="allnet-shop__balance">持有${currencyLabel(fees.premium.currency)}：${fees.premium.currency==='credit'?u.credit:u.points}</span>
              </div>
              <div class="allnet-shop__actions">
                <input type="number" id="allnet-months-p" class="allnet-input allnet-input--num" min="${m.course === 'premium' ? 1 : 2}" max="12"
                       value="${m.course === 'premium' ? 1 : 2}" ${m.course === 'free' ? 'disabled' : ''}>
                <span class="allnet-shop__unit">个月</span>
                <button type="button" class="allnet-btn allnet-btn--amber" id="allnet-buy-p" ${m.course === 'free' ? 'disabled' : ''}>
                  ${m.course === 'free' ? '追加' : (m.course === 'premium' ? '续费' : '追加')}
                </button>
              </div>
            </div>
            ${m.course !== 'free' ? `
            <div class="allnet-shop__cancel">
              <button type="button" class="allnet-btn allnet-btn--danger allnet-btn--sm" id="allnet-cancel">解约会员（两档同时解除）</button>
            </div>` : ''}
          </div>
        </div>
        ${window.AllnetSaveImport?window.AllnetSaveImport.render(cards,!!u.activated.ongeki):''}
      </div>
    `;

    bindPanelEvents(container, d, slots);
    window.AllnetSaveImport?.bind(container,messageBox);
  }

  // ═══ 事件绑定 ═══
  function bindPanelEvents(container, d, slots) {
    container.querySelector('#allnet-help')?.addEventListener('click',()=>messageBox('STANDARD 通用于 CHUNITHM、maimai DX 和 ONGEKI。\nONGEKI PREMIUM 是 ONGEKI 专用追加档，需有效 STANDARD。\n会费按当前设置收取，购买前确认总费用；到期自动续费。追加档无法续费时，有效 STANDARD 可继续使用。解约立即生效，可重新开通。'));
    container.querySelectorAll('.allnet-code-form').forEach(form=>form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('button');button.disabled=true;try{const r=await api(form.dataset.path,{method:'POST',body:{code:form.elements.code.value.trim()}});alert(r.message);await AllnetModule.init('content-container');}catch(err){alert(err.message);}finally{button.disabled=false;}}));
    // 卡槽 Tab 切换
    container.querySelectorAll('.allnet-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.allnet-tab').forEach(b => b.classList.remove('isActive'));
        btn.classList.add('isActive');
        ACTIVE_SLOT = parseInt(btn.dataset.slot, 10) || 0;
        REMARK_OPEN = false;
        document.getElementById('allnet-card-detail').innerHTML =
          renderSlotPanel(slots[ACTIVE_SLOT], ACTIVE_SLOT);
        bindCardOps(container, d, slots);
      });
    });

    // 复制按钮
    container.querySelectorAll('.allnet-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = document.getElementById(btn.dataset.copy);
        const text = btn.dataset.copyText || (el ? el.textContent : '');
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '済';
          setTimeout(() => { btn.textContent = '复制'; }, 1200);
        });
      });
    });

    bindCardOps(container, d, slots);

    // 绑定（空槽内）
    const bindBtn = document.getElementById('allnet-bind-btn');
    if (bindBtn) bindBtn.addEventListener('click', async () => {
      const code = document.getElementById('allnet-bind-code').value.trim();
      if (!/^\d{20}$/.test(code)) { alert('请输入 20 位卡号'); return; }
      try {
        const r = await api('/allnet/aime/bind', { method: 'POST', body: { accessCode: code } });
        alert(r.message || '绑定成功');
        AllnetModule.init('content-container');
      } catch (e) { alert(e.message); }
    });

    // 购买
    const buyS = document.getElementById('allnet-buy-s');
    if (buyS) buyS.addEventListener('click', () => doPurchase('standard'));
    const buyP = document.getElementById('allnet-buy-p');
    if (buyP) buyP.addEventListener('click', () => doPurchase('premium'));

    // 解约
    const cancelBtn = document.getElementById('allnet-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', async () => {
      if (!confirm('确定解约 STANDARD 和 PREMIUM 两档会员吗？（立即生效，可重新开通）')) return;
      try {
        const r = await api('/allnet/membership/cancel', { method: 'POST', body: {} });
        alert(r.message || '已解约');
        AllnetModule.init('content-container');
      } catch (e) { alert(e.message); }
    });
  }

  function bindCardOps(container, d, slots) {
    const card = slots[ACTIVE_SLOT];

    // 备注名折叠（官方下拉折叠方式）
    const toggleBtn = container.querySelector('.allnet-remark__toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => {
      const body = document.getElementById('allnet-remark-body');
      if (!body) return;
      REMARK_OPEN = !REMARK_OPEN;
      body.style.display = REMARK_OPEN ? 'block' : 'none';
      toggleBtn.querySelector('i').textContent = REMARK_OPEN ? '▲' : '▼';
    });
    const remarkOk = container.querySelector('[data-act="remark-ok"]');
    if (remarkOk) remarkOk.addEventListener('click', async () => {
      const name = (document.getElementById('allnet-remark-input').value || '').trim();
      try {
        await api('/allnet/aime/remark', { method: 'POST', body: { bindingId: card.bindingId, remark: name } });
        AllnetModule.init('content-container');
      } catch (e) { alert(e.message); }
    });
    const remarkCancel = container.querySelector('[data-act="remark-cancel"]');
    if (remarkCancel) remarkCancel.addEventListener('click', () => {
      REMARK_OPEN = false;
      const body = document.getElementById('allnet-remark-body');
      if (body) body.style.display = 'none';
      const t = container.querySelector('.allnet-remark__toggle i');
      if (t) t.textContent = '▼';
    });

    // 卡操作按钮
    container.querySelectorAll('.allnet-mini[data-act]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id, 10);
        const act = btn.dataset.act;
        try {
          if (act === 'unbind') {
            if (!confirm('确定解绑这张卡吗？（游戏数据将保留）')) return;
            const r = await api('/allnet/aime/unbind', { method: 'POST', body: { bindingId: id } });
            alert(r.message);
            AllnetModule.init('content-container');
          } else if (act === 'primary') {
            const r = await api('/allnet/aime/primary', { method: 'POST', body: { bindingId: id } });
            alert(r.message);
            AllnetModule.init('content-container');
          } else if (act === 'transfer') {
            const form = document.getElementById('allnet-transfer-' + id);
            if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
          } else if (act === 'transfer-go') {
            const code = document.getElementById('allnet-transfer-code-' + id).value.trim();
            if (!/^\d{20}$/.test(code)) { alert('请输入 20 位空白卡号'); return; }
            if (!confirm(`确定将这张卡的游戏数据转移到新卡（...${code.slice(-4)}）吗？`)) return;
            const r = await api('/allnet/aime/transfer', { method: 'POST', body: { bindingId: id, newAccessCode: code } });
            alert(r.message);
            AllnetModule.init('content-container');
          }
        } catch (e) { alert(e.message); }
      });
    });
  }

  async function doPurchase(level) {
    const input = document.getElementById(level === 'standard' ? 'allnet-months-s' : 'allnet-months-p');
    const months = parseInt(input.value, 10) || 0;
    if (months < 1) { alert('请输入月数'); return; }
    try {
      const quote=await api('/allnet/membership/quote',{method:'POST',body:{level,months}});
      const cost=Object.entries(quote.cost).filter(([,v])=>v>0).map(([k,v])=>`${v} ${currencyLabel(k)}`).join(' + ')||'免费';
      if(!await messageBox(`开通/续费 ${level==='standard'?'STANDARD':'ONGEKI PREMIUM'} ${months}个月，费用：${cost}${quote.standardExtraMonths?`（含 STANDARD 补齐${quote.standardExtraMonths}个月）`:''}？`, '确认会员费用', true))return;
      const r=await api('/allnet/membership/purchase',{method:'POST',body:{level,months,expectedCost:quote.cost}});
      alert(r.message || '完成');
      AllnetModule.init('content-container');
    } catch (e) { alert(e.message); }
  }

  // ═══ 模块入口 ═══
  window.AllnetModule = {
    async init(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      try {
        const d = await api('/allnet/status');
        CURRENT = d;
        const u = d.user || {};
        // banState 1/2 → 入口已隐藏，双保险
        if (u.banState === 1 || u.banState === 2) { renderDenied(container); return; }
        const activated = u.activated || {};

        // 0 卡也进 panel：3 个空槽直接提供绑定表单
        renderPanel(container, d);
      } catch (e) {
        if (e.code === 'NO_TOKEN') {
          container.innerHTML = '<div class="allnet-state"><p>请先登录</p></div>';
          return;
        }
        container.innerHTML = `<div class="allnet-state"><p>错误: ${esc(e.message)}</p></div>`;
      }
    },
  };
})();
