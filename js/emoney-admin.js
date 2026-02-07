(function (global) {
  'use strict';

  if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://api.am-all.com.cn';
  }
  const API_BASE_URL = window.API_BASE_URL;

  function ensureAdmin(pageId) {
    const token = localStorage.getItem('token');
    if (!token) { showLoginRequired(pageId || 'emoney-admin'); return false; }

    // 从 localStorage userInfo 获取用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      showErrorMessage('无法获取用户信息，请重新登录');
      loadPage('home');
      return false;
    }

    let userInfo;
    try {
      userInfo = JSON.parse(userInfoStr);
    } catch (e) {
      console.error('解析用户信息失败:', e);
      showErrorMessage('用户信息格式错误，请重新登录');
      loadPage('home');
      return false;
    }

    // user_rank = 5 表示系统管理员（根据 userManager.js 定义）
    // 尝试多种可能的字段名
    const userRank = userInfo.user_rank ?? userInfo.userRank ?? userInfo.rank ?? userInfo.UserRank;
    const rankNum = parseInt(userRank, 10);

    console.log('权限检查 - user_rank:', userRank, 'parsed:', rankNum);

    if (isNaN(rankNum) || rankNum !== 5) {
      showErrorMessage('需要管理员权限才能访问此页面 (当前权限: ' + (isNaN(rankNum) ? '未知' : rankNum) + ')');
      loadPage('home');
      return false;
    }

    return true;
  }

  function setContent(html) {
    const wrap = document.getElementById('content-container');
    if (!wrap) return null;
    wrap.innerHTML = html;
    return wrap;
  }

  function breadcrumb(paths) {
    const parts = paths.map((p, i) => {
      if (p.pageId) return `<a href="#/${p.pageId}">${p.text}</a>`;
      if (p.onClick) return `<a href="#" data-bc-idx="${i}">${p.text}</a>`;
      return `<span>${p.text}</span>`;
    }).join(' / ');
    return `<div class="breadcrumb">${parts}</div>`;
  }

  /**
   * 渲染电子支付管理首页
   */
  global.renderEmoneyAdmin = function() {
    if (!ensureAdmin('emoney-admin')) return;

    const html = `
      <div class="section">
        <h1 class="page-title">电子支付管理</h1>
        <div class="admin-container">
          ${breadcrumb([{text:'网站管理', pageId:'site-admin'}, {text:'电子支付管理'}])}
          <div class="admin-entry-grid">
            <a class="admin-card admin-entry" id="entry-emoney-options">
              <div class="admin-entry-title">充值选项管理</div>
              <div class="admin-entry-desc">管理CREDIT到日元的充值汇率选项。</div>
              <div class="admin-actions"><button class="admin-btn admin-btn-ghost" type="button">进入</button></div>
            </a>
            <a class="admin-card admin-entry" id="entry-emoney-logs">
              <div class="admin-entry-title">充值记录查看</div>
              <div class="admin-entry-desc">查看所有用户的电子支付充值记录。</div>
              <div class="admin-actions"><button class="admin-btn admin-btn-ghost" type="button">进入</button></div>
            </a>
          </div>
        </div>
      </div>
    `;
    const root = setContent(html);
    if (!root) return;

    root.querySelector('#entry-emoney-options').onclick = (e) => {
      e.preventDefault();
      renderEmoneyOptionsPage();
    };

    root.querySelector('#entry-emoney-logs').onclick = (e) => {
      e.preventDefault();
      renderEmoneyLogsPage();
    };
  };

  /**
   * 渲染充值选项管理页面
   */
  function renderEmoneyOptionsPage() {
    if (!ensureAdmin('emoney-admin')) return;

    const html = `
      <div class="section">
        <h1 class="page-title">充值选项管理</h1>
        <div class="admin-container centered">
          ${breadcrumb([{text:'网站管理', pageId:'site-admin'}, {text:'电子支付管理', onClick: 'renderEmoneyAdmin'}, {text:'充值选项管理'}])}
          <div class="admin-card admin-form-card">
            <form id="emoney-option-form" class="admin-form">
              <input type="hidden" id="option-id">
              <div class="form-group">
                <label for="credit-amount">消耗CREDIT数量</label>
                <input type="number" id="credit-amount" min="1" required>
              </div>
              <div class="form-group">
                <label for="yen-amount">充值金额（日元）</label>
                <input type="number" id="yen-amount" min="1" required>
              </div>
              <div class="form-group">
                <label for="sort-order">排序顺序（数字越小越靠前）</label>
                <input type="number" id="sort-order" min="0" value="0">
              </div>
              <div class="form-group">
                <label for="is-active">
                  <input type="checkbox" id="is-active" checked>
                  启用此选项
                </label>
              </div>
              <div class="admin-actions">
                <button type="submit" class="admin-btn admin-btn-primary">保存</button>
                <button type="button" id="option-reset" class="admin-btn admin-btn-ghost">清空</button>
                <button type="button" id="back-emoney-admin" class="admin-btn admin-btn-ghost">返回电子支付管理</button>
              </div>
            </form>

            <div class="admin-list">
              <h4>充值选项列表</h4>
              <div id="option-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    const root = setContent(html);
    if (!root) return;

    const form = root.querySelector('#emoney-option-form');
    const resetBtn = root.querySelector('#option-reset');
    const backBtn = root.querySelector('#back-emoney-admin');
    const listWrap = root.querySelector('#option-list');

    form.onsubmit = async function(e) {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) { showLoginRequired('emoney-admin'); return; }

      const id = root.querySelector('#option-id').value.trim();
      const creditAmount = parseInt(root.querySelector('#credit-amount').value, 10);
      const yenAmount = parseInt(root.querySelector('#yen-amount').value, 10);
      const sortOrder = parseInt(root.querySelector('#sort-order').value, 10) || 0;
      const isActive = root.querySelector('#is-active').checked ? 1 : 0;

      if (!creditAmount || !yenAmount) {
        showErrorMessage('请填写完整信息');
        return;
      }

      try {
        if (id) {
          const delRes = await secureFetch(`${API_BASE_URL}/api/admin/emoney/recharge/options/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!delRes || delRes.success !== true) {
            throw new Error(delRes?.error || '删除失败');
          }
        }

        const postRes = await secureFetch(`${API_BASE_URL}/api/admin/emoney/recharge/options`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credit_amount: creditAmount,
            yen_amount: yenAmount,
            sort_order: sortOrder,
            is_active: isActive
          })
        });

        if (postRes && postRes.success) {
          showSuccessMessage(id ? '已保存修改' : '添加成功');
          form.reset();
          root.querySelector('#option-id').value = '';
          root.querySelector('#is-active').checked = true;
          await loadOptions(listWrap);
        } else {
          throw new Error(postRes?.error || '保存失败');
        }
      } catch (err) {
        console.error(err);
        showErrorMessage(err.message || '请求失败');
      }
    };

    resetBtn.onclick = () => {
      form.reset();
      root.querySelector('#option-id').value = '';
      root.querySelector('#is-active').checked = true;
    };
    backBtn.onclick = () => {
      if (typeof global.renderEmoneyAdmin === 'function') {
        global.renderEmoneyAdmin();
      }
    };

    loadOptions(listWrap);
  }

  /**
   * 加载充值选项列表
   */
  async function loadOptions(listWrap) {
    try {
      const token = localStorage.getItem('token');
      const response = await secureFetch(`${API_BASE_URL}/api/admin/emoney/recharge/options`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 从响应中提取 options 数组
      const options = response?.options || response;

      listWrap.innerHTML = '';
      if (!Array.isArray(options) || options.length === 0) {
        listWrap.innerHTML = '<p class="empty">暂无充值选项</p>';
        return;
      }

      listWrap.innerHTML = options.map(opt => `
        <div class="admin-item">
          <div class="admin-item-meta">
            <div><b>${opt.credit_amount} CREDIT</b> → <b>${opt.yen_amount} 円</b></div>
            <div>排序: ${opt.sort_order} | 状态: ${opt.is_active ? '启用' : '禁用'}</div>
          </div>
          <div class="admin-item-actions">
            <button class="admin-btn admin-btn-primary" data-edit="${opt.id}">编辑</button>
            <button class="admin-btn admin-btn-danger" data-del="${opt.id}">删除</button>
          </div>
        </div>
      `).join('');

      listWrap.onclick = async (e) => {
        const editId = e.target.getAttribute('data-edit');
        const delId = e.target.getAttribute('data-del');

        if (editId) {
          const opt = options.find(x => String(x.id) === String(editId));
          if (!opt) return;
          document.getElementById('option-id').value = opt.id;
          document.getElementById('credit-amount').value = opt.credit_amount;
          document.getElementById('yen-amount').value = opt.yen_amount;
          document.getElementById('sort-order').value = opt.sort_order;
          document.getElementById('is-active').checked = opt.is_active === 1;
          document.getElementById('emoney-option-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (delId) {
          const token = localStorage.getItem('token');
          if (!token) { showLoginRequired('emoney-admin'); return; }
          if (!confirm('确认删除该充值选项？')) return;

          try {
            const res = await secureFetch(`${API_BASE_URL}/api/admin/emoney/recharge/options/${encodeURIComponent(delId)}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res && res.success) {
              showSuccessMessage('删除成功');
              await loadOptions(listWrap);
            } else {
              throw new Error(res?.error || '删除失败');
            }
          } catch (err) {
            console.error(err);
            showErrorMessage(err.message || '请求失败');
          }
        }
      };
    } catch (err) {
      console.error(err);
      showErrorMessage('加载充值选项列表失败');
    }
  }

  /**
   * 渲染充值记录页面
   */
  function renderEmoneyLogsPage() {
    if (!ensureAdmin('emoney-admin')) return;

    const html = `
      <div class="section">
        <h1 class="page-title">充值记录查看</h1>
        <div class="admin-container centered">
          ${breadcrumb([{text:'网站管理', pageId:'site-admin'}, {text:'电子支付管理', onClick: 'renderEmoneyAdmin'}, {text:'充值记录'}])}
          <div class="admin-card">
            <div class="admin-filter-bar">
              <div class="form-group-inline">
                <label>状态筛选：</label>
                <select id="filter-status">
                  <option value="">全部</option>
                  <option value="0">处理中</option>
                  <option value="1">成功</option>
                  <option value="2">失败</option>
                </select>
              </div>
              <div class="form-group-inline">
                <label>用户ID：</label>
                <input type="number" id="filter-user-id" placeholder="输入用户ID">
              </div>
              <button class="admin-btn admin-btn-primary" id="filter-btn">查询</button>
              <button class="admin-btn admin-btn-ghost" id="export-btn">导出CSV</button>
              <button class="admin-btn admin-btn-ghost" id="back-emoney-logs">返回</button>
            </div>
            <div class="admin-table-wrapper">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户ID</th>
                    <th>卡号</th>
                    <th>消耗CREDIT</th>
                    <th>充值金额</th>
                    <th>状态</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody id="logs-tbody">
                  <tr><td colspan="7" class="loading">加载中...</td></tr>
                </tbody>
              </table>
            </div>
            <div class="admin-pagination" id="pagination"></div>
          </div>
        </div>
      </div>
    `;
    const root = setContent(html);
    if (!root) return;

    let currentPage = 1;
    const pageSize = 20;

    const statusSelect = root.querySelector('#filter-status');
    const userIdInput = root.querySelector('#filter-user-id');
    const filterBtn = root.querySelector('#filter-btn');
    const exportBtn = root.querySelector('#export-btn');
    const backBtn = root.querySelector('#back-emoney-logs');
    const tbody = root.querySelector('#logs-tbody');
    const pagination = root.querySelector('#pagination');

    async function loadLogs(page = 1) {
      const token = localStorage.getItem('token');
      const status = statusSelect.value;
      const userId = userIdInput.value.trim();

      let url = `${API_BASE_URL}/api/admin/emoney/recharge/logs?page=${page}&limit=${pageSize}`;
      if (status) url += `&status=${status}`;
      if (userId) url += `&user_id=${userId}`;

      try {
        const data = await secureFetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const logs = data.logs || [];
        const total = data.total || 0;
        const totalPages = Math.ceil(total / pageSize);

        if (logs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="empty">暂无记录</td></tr>';
        } else {
          tbody.innerHTML = logs.map(log => {
            let statusText = '';
            let statusClass = '';
            switch (log.status) {
              case 0: statusText = '处理中'; statusClass = 'status-warning'; break;
              case 1: statusText = '成功'; statusClass = 'status-success'; break;
              case 2: statusText = '失败'; statusClass = 'status-danger'; break;
              default: statusText = '未知';
            }
            return `
              <tr>
                <td>${log.id}</td>
                <td>${log.user_id}</td>
                <td><code>${log.card_number}</code></td>
                <td>${log.credit_amount}</td>
                <td>${log.yen_amount} 円</td>
                <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                <td>${new Date(log.created_at).toLocaleString('zh-CN')}</td>
              </tr>
            `;
          }).join('');
        }

        // 渲染分页
        pagination.innerHTML = '';
        if (totalPages > 1) {
          const prevBtn = document.createElement('button');
          prevBtn.className = 'admin-btn admin-btn-ghost';
          prevBtn.textContent = '上一页';
          prevBtn.disabled = page <= 1;
          prevBtn.onclick = () => loadLogs(page - 1);
          pagination.appendChild(prevBtn);

          const pageInfo = document.createElement('span');
          pageInfo.textContent = `第 ${page} / ${totalPages} 页，共 ${total} 条`;
          pageInfo.style.margin = '0 12px';
          pagination.appendChild(pageInfo);

          const nextBtn = document.createElement('button');
          nextBtn.className = 'admin-btn admin-btn-ghost';
          nextBtn.textContent = '下一页';
          nextBtn.disabled = page >= totalPages;
          nextBtn.onclick = () => loadLogs(page + 1);
          pagination.appendChild(nextBtn);
        }
      } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="7" class="error">加载失败</td></tr>';
        showErrorMessage('加载充值记录失败');
      }
    }

    filterBtn.onclick = () => { currentPage = 1; loadLogs(currentPage); };
    exportBtn.onclick = async () => {
      showSuccessMessage('导出功能开发中');
    };
    backBtn.onclick = () => {
      if (typeof global.renderEmoneyAdmin === 'function') {
        global.renderEmoneyAdmin();
      }
    };

    loadLogs(currentPage);
  }

})(window);
