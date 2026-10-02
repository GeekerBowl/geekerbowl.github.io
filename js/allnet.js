/**
 * allnet.js — ALL.NET 服务页面（SPA 模块）
 * 依赖：spa.js 注入 token（localStorage.token）；后端 /api/allnet/*（app.js）
 * Layout 参考：官方 my-aime.net myAime 模块（Tab 三卡 + 主卡标记）
 */
(function () {
  'use strict';

  const API_BASE = 'https://api.am-all.com.cn/api';
  const GAME_LABELS = { ongeki: 'ONGEKI', chunithm: 'CHUNITHM', maimai: 'maimaiDX' };
  const LEVEL_LABELS = { premium: 'PREMIUM 会员', standard: 'STANDARD 会员', free: '免费' };
  const ALLNET_PRICE = { standard: 1, premium: 1 };  // 每月单价（与后端 ALLNET_PRICE 一致）

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
      const err = new Error(data.message || '请求失败');
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

  function monthsBadge(n) { return n > 1 ? `（${n} 个月）` : ''; }

  let CURRENT = null;      // /status 响应缓存
  let ACTIVE_TAB = 0;      // 当前卡槽 Tab（0-based）

  // ═══ 三态渲染 ═══
  function renderDenied(container) {
    container.innerHTML = `
      <div class="allnet-state">
        <i class="fas fa-lock allnet-state__icon"></i>
        <p class="allnet-state__text">暂无访问权限。<br>请联系管理员激活游戏使用权。</p>
      </div>`;
  }

  function renderNeedBind(container) {
    container.innerHTML = `
      <div class="allnet-state">
        <i class="fas fa-id-card allnet-state__icon"></i>
        <p class="allnet-state__text">浏览本页面需要先 <b>绑定 Aime 卡</b>。</p>
        <a class="btn btn-primary allnet-btn-net" href="https://net.am-all.com.cn/ongeki-mobile/aimeBind/">
          前往 ONGEKI NET 绑定
        </a>
      </div>`;
  }

  function renderPanel(container, d) {
    const u = d.user;
    const cards = d.cards || [];
    const m = d.membership || { course: 'free' };

    container.innerHTML = `
      <div class="allnet-grid">
        <!-- ── ① 游戏使用权 ── -->
        <div class="allnet-card">
          <h3 class="allnet-card__title"><i class="fas fa-gamepad"></i> 游戏使用权</h3>
          ${['ongeki', 'chunithm', 'maimai'].map(g => `
            <div class="allnet-activate-row ${u.activated[g] ? 'is-on' : 'is-off'}">
              <span class="allnet-activate-row__name">${GAME_LABELS[g]}</span>
              ${u.activated[g]
                ? '<span class="allnet-badge allnet-badge--on">已激活</span>'
                : '<span class="allnet-badge allnet-badge--off">未已激活<span class="allnet-soon">（近日公開）</span></span>'}
            </div>`).join('')}
        </div>

        <!-- ── ④ 服务器信息 ── -->
        <div class="allnet-card">
          <h3 class="allnet-card__title"><i class="fas fa-server"></i> 服务器信息</h3>
          ${u.keychips.length ? u.keychips.map(k => `
            <div class="allnet-keychip">
              <div class="allnet-keychip__label">${esc(GAME_LABELS[k.game] || k.game)} 完整 KEYCHIP ID</div>
              <code class="allnet-keychip__code" id="allnet-keychip-${esc(k.game)}">${esc(k.keychipId)}</code>
              <button class="allnet-copy" data-copy="allnet-keychip-${esc(k.game)}">复制</button>
            </div>`).join('')
          : '<p class="allnet-muted">暂无激活生成的 KEYCHIP</p>'}
          <div class="allnet-keychip">
            <div class="allnet-keychip__label">segatools.ini [dns]</div>
            <code class="allnet-keychip__code">default = ${esc(d.dns)}</code>
            <button class="allnet-copy" data-copy-text="${esc(d.dns)}">复制</button>
          </div>
          <p class="allnet-hint">将 [keychip] serial 设为上方 KEYCHIP ID、[dns] default 设为上方服务器地址，即可配置 segatools.ini。</p>
        </div>
      </div>

      <!-- ── ② Aime 卡管理 ── -->
      <div class="allnet-card allnet-card--wide">
        <h3 class="allnet-card__title"><i class="fas fa-id-card"></i> Aime 卡管理
          <span class="allnet-count">${cards.length}/3</span>
        </h3>
        ${cards.length === 0 ? '<p class="allnet-muted">尚未绑定任何 Aime 卡</p>' : `
        <div class="allnet-tabs">
          ${cards.map((c, i) => `
            <button class="allnet-tab ${i === ACTIVE_TAB ? 'isActive' : ''}" data-tab="${i}">
              No.${c.slot || i + 1}${c.isPrimary ? ' ★' : ''}
            </button>`).join('')}
        </div>
        <div id="allnet-card-detail">${renderCardDetail(cards[ACTIVE_TAB] || cards[0])}</div>
        <div class="allnet-bindrow">
          <input type="text" id="allnet-bind-code" class="allnet-input" maxlength="20"
                 placeholder="20 位 Aime 卡号（已在服务器刷卡建档）">
          <button class="btn btn-primary" id="allnet-bind-btn">绑定</button>
        </div>
        <p class="allnet-hint">绑定前需先在服务器机台刷卡建档（有游玩数据才能绑定）。</p>`}
      </div>

      <!-- ── ③ 会员管理── -->
      <div class="allnet-card allnet-card--wide">
        <h3 class="allnet-card__title"><i class="fas fa-crown"></i> 会员管理</h3>
        <div class="allnet-course-state ${m.course}">
          <span class="allnet-course-state__label">${LEVEL_LABELS[m.course] || '免费'}</span>
          ${m.course !== 'free' && m.expire ? `<span class="allnet-course-state__expire">有效期至：${fmtDate(m.expire)}</span>` : ''}
        </div>

        <div class="allnet-shop">
          <div class="allnet-shop__row">
            <div class="allnet-shop__info">
              <b>STANDARD 会员</b>
              <span>1 积分 / 月（首次开通 2 个月起）</span>
              <span class="allnet-shop__balance">持有积分：${u.points}</span>
            </div>
            <div class="allnet-shop__actions">
              <input type="number" id="allnet-months-s" class="allnet-input allnet-input--num" min="1" max="12"
                     value="${m.course === 'free' ? 2 : 1}">
              <span class="allnet-shop__unit">个月</span>
              <button class="btn btn-primary" id="allnet-buy-s">
                ${m.course === 'free' ? '开通' : '续费'}（${ALLNET_PRICE_S()} 积分/月）
              </button>
            </div>
          </div>
          <div class="allnet-shop__row ${m.course === 'free' ? 'is-disabled' : ''}">
            <div class="allnet-shop__info">
              <b>PREMIUM 会员</b>
              <span class="allnet-shop__append">※ STANDARD 会员的追加费用（1 CREDIT / 月）</span>
              <span class="allnet-shop__balance">持有 CREDIT：${u.credit}</span>
            </div>
            <div class="allnet-shop__actions">
              <input type="number" id="allnet-months-p" class="allnet-input allnet-input--num" min="1" max="12"
                     value="${m.course === 'premium' ? 1 : 2}" ${m.course === 'free' ? 'disabled' : ''}>
              <span class="allnet-shop__unit">个月</span>
              <button class="btn btn-warning" id="allnet-buy-p" ${m.course === 'free' ? 'disabled' : ''}>
                ${m.course === 'premium' ? '续费' : '追加'}（1 CREDIT/月）
              </button>
            </div>
          </div>
          ${m.course !== 'free' ? `
          <div class="allnet-shop__cancel">
            <button class="btn btn-outline-danger btn-sm" id="allnet-cancel">解约会员（两档同时解除）</button>
          </div>` : ''}
        </div>
      </div>
    `;

    bindPanelEvents(container, d);
  }

  function ALLNET_PRICE_S() { return 1; }

  function renderCardDetail(c) {
    if (!c) return '';
    return `
      <div class="allnet-carddetail">
        <div class="allnet-carddetail__head">
          <span class="allnet-carddetail__no">No.${c.slot || '—'}</span>
          ${c.isPrimary ? '<span class="allnet-carddetail__main">主卡</span>' : ''}
          ${c.hasArchive ? '<span class="allnet-badge allnet-badge--on">有档案</span>'
                         : '<span class="allnet-badge allnet-badge--off">无档案</span>'}
        </div>
        <div class="allnet-carddetail__code">${esc(fmtCard(c.accessCode))}</div>
        <dl class="allnet-carddetail__info">
          <dt>备注名</dt><dd>${esc(c.remark || '—')}
            <button class="allnet-mini" data-act="rename" data-id="${c.bindingId}">修改</button></dd>
          <dt>绑定时间</dt><dd>${fmtDate(c.boundAt)}</dd>
          <dt>最后游玩</dt><dd>${fmtDate(c.lastPlayDate)}</dd>
        </dl>
        <div class="allnet-carddetail__ops">
          ${c.isPrimary ? '' : `<button class="allnet-mini" data-act="primary" data-id="${c.bindingId}">设为主卡</button>`}
          <button class="allnet-mini allnet-mini--danger" data-act="unbind" data-id="${c.bindingId}">解绑</button>
          <button class="allnet-mini" data-act="transfer" data-id="${c.bindingId}">数据转移</button>
        </div>
        <div class="allnet-transferform" id="allnet-transfer-${c.bindingId}" style="display:none">
          <input type="text" class="allnet-input" id="allnet-transfer-code-${c.bindingId}"
                 maxlength="20" placeholder="转移目标空白卡 20 位（未注册、无档案）">
          <button class="btn btn-sm btn-warning" data-act="transfer-go" data-id="${c.bindingId}">执行转移</button>
          <p class="allnet-hint">需要一张「未注册、无档案」的空白卡。执行后，新卡将继承原进度。</p>
        </div>
      </div>`;
  }

  // ═══ 事件绑定 ═══
  function bindPanelEvents(container, d) {
    // Tab 切换
    container.querySelectorAll('.allnet-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.allnet-tab').forEach(b => b.classList.remove('isActive'));
        btn.classList.add('isActive');
        ACTIVE_TAB = parseInt(btn.dataset.tab, 10) || 0;
        const cards = d.cards || [];
        document.getElementById('allnet-card-detail').innerHTML = renderCardDetail(cards[ACTIVE_TAB]);
        bindCardOps(container, d);
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

    bindCardOps(container, d);

    // 绑定
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

  function bindCardOps(container, d) {
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
          } else if (act === 'rename') {
            const name = prompt('请输入备注名（留空删除）');
            if (name === null) return;
            await api('/allnet/aime/remark', { method: 'POST', body: { bindingId: id, remark: name } });
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
    const label = level === 'standard' ? 'STANDARD' : 'PREMIUM';
    const kind = level === 'standard' ? '积分' : 'CREDIT';
    const unit = ALLNET_PRICE[level];
    if (months < 1) { alert('请输入月数'); return; }
    if (!confirm(`确定开通/续费 ${label} 会员 ${months} 个月吗？（${kind} ${unit * months}）`)) return;
    try {
      const r = await api('/allnet/membership/purchase', { method: 'POST', body: { level, months, game: 'ongeki' } });
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
        if (!activated.ongeki && !activated.chunithm && !activated.maimai) {
          renderDenied(container); return;
        }
        if ((d.cards || []).length === 0) { renderNeedBind(container); return; }
        ACTIVE_TAB = 0;
        // 主卡 tab 优先展开
        const pi = (d.cards || []).findIndex(c => c.isPrimary);
        if (pi > 0) ACTIVE_TAB = pi;
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
