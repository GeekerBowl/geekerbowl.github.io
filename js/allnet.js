/**
 * allnet.js — ALL.NET 服务页面（SPA 模块）
 * 依赖：spa.js 注入 token（localStorage.token）；后端 /api/allnet/*（app.js）
 * Layout 参考：官方 my-aime.net myAime 模块（Tab 三卡 + 主卡标记）
 */
(function () {
  'use strict';

  const API_BASE = 'https://api.am-all.com.cn/api';
  const GAME_LABELS = { ongeki: 'ONGEKI', chunithm: 'CHUNITHM', maimaidx: 'maimaiDX' };
  const LEVEL_LABELS = { premium: 'プレミアムコース', standard: 'スタンダードコース', free: '無料コース' };

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
      const err = new Error(data.message || 'リクエストに失敗しました');
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

  function monthsBadge(n) { return n > 1 ? `（${n} ヵ月）` : ''; }

  let CURRENT = null;      // /status 响应缓存
  let ACTIVE_TAB = 0;      // 当前卡槽 Tab（0-based）

  // ═══ 三态渲染 ═══
  function renderDenied(container) {
    container.innerHTML = `
      <div class="allnet-state">
        <i class="fas fa-lock allnet-state__icon"></i>
        <p class="allnet-state__text">アクセス権限がありません。<br>管理者にゲーム利用権限のアクティベートをご依頼ください。</p>
      </div>`;
  }

  function renderNeedBind(container) {
    container.innerHTML = `
      <div class="allnet-state">
        <i class="fas fa-id-card allnet-state__icon"></i>
        <p class="allnet-state__text">ページを閲覧するには <b>Aimeカードのバインド</b> が必要です。</p>
        <a class="btn btn-primary allnet-btn-net" href="https://net.am-all.com.cn/ongeki-mobile/aimeBind/">
          ONGEKI NET でバインドする
        </a>
      </div>`;
  }

  function renderPanel(container, d) {
    const u = d.user;
    const cards = d.cards || [];
    const m = d.membership || { course: 'free' };

    container.innerHTML = `
      <div class="allnet-grid">
        <!-- ── ① ゲーム利用権 ── -->
        <div class="allnet-card">
          <h3 class="allnet-card__title"><i class="fas fa-gamepad"></i> ゲーム利用権</h3>
          ${['ongeki', 'chunithm', 'maimai'].map(g => `
            <div class="allnet-activate-row ${u.activated[g] ? 'is-on' : 'is-off'}">
              <span class="allnet-activate-row__name">${GAME_LABELS[g]}</span>
              ${u.activated[g]
                ? '<span class="allnet-badge allnet-badge--on">アクティブ</span>'
                : '<span class="allnet-badge allnet-badge--off">未アクティブ<span class="allnet-soon">（近日公開）</span></span>'}
            </div>`).join('')}
        </div>

        <!-- ── ④ サーバー情報 ── -->
        <div class="allnet-card">
          <h3 class="allnet-card__title"><i class="fas fa-server"></i> サーバー情報</h3>
          ${u.keychips.length ? u.keychips.map(k => `
            <div class="allnet-keychip">
              <div class="allnet-keychip__label">KeyChip（${esc(k.gameServer || 'スロット ' + k.slot)}）</div>
              <code class="allnet-keychip__code" id="allnet-keychip-${k.slot}">${esc(k.keychip)}</code>
              <button class="allnet-copy" data-copy="allnet-keychip-${k.slot}">コピー</button>
            </div>`).join('')
          : '<p class="allnet-muted">アクティブな KeyChip はありません</p>'}
          <div class="allnet-keychip">
            <div class="allnet-keychip__label">segatools.ini [dns]</div>
            <code class="allnet-keychip__code">default = ${esc(d.dns)}</code>
            <button class="allnet-copy" data-copy-text="${esc(d.dns)}">コピー</button>
          </div>
          <p class="allnet-hint">segatools.ini の [keychip] serial と [dns] default に上記の値を設定してください。</p>
        </div>
      </div>

      <!-- ── ② Aime カード管理 ── -->
      <div class="allnet-card allnet-card--wide">
        <h3 class="allnet-card__title"><i class="fas fa-id-card"></i> Aime カード管理
          <span class="allnet-count">${cards.length}/3</span>
        </h3>
        ${cards.length === 0 ? '<p class="allnet-muted">バインドされたカードはありません</p>' : `
        <div class="allnet-tabs">
          ${cards.map((c, i) => `
            <button class="allnet-tab ${i === ACTIVE_TAB ? 'isActive' : ''}" data-tab="${i}">
              No.${c.slot || i + 1}${c.isPrimary ? ' ★' : ''}
            </button>`).join('')}
        </div>
        <div id="allnet-card-detail">${renderCardDetail(cards[ACTIVE_TAB] || cards[0])}</div>
        <div class="allnet-bindrow">
          <input type="text" id="allnet-bind-code" class="allnet-input" maxlength="20"
                 placeholder="20桁のAimeカード番号（サーバーで刷卡済みのカード）">
          <button class="btn btn-primary" id="allnet-bind-btn">バインド</button>
        </div>
        <p class="allnet-hint">新規バインドには、サーバー上で一度カードをタッチしてゲームデータを作成しておく必要があります。</p>`}
      </div>

      <!-- ── ③ コース（会員）── -->
      <div class="allnet-card allnet-card--wide">
        <h3 class="allnet-card__title"><i class="fas fa-crown"></i> コース（会員）</h3>
        <div class="allnet-course-state ${m.course}">
          <span class="allnet-course-state__label">${LEVEL_LABELS[m.course] || '無料コース'}</span>
          ${m.course !== 'free' && m.expire ? `<span class="allnet-course-state__expire">有効期限：${fmtDate(m.expire)}</span>` : ''}
        </div>

        <div class="allnet-shop">
          <div class="allnet-shop__row">
            <div class="allnet-shop__info">
              <b>スタンダードコース</b>
              <span>1 ポイント / 月（初回は 2 ヵ月〜）</span>
              <span class="allnet-shop__balance">所持ポイント：${u.points}</span>
            </div>
            <div class="allnet-shop__actions">
              <input type="number" id="allnet-months-s" class="allnet-input allnet-input--num" min="1" max="12"
                     value="${m.course === 'free' ? 2 : 1}">
              <span class="allnet-shop__unit">ヵ月</span>
              <button class="btn btn-primary" id="allnet-buy-s">
                ${m.course === 'free' ? '開通' : '継続'}（${ALLNET_PRICE_S()} pt/月）
              </button>
            </div>
          </div>
          <div class="allnet-shop__row ${m.course === 'free' ? 'is-disabled' : ''}">
            <div class="allnet-shop__info">
              <b>プレミアムコース</b>
              <span class="allnet-shop__append">※ スタンダードコースの追加料金（1 CREDIT / 月）</span>
              <span class="allnet-shop__balance">所持CREDIT：${u.credit}</span>
            </div>
            <div class="allnet-shop__actions">
              <input type="number" id="allnet-months-p" class="allnet-input allnet-input--num" min="1" max="12"
                     value="${m.course === 'premium' ? 1 : 2}" ${m.course === 'free' ? 'disabled' : ''}>
              <span class="allnet-shop__unit">ヵ月</span>
              <button class="btn btn-warning" id="allnet-buy-p" ${m.course === 'free' ? 'disabled' : ''}>
                ${m.course === 'premium' ? '継続' : '追加'}（1 cr/月）
              </button>
            </div>
          </div>
          ${m.course !== 'free' ? `
          <div class="allnet-shop__cancel">
            <button class="btn btn-outline-danger btn-sm" id="allnet-cancel">コース解約（両コース解除）</button>
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
          ${c.isPrimary ? '<span class="allnet-carddetail__main">メインカード</span>' : ''}
          ${c.hasArchive ? '<span class="allnet-badge allnet-badge--on">データあり</span>'
                         : '<span class="allnet-badge allnet-badge--off">データなし</span>'}
        </div>
        <div class="allnet-carddetail__code">${esc(fmtCard(c.accessCode))}</div>
        <dl class="allnet-carddetail__info">
          <dt>備考名</dt><dd>${esc(c.remark || '—')}
            <button class="allnet-mini" data-act="rename" data-id="${c.bindingId}">変更</button></dd>
          <dt>バインド日</dt><dd>${fmtDate(c.boundAt)}</dd>
          <dt>最終プレイ</dt><dd>${fmtDate(c.lastPlayDate)}</dd>
        </dl>
        <div class="allnet-carddetail__ops">
          ${c.isPrimary ? '' : `<button class="allnet-mini" data-act="primary" data-id="${c.bindingId}">メインカードに設定</button>`}
          <button class="allnet-mini allnet-mini--danger" data-act="unbind" data-id="${c.bindingId}">解綁</button>
          <button class="allnet-mini" data-act="transfer" data-id="${c.bindingId}">データ移行</button>
        </div>
        <div class="allnet-transferform" id="allnet-transfer-${c.bindingId}" style="display:none">
          <input type="text" class="allnet-input" id="allnet-transfer-code-${c.bindingId}"
                 maxlength="20" placeholder="移行先の空白カード 20 桁（未登録・データなし）">
          <button class="btn btn-sm btn-warning" data-act="transfer-go" data-id="${c.bindingId}">移行実行</button>
          <p class="allnet-hint">移行には「未登録・データなし」の空白カードが必要です。実行後、新カードで元の進捗を引き継げます。</p>
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
          setTimeout(() => { btn.textContent = 'コピー'; }, 1200);
        });
      });
    });

    bindCardOps(container, d);

    // 绑定
    const bindBtn = document.getElementById('allnet-bind-btn');
    if (bindBtn) bindBtn.addEventListener('click', async () => {
      const code = document.getElementById('allnet-bind-code').value.trim();
      if (!/^\d{20}$/.test(code)) { alert('20 桁のカード番号を入力してください'); return; }
      try {
        const r = await api('/allnet/aime/bind', { method: 'POST', body: { accessCode: code } });
        alert(r.message || 'バインド成功');
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
      if (!confirm('STANDARD と PREMIUM の両コースを解約しますか？（即時・再開通可能）')) return;
      try {
        const r = await api('/allnet/membership/cancel', { method: 'POST', body: {} });
        alert(r.message || '解約しました');
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
            if (!confirm('このカードを解綁しますか？（ゲーム内データは保持されます）')) return;
            const r = await api('/allnet/aime/unbind', { method: 'POST', body: { bindingId: id } });
            alert(r.message);
            AllnetModule.init('content-container');
          } else if (act === 'primary') {
            const r = await api('/allnet/aime/primary', { method: 'POST', body: { bindingId: id } });
            alert(r.message);
            AllnetModule.init('content-container');
          } else if (act === 'rename') {
            const name = prompt('備考名を入力（空で削除）');
            if (name === null) return;
            await api('/allnet/aime/remark', { method: 'POST', body: { bindingId: id, remark: name } });
            AllnetModule.init('content-container');
          } else if (act === 'transfer') {
            const form = document.getElementById('allnet-transfer-' + id);
            if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
          } else if (act === 'transfer-go') {
            const code = document.getElementById('allnet-transfer-code-' + id).value.trim();
            if (!/^\d{20}$/.test(code)) { alert('20 桁の空白カード番号を入力してください'); return; }
            if (!confirm(`このカードのゲームデータを新カード（...${code.slice(-4)}）に移行しますか？`)) return;
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
    const kind = level === 'standard' ? 'ポイント' : 'CREDIT';
    const unit = ALLNET_PRICE[level];
    if (months < 1) { alert('月数を入力してください'); return; }
    if (!confirm(`${label}コースを ${months} ヵ月開通/継続しますか？（${kind} ${unit * months}）`)) return;
    try {
      const r = await api('/allnet/membership/purchase', { method: 'POST', body: { level, months, game: 'ongeki' } });
      alert(r.message || '完了');
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
          container.innerHTML = '<div class="allnet-state"><p>ログインが必要です</p></div>';
          return;
        }
        container.innerHTML = `<div class="allnet-state"><p>エラー: ${esc(e.message)}</p></div>`;
      }
    },
  };
})();
