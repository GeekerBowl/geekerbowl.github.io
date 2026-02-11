/**
 * 电子支付页面功能
 */

(function() {
  'use strict';

  // 检查是否已初始化
  if (window.hasEmoneyInit) return;
  window.hasEmoneyInit = true;

  // 翻译键的默认值（当语言模块未加载时使用）
  const defaultTranslations = {
    'zh-cn': {
      'emoney.title': '电子支付',
      'emoney.statusActive': '已激活',
      'emoney.statusInactive': '未激活',
      'emoney.cardTitle': '授权码验证',
      'emoney.codeLabel': '请输入电子支付授权码',
      'emoney.codePlaceholder': '请输入20位授权码',
      'emoney.submitBtn': '验证并激活',
      'emoney.orText': '或',
      'emoney.adminContact': '如需获取授权码，请联系管理员',
      'emoney.successTitle': '您已拥有电子支付权限',
      'emoney.successMessage': '感谢您使用电子支付功能，您可以随时使用电子支付服务。',
      'emoney.guestUser': '未登录用户',
      'emoney.errorEmpty': '请输入授权码',
      'emoney.errorInvalid': '授权码格式不正确，请检查后重新输入',
      // 新功能翻译
      'emoney.serviceStatus': '服务状态',
      'emoney.serviceNormal': '正常',
      'emoney.serviceError': '异常',
      'emoney.refreshStatus': '刷新状态',
      'emoney.recharge': '充值',
      'emoney.queryBalance': '查询余额',
      'emoney.bindAccount': '绑定账户',
      'emoney.unbindAccount': '解绑账户',
      'emoney.changeAccount': '更换账户',
      'emoney.accessCode': 'ACCESS CODE',
      'emoney.accessCodePlaceholder': '请输入20位纯数字卡号',
      'emoney.rechargeToBound': '充值到绑定账户',
      'emoney.rechargeToCard': '充值到输入账户',
      'emoney.currentCredit': '当前CREDIT',
      'emoney.rechargeAmount': '充值金额',
      'emoney.selectAmount': '请选择充值金额',
      'emoney.balanceInfo': '余额信息',
      'emoney.cardNumber': '卡号',
      'emoney.boundCard': '已绑定卡号',
      'emoney.notBound': '未绑定',
      'emoney.bindSuccess': '绑定成功',
      'emoney.unbindSuccess': '解绑成功',
      'emoney.rechargeSuccess': '充值成功',
      'emoney.rechargeFail': '充值失败',
      'emoney.creditNotEnough': 'CREDIT不足',
      'emoney.confirmRecharge': '确认充值',
      'emoney.confirmRechargeMessage': '确定要使用 {credit} CREDIT 充值 {yen} 円吗？',
      'emoney.cancel': '取消',
      'emoney.confirm': '确定',
      'emoney.loading': '加载中...',
      'emoney.error': '发生错误',
      'emoney.yen': '円',
      'emoney.credit': 'CREDIT'
    },
    'en-us': {
      'emoney.title': 'E-Money',
      'emoney.statusActive': 'Activated',
      'emoney.statusInactive': 'Not Activated',
      'emoney.cardTitle': 'Authorization Code',
      'emoney.codeLabel': 'Enter E-Money Authorization Code',
      'emoney.codePlaceholder': 'Enter 20-character code',
      'emoney.submitBtn': 'Verify & Activate',
      'emoney.orText': 'OR',
      'emoney.adminContact': 'Contact admin to get authorization code',
      'emoney.successTitle': 'You have E-Money access',
      'emoney.successMessage': 'Thank you for using E-Money. You can use E-Money services anytime.',
      'emoney.guestUser': 'Guest User',
      'emoney.errorEmpty': 'Please enter authorization code',
      'emoney.errorInvalid': 'Invalid authorization code format',
      // New feature translations
      'emoney.serviceStatus': 'Service Status',
      'emoney.serviceNormal': 'Normal',
      'emoney.serviceError': 'Error',
      'emoney.refreshStatus': 'Refresh Status',
      'emoney.recharge': 'Recharge',
      'emoney.queryBalance': 'Query Balance',
      'emoney.bindAccount': 'Bind Account',
      'emoney.unbindAccount': 'Unbind Account',
      'emoney.changeAccount': 'Change Account',
      'emoney.accessCode': 'ACCESS CODE',
      'emoney.accessCodePlaceholder': 'Enter 20-digit card number',
      'emoney.rechargeToBound': 'Recharge to Bound Account',
      'emoney.rechargeToCard': 'Recharge to Card',
      'emoney.currentCredit': 'Current CREDIT',
      'emoney.rechargeAmount': 'Recharge Amount',
      'emoney.selectAmount': 'Select Amount',
      'emoney.balanceInfo': 'Balance Info',
      'emoney.cardNumber': 'Card Number',
      'emoney.boundCard': 'Bound Card',
      'emoney.notBound': 'Not Bound',
      'emoney.bindSuccess': 'Binding Successful',
      'emoney.unbindSuccess': 'Unbinding Successful',
      'emoney.rechargeSuccess': 'Recharge Successful',
      'emoney.rechargeFail': 'Recharge Failed',
      'emoney.creditNotEnough': 'Insufficient CREDIT',
      'emoney.confirmRecharge': 'Confirm Recharge',
      'emoney.confirmRechargeMessage': 'Use {credit} CREDIT to recharge {yen} yen?',
      'emoney.cancel': 'Cancel',
      'emoney.confirm': 'Confirm',
      'emoney.loading': 'Loading...',
      'emoney.error': 'An error occurred',
      'emoney.yen': ' yen',
      'emoney.credit': ' CREDIT'
    },
    'ja-jp': {
      'emoney.title': '電子決済',
      'emoney.statusActive': '有効',
      'emoney.statusInactive': '無効',
      'emoney.cardTitle': '認証コード',
      'emoney.codeLabel': '電子決済認証コードを入力',
      'emoney.codePlaceholder': '20桁のコードを入力',
      'emoney.submitBtn': '確認して有効化',
      'emoney.orText': 'または',
      'emoney.adminContact': '認証コードの取得は管理者までお問い合わせください',
      'emoney.successTitle': '電子決済へのアクセス権があります',
      'emoney.successMessage': '電子決済をご利用いただきありがとうございます。いつでも電子決済サービスをご利用いただけます。',
      'emoney.guestUser': 'ゲストユーザー',
      'emoney.errorEmpty': '認証コードを入力してください',
      'emoney.errorInvalid': '認証コードの形式が無効です',
      // 新機能翻訳
      'emoney.serviceStatus': 'サービス状態',
      'emoney.serviceNormal': '正常',
      'emoney.serviceError': '異常',
      'emoney.refreshStatus': '状態を更新',
      'emoney.recharge': '充值',
      'emoney.queryBalance': '残高照会',
      'emoney.bindAccount': 'アカウント連携',
      'emoney.unbindAccount': '連携解除',
      'emoney.changeAccount': 'アカウント変更',
      'emoney.accessCode': 'ACCESS CODE',
      'emoney.accessCodePlaceholder': '20桁のカード番号を入力',
      'emoney.rechargeToBound': '連携账户に充值',
      'emoney.rechargeToCard': 'カードに充值',
      'emoney.currentCredit': '現在のCREDIT',
      'emoney.rechargeAmount': '充值金額',
      'emoney.selectAmount': '金額を選択',
      'emoney.balanceInfo': '残高情報',
      'emoney.cardNumber': 'カード番号',
      'emoney.boundCard': '連携カード',
      'emoney.notBound': '未連携',
      'emoney.bindSuccess': '連携成功',
      'emoney.unbindSuccess': '解除成功',
      'emoney.rechargeSuccess': '充值成功',
      'emoney.rechargeFail': '充值失敗',
      'emoney.creditNotEnough': 'CREDIT不足',
      'emoney.confirmRecharge': '充值確認',
      'emoney.confirmRechargeMessage': '{credit} CREDITを使用して{yen}円を充值しますか？',
      'emoney.cancel': 'キャンセル',
      'emoney.confirm': '確定',
      'emoney.loading': '読み込み中...',
      'emoney.error': 'エラーが発生しました',
      'emoney.yen': '円',
      'emoney.credit': ' CREDIT'
    }
  };

  // 获取翻译的函数
  function getTranslation(key) {
    const lang = localStorage.getItem('language') || 'zh-cn';
    const translations = defaultTranslations[lang] || defaultTranslations['zh-cn'];
    return translations[key] || key;
  }

  /**
   * 显示 Element Plus 风格的通知消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型: success, error, warning, info
   */
  function showEmoneyNotification(message, type = 'info') {
    // 移除已存在的同类型消息
    const existing = document.querySelectorAll(`.el-message--${type}`);
    existing.forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `el-message el-message--${type}`;

    // 根据类型选择图标
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    else if (type === 'error') iconClass = 'fas fa-times-circle';
    else if (type === 'warning') iconClass = 'fas fa-exclamation-circle';

    notification.innerHTML = `
      <i class="${iconClass} el-message__icon"></i>
      <span class="el-message__content">${message}</span>
    `;

    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(-20px)';
      notification.style.transition = 'all 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * 查询并显示服务状态
   */
  window.queryEmoneyStatus = async function() {
    try {
      showEmoneyNotification(getTranslation('emoney.loading'), 'info');

      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/service/status');

      if (response && response.status && response.status.status === 'available') {
        showEmoneyNotification('服务状态：正常', 'success');
      } else {
        const errorMsg = response?.status?.message || '服务异常，请稍后重试';
        showEmoneyNotification(`服务状态：${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error('查询服务状态失败:', error);
      showEmoneyNotification('查询失败，请检查网络连接', 'error');
    }
  };

  // 保存当前页面的状态
  let currentEmoneyState = {
    hasAccess: false,
    userInfo: null,
    wallet: null,
    serviceStatus: 'normal',
    currentView: 'main' // main, recharge, balance
  };

  /**
   * 初始化电子支付页面
   */
  window.initEmoneyPage = async function() {
    const content = document.getElementById('content-container');
    if (!content) return;

    // 显示加载中
    content.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-card">
            <div class="loading-cell">
              <i class="fas fa-spinner fa-spin"></i> ${getTranslation('common.loading')}
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token');

      if (!token) {
        currentEmoneyState = { hasAccess: false, userInfo: null, wallet: null, serviceStatus: 'normal', currentView: 'main' };
        showEmoneyPage(content, false, null, null);
        return;
      }

      // 获取电子支付状态和钱包状态
      // 注意：必须正确处理 API 响应，包括检查是否有 error 字段
      const [statusResponse, walletResponse] = await Promise.all([
        secureFetch('https://api.am-all.com.cn/api/emoney/status')
          .then(response => {
            // 如果响应中有 error 字段，说明请求被拒绝或出错
            if (response && response.error) {
              throw new Error(response.error);
            }
            return response;
          })
          .catch(error => {
            console.error('获取电子支付状态失败:', error);
            // 返回特殊标记，让前端知道需要授权码
            return { has_emoney_access: false, needsAuth: true };
          }),
        secureFetch('https://api.am-all.com.cn/api/emoney/wallet').catch(() => ({ has_emoney_access: false, wallet: null }))
      ]);

      const emoneyStatus = statusResponse || { has_emoney_access: false };
      const walletData = walletResponse || { has_emoney_access: false, wallet: null };

      // 如果 API 返回 needsAuth 标记，说明用户需要授权码
      if (emoneyStatus.needsAuth) {
        currentEmoneyState = { hasAccess: false, userInfo: userInfo, wallet: null, serviceStatus: 'normal', currentView: 'main' };
        showEmoneyPage(content, false, userInfo);
        return;
      }

      currentEmoneyState = {
        hasAccess: emoneyStatus.has_emoney_access,
        userInfo: userInfo,
        wallet: walletData.wallet,
        serviceStatus: 'normal',
        currentView: 'main'
      };

      // 根据是否有电子支付权限显示不同页面
      if (emoneyStatus.has_emoney_access) {
        showMainPage(content);
      } else {
        showEmoneyPage(content, false, userInfo);
      }
    } catch (error) {
      console.error('获取电子支付状态失败:', error);
      currentEmoneyState = { hasAccess: false, userInfo: null, wallet: null, serviceStatus: 'normal', currentView: 'main' };
      showEmoneyPage(content, false, null);
    }
  };

  /**
   * 显示主功能页面（已激活用户）
   */
  function showMainPage(container) {
    const t = getTranslation;

    container.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-header">
            <h1 class="emoney-title">
              <i class="fas fa-credit-card me-2"></i>
              ${t('emoney.title')}
            </h1>
            <div class="emoney-header-right">
              <button class="emoney-refresh-btn" onclick="queryEmoneyStatus()" title="查询服务状态">
                <i class="fas fa-server"></i>
              </button>
            </div>
          </div>

          <div class="emoney-card">
            <div class="emoney-action-buttons">
              <button class="emoney-action-btn" onclick="showRechargePage()">
                <div class="emoney-action-icon">
                  <i class="fas fa-plus-circle"></i>
                </div>
                <div class="emoney-action-text">${t('emoney.recharge')}</div>
              </button>
              <button class="emoney-action-btn" onclick="showBalancePage()">
                <div class="emoney-action-icon">
                  <i class="fas fa-wallet"></i>
                </div>
                <div class="emoney-action-text">${t('emoney.queryBalance')}</div>
              </button>
              <button class="emoney-action-btn" onclick="showBindPage()">
                <div class="emoney-action-icon">
                  <i class="fas fa-link"></i>
                </div>
                <div class="emoney-action-text">${t('emoney.bindAccount')}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 显示充值页面
   */
  window.showRechargePage = async function() {
    const content = document.getElementById('content-container');
    if (!content) return;

    currentEmoneyState.currentView = 'recharge';

    content.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-header">
            <h1 class="emoney-title">
              <i class="fas fa-arrow-left me-2 back-btn" onclick="goBackToMain()" style="cursor: pointer;"></i>
              ${getTranslation('emoney.recharge')}
            </h1>
            <div class="emoney-header-right">
              <button class="emoney-refresh-btn" onclick="queryEmoneyStatus()" title="查询服务状态">
                <i class="fas fa-server"></i>
              </button>
            </div>
          </div>

          <div class="emoney-card">
            <div class="emoney-credit-display-small">
              <span class="emoney-credit-label">当前账户余额：</span>
              <span class="emoney-credit-value" id="emoney-user-credit">--</span>
              <span class="emoney-credit-unit">CREDIT</span>
            </div>
          </div>

          <div class="emoney-card">
            <div class="emoney-card-title">
              <i class="fas fa-credit-card"></i>
              ${getTranslation('emoney.rechargeAmount')}
            </div>

            ${currentEmoneyState.wallet ? `
              <div class="emoney-bound-card-info">
                <i class="fas fa-check-circle"></i>
                <span>${getTranslation('emoney.boundCard')}: ${maskCardNumber(currentEmoneyState.wallet)}</span>
                <button class="emoney-btn-text" onclick="rechargeToBound()">${getTranslation('emoney.rechargeToBound')}</button>
              </div>
            ` : ''}

            <div class="emoney-form-group">
              <label class="emoney-label" for="emoney-card-input">
                ${getTranslation('emoney.accessCode')}
              </label>
              <input
                type="text"
                id="emoney-card-input"
                class="emoney-input"
                placeholder="${getTranslation('emoney.accessCodePlaceholder')}"
                maxlength="20"
                autocomplete="off"
              >
            </div>

            <button
              type="button"
              id="emoney-recharge-btn"
              class="emoney-btn emoney-btn-primary"
              onclick="submitRecharge()"
            >
              <i class="fas fa-check-circle"></i>
              ${getTranslation('emoney.recharge')}
            </button>
          </div>
        </div>
      </div>
    `;

    // 设置卡号输入格式化
    setupCardNumberFormatter();

    // 获取用户CREDIT
    await loadUserCredit();
  };

  /**
   * 显示余额查询页面
   */
  window.showBalancePage = async function() {
    const content = document.getElementById('content-container');
    if (!content) return;

    currentEmoneyState.currentView = 'balance';

    const hasBoundCard = currentEmoneyState.wallet;

    content.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-header">
            <h1 class="emoney-title">
              <i class="fas fa-arrow-left me-2 back-btn" onclick="goBackToMain()" style="cursor: pointer;"></i>
              ${getTranslation('emoney.queryBalance')}
            </h1>
          </div>

          <div class="emoney-card">
            <div class="emoney-card-title">
              <i class="fas fa-info-circle"></i>
              ${getTranslation('emoney.balanceInfo')}
            </div>

            ${hasBoundCard ? `
              <div class="emoney-balance-section">
                <p class="emoney-balance-label">${getTranslation('emoney.boundCard')}</p>
                <p class="emoney-card-number">${currentEmoneyState.wallet}</p>
                <div class="emoney-balance-result" id="emoney-bound-balance" style="display: none;">
                  <span class="balance-amount">--</span>
                  <span class="balance-unit">${getTranslation('emoney.yen')}</span>
                </div>
                <button class="emoney-btn emoney-btn-outline" onclick="queryBoundBalance()">
                  <i class="fas fa-search"></i>
                  ${getTranslation('emoney.queryBalance')}
                </button>
              </div>
            ` : ''}

            <div class="emoney-form-group">
              <label class="emoney-label" for="emoney-balance-card">
                ${getTranslation('emoney.accessCode')}
              </label>
              <input
                type="text"
                id="emoney-balance-card"
                class="emoney-input"
                placeholder="${getTranslation('emoney.accessCodePlaceholder')}"
                maxlength="20"
                autocomplete="off"
              >
            </div>

            <button
              type="button"
              id="emoney-query-btn"
              class="emoney-btn emoney-btn-primary"
              onclick="queryCardBalance()"
            >
              <i class="fas fa-search"></i>
              ${getTranslation('emoney.queryBalance')}
            </button>

            <div class="emoney-balance-result" id="emoney-balance-result" style="display: none;">
              <div class="balance-display">
                <span class="balance-label">${getTranslation('emoney.cardNumber')}:</span>
                <span class="balance-card" id="balance-card-display">--</span>
              </div>
              <div class="balance-display">
                <span class="balance-label">${getTranslation('emoney.balanceInfo')}:</span>
                <span class="balance-amount" id="balance-amount-display">--</span>
                <span class="balance-unit">${getTranslation('emoney.yen')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 设置卡号输入格式化
    setupCardNumberFormatter();
  };

  /**
   * 显示绑定账户页面
   */
  window.showBindPage = function() {
    const content = document.getElementById('content-container');
    if (!content) return;

    currentEmoneyState.currentView = 'bind';

    const hasBoundCard = currentEmoneyState.wallet;

    content.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-header">
            <h1 class="emoney-title">
              <i class="fas fa-arrow-left me-2 back-btn" onclick="goBackToMain()" style="cursor: pointer;"></i>
              ${getTranslation('emoney.bindAccount')}
            </h1>
          </div>

          <div class="emoney-card">
            <div class="emoney-card-title">
              <i class="fas fa-link"></i>
              ${hasBoundCard ? getTranslation('emoney.changeAccount') : getTranslation('emoney.bindAccount')}
            </div>

            ${hasBoundCard ? `
              <div class="emoney-bound-card-display">
                <div class="emoney-bound-info">
                  <i class="fas fa-check-circle bound-icon"></i>
                  <div class="bound-details">
                    <span class="bound-label">${getTranslation('emoney.boundCard')}</span>
                    <span class="bound-number">${currentEmoneyState.wallet}</span>
                  </div>
                </div>
                <div class="emoney-bound-actions">
                  <button class="emoney-btn emoney-btn-outline" onclick="showBindDialog()">
                    <i class="fas fa-edit"></i>
                    ${getTranslation('emoney.changeAccount')}
                  </button>
                  <button class="emoney-btn emoney-btn-danger" onclick="unbindWallet()">
                    <i class="fas fa-unlink"></i>
                    ${getTranslation('emoney.unbindAccount')}
                  </button>
                </div>
              </div>
            ` : `
              <button class="emoney-btn emoney-btn-primary" onclick="showBindDialog()">
                <i class="fas fa-plus-circle"></i>
                ${getTranslation('emoney.bindAccount')}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  };

  /**
   * 显示绑定对话框
   */
  window.showBindDialog = function() {
    const dialog = document.createElement('div');
    dialog.className = 'emoney-dialog-overlay';
    dialog.id = 'emoney-bind-dialog';
    dialog.innerHTML = `
      <div class="emoney-dialog">
        <div class="emoney-dialog-header">
          <h3>${getTranslation('emoney.bindAccount')}</h3>
          <button class="emoney-dialog-close" onclick="closeBindDialog()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="emoney-dialog-body">
          <div class="emoney-form-group">
            <label class="emoney-label" for="emoney-bind-card">
              ${getTranslation('emoney.accessCode')}
            </label>
            <input
              type="text"
              id="emoney-bind-card"
              class="emoney-input"
              placeholder="${getTranslation('emoney.accessCodePlaceholder')}"
              maxlength="20"
              autocomplete="off"
            >
          </div>
          <button
            type="button"
            id="emoney-bind-btn"
            class="emoney-btn emoney-btn-primary"
            onclick="submitBindCard()"
          >
            <i class="fas fa-link"></i>
            ${getTranslation('emoney.bindAccount')}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    // 设置卡号输入格式化
    setupCardNumberFormatter();

    // 绑定回车键
    const input = document.getElementById('emoney-bind-card');
    if (input) {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          submitBindCard();
        }
      });
    }
  };

  /**
   * 关闭绑定对话框
   */
  window.closeBindDialog = function() {
    const dialog = document.getElementById('emoney-bind-dialog');
    if (dialog) {
      dialog.remove();
    }
  };

  /**
   * 提交绑定卡号
   */
  window.submitBindCard = async function() {
    const input = document.getElementById('emoney-bind-card');
    const btn = document.getElementById('emoney-bind-btn');

    if (!input || !btn) return;

    const cardNumber = input.value.trim().replace(/\s/g, '');

    // 验证格式
    if (!cardNumber) {
      showEmoneyError(getTranslation('emoney.errorEmpty'));
      return;
    }

    if (!/^[0-9]{20}$/.test(cardNumber)) {
      showEmoneyError(getTranslation('emoney.errorInvalid'));
      return;
    }

    // 显示加载状态
    btn.classList.add('emoney-btn-loading');
    btn.disabled = true;

    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/wallet/bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardNumber })
      });

      if (response && response.success) {
        showEmoneySuccess(getTranslation('emoney.bindSuccess'));
        currentEmoneyState.wallet = response.wallet;
        closeBindDialog();
        window.showBindPage(); // 刷新绑定页面
      } else {
        showEmoneyError(response?.error || getTranslation('emoney.error'));
      }
    } catch (error) {
      console.error('绑定卡号失败:', error);
      showEmoneyError(error.message || getTranslation('emoney.error'));
    } finally {
      btn.classList.remove('emoney-btn-loading');
      btn.disabled = false;
    }
  };

  /**
   * 解绑钱包
   */
  window.unbindWallet = async function() {
    if (!confirm(getTranslation('emoney.unbindAccount') + '?')) return;

    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/wallet/unbind', {
        method: 'POST'
      });

      if (response && response.success) {
        showEmoneySuccess(getTranslation('emoney.unbindSuccess'));
        currentEmoneyState.wallet = null;
        window.showBindPage(); // 刷新绑定页面
      } else {
        showEmoneyError(response?.error || getTranslation('emoney.error'));
      }
    } catch (error) {
      console.error('解绑失败:', error);
      showEmoneyError(error.message || getTranslation('emoney.error'));
    }
  };

  /**
   * 充值到绑定账户
   */
  window.rechargeToBound = async function() {
    if (!currentEmoneyState.wallet) {
      showEmoneyError(getTranslation('emoney.error'));
      return;
    }

    // 显示充值选项选择弹窗
    await showRechargeOptionsDialog(true);
  };

  /**
   * 提交充值
   */
  window.submitRecharge = async function() {
    const input = document.getElementById('emoney-card-input');
    if (!input) return;

    const cardNumber = input.value.trim().replace(/\s/g, '');

    if (!cardNumber) {
      showEmoneyError(getTranslation('emoney.errorEmpty'));
      return;
    }

    if (!/^[0-9]{20}$/.test(cardNumber)) {
      showEmoneyError(getTranslation('emoney.errorInvalid'));
      return;
    }

    // 显示充值选项选择弹窗
    await showRechargeOptionsDialog(false, cardNumber);
  };

  /**
   * 显示充值选项选择弹窗
   */
  window.showRechargeOptionsDialog = async function(useBound, cardNumber = null) {
    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/recharge/options');

      // 检查 API 是否返回错误（权限不足等）
      if (response && response.error) {
        showEmoneyError(response.error);
        // 重新验证权限
        await recheckEmoneyPermission();
        return;
      }

      if (!response || !response.success || !response.options || response.options.length === 0) {
        showEmoneyError('暂无可用充值选项');
        return;
      }

      const options = response.options;
      const userCreditResponse = await secureFetch('https://api.am-all.com.cn/api/emoney/user/credit');

      // 检查 CREDIT API 是否返回错误
      if (userCreditResponse && userCreditResponse.error) {
        showEmoneyError(userCreditResponse.error);
        // 重新验证权限
        await recheckEmoneyPermission();
        return;
      }

      const userCredit = userCreditResponse?.credit || 0;

      // 构建选项HTML
      const optionsHtml = options.map((opt) => {
        const canUse = userCredit >= opt.credit_amount;
        return `
          <div class="emoney-recharge-option ${canUse ? '' : 'disabled'}"
               data-id="${opt.id}"
               data-credit="${opt.credit_amount}"
               data-yen="${opt.yen_amount}"
               ${canUse ? `onclick="selectRechargeOption(${opt.id}, ${opt.credit_amount}, ${opt.yen_amount}, ${useBound}, '${cardNumber || ''}')"` : ''}>
            <div class="option-credit">${opt.credit_amount} CREDIT</div>
            <div class="option-arrow">→</div>
            <div class="option-yen">${opt.yen_amount}${getTranslation('emoney.yen')}</div>
            ${!canUse ? '<div class="option-badge">CREDIT不足</div>' : ''}
          </div>
        `;
      }).join('');

      const dialog = document.createElement('div');
      dialog.className = 'emoney-dialog-overlay';
      dialog.id = 'emoney-recharge-options-dialog';
      dialog.innerHTML = `
        <div class="emoney-dialog">
          <div class="emoney-dialog-header">
            <h3>${getTranslation('emoney.selectAmount')}</h3>
            <button class="emoney-dialog-close" onclick="closeRechargeOptionsDialog()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="emoney-dialog-body">
            <div class="emoney-current-credit">
              ${getTranslation('emoney.currentCredit')}: ${userCredit} CREDIT
            </div>
            <div class="emoney-recharge-options">
              ${optionsHtml}
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    } catch (error) {
      console.error('获取充值选项失败:', error);
      showEmoneyError(getTranslation('emoney.error'));
      // 重新验证权限
      await recheckEmoneyPermission();
    }
  };

  /**
   * 关闭充值选项弹窗
   */
  window.closeRechargeOptionsDialog = function() {
    const dialog = document.getElementById('emoney-recharge-options-dialog');
    if (dialog) {
      dialog.remove();
    }
  };

  /**
   * 选择充值选项并确认
   */
  window.selectRechargeOption = function(optionId, creditAmount, yenAmount, useBound, cardNumber) {
    closeRechargeOptionsDialog();

    // 确认充值
    const message = getTranslation('emoney.confirmRechargeMessage')
      .replace('{credit}', creditAmount)
      .replace('{yen}', yenAmount);

    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'emoney-dialog-overlay';
    confirmDialog.id = 'emoney-confirm-dialog';
    confirmDialog.innerHTML = `
      <div class="emoney-dialog">
        <div class="emoney-dialog-header">
          <h3>${getTranslation('emoney.confirmRecharge')}</h3>
        </div>
        <div class="emoney-dialog-body">
          <p class="emoney-confirm-message">${message}</p>
          <div class="emoney-confirm-buttons">
            <button class="emoney-btn emoney-btn-outline" onclick="closeConfirmDialog()">
              ${getTranslation('emoney.cancel')}
            </button>
            <button class="emoney-btn emoney-btn-primary" id="emoney-confirm-recharge-btn">
              ${getTranslation('emoney.confirm')}
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(confirmDialog);

    const confirmBtn = document.getElementById('emoney-confirm-recharge-btn');
    if (confirmBtn) {
      confirmBtn.onclick = function() {
        executeRecharge(optionId, creditAmount, yenAmount, useBound, cardNumber);
      };
    }
  };

  /**
   * 关闭确认弹窗
   */
  window.closeConfirmDialog = function() {
    const dialog = document.getElementById('emoney-confirm-dialog');
    if (dialog) {
      dialog.remove();
    }
  };

  /**
   * 执行充值
   */
  async function executeRecharge(optionId, creditAmount, yenAmount, useBound, cardNumber) {
    closeConfirmDialog();

    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          optionId: optionId,
          useBoundCard: useBound,
          cardNumber: cardNumber
        })
      });

      // 检查 API 是否返回错误（权限不足等）
      if (response && response.error) {
        showEmoneyError(response.error);
        // 重新验证权限
        await recheckEmoneyPermission();
        return;
      }

      if (response && response.success) {
        showEmoneySuccess(getTranslation('emoney.rechargeSuccess'));
        // 刷新CREDIT显示
        if (currentEmoneyState.currentView === 'recharge') {
          await loadUserCredit();
        }
      } else {
        showEmoneyError(response?.error || getTranslation('emoney.rechargeFail'));
      }
    } catch (error) {
      console.error('充值失败:', error);
      showEmoneyError(error.message || getTranslation('emoney.rechargeFail'));
      // 重新验证权限
      await recheckEmoneyPermission();
    }
  }

  /**
   * 加载用户CREDIT
   */
  async function loadUserCredit() {
    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/user/credit');
      const creditEl = document.getElementById('emoney-user-credit');

      // 检查 API 是否返回错误（权限不足等）
      if (response && response.error) {
        console.error('获取CREDIT失败:', response.error);
        if (creditEl) {
          creditEl.textContent = '--';
        }
        // 重新验证权限
        await recheckEmoneyPermission();
        return;
      }

      if (creditEl && response) {
        creditEl.textContent = response.credit || 0;
      }
    } catch (error) {
      console.error('获取CREDIT失败:', error);
      const creditEl = document.getElementById('emoney-user-credit');
      if (creditEl) {
        creditEl.textContent = '--';
      }
      // 重新验证权限
      await recheckEmoneyPermission();
    }
  }

  /**
   * 重新验证电子支付权限
   */
  async function recheckEmoneyPermission() {
    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/status');
      const content = document.getElementById('content-container');

      // 如果 API 返回错误，强制显示授权码输入页面
      if (response && response.error) {
        console.log('权限验证失败，显示授权码输入页面');
        currentEmoneyState = {
          hasAccess: false,
          userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
          wallet: null,
          serviceStatus: 'normal',
          currentView: 'main'
        };
        if (content) {
          showEmoneyPage(content, false, currentEmoneyState.userInfo);
        }
        return;
      }

      // 如果用户没有电子支付权限，强制显示授权码输入页面
      if (!response || response.has_emoney_access === false) {
        console.log('用户没有电子支付权限，显示授权码输入页面');
        currentEmoneyState = {
          hasAccess: false,
          userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
          wallet: null,
          serviceStatus: 'normal',
          currentView: 'main'
        };
        if (content && content.querySelector('.emoney-container')) {
          showEmoneyPage(content, false, currentEmoneyState.userInfo);
        }
        return;
      }

      // 权限验证成功，更新状态
      console.log('权限验证成功');
      currentEmoneyState.hasAccess = true;
      currentEmoneyState.wallet = response.wallet || null;
    } catch (error) {
      console.error('重新验证权限失败:', error);
      // 强制显示授权码输入页面
      const content = document.getElementById('content-container');
      currentEmoneyState = {
        hasAccess: false,
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
        wallet: null,
        serviceStatus: 'normal',
        currentView: 'main'
      };
      if (content) {
        showEmoneyPage(content, false, currentEmoneyState.userInfo);
      }
    }
  }

  /**
   * 查询卡号余额
   */
  window.queryCardBalance = async function() {
    const input = document.getElementById('emoney-balance-card');
    const btn = document.getElementById('emoney-query-btn');
    const resultEl = document.getElementById('emoney-balance-result');

    if (!input || !btn) return;

    const cardNumber = input.value.trim().replace(/\s/g, '');

    if (!cardNumber) {
      showEmoneyError(getTranslation('emoney.errorEmpty'));
      return;
    }

    if (!/^[0-9]{20}$/.test(cardNumber)) {
      showEmoneyError(getTranslation('emoney.errorInvalid'));
      return;
    }

    btn.classList.add('emoney-btn-loading');
    btn.disabled = true;

    try {
      const response = await secureFetch(`https://api.am-all.com.cn/api/emoney/balance/${cardNumber}`);

      // 检查 API 是否返回错误（权限不足等）
      if (response && response.error) {
        showEmoneyError(response.error);
        // 重新验证权限
        await recheckEmoneyPermission();
        return;
      }

      if (response && response.success) {
        resultEl.style.display = 'block';
        document.getElementById('balance-card-display').textContent = cardNumber;
        document.getElementById('balance-amount-display').textContent = response.balance?.amount || '--';
      } else {
        showEmoneyError(response?.error || getTranslation('emoney.error'));
      }
    } catch (error) {
      console.error('查询余额失败:', error);
      showEmoneyError(error.message || getTranslation('emoney.error'));
      // 重新验证权限
      await recheckEmoneyPermission();
    } finally {
      btn.classList.remove('emoney-btn-loading');
      btn.disabled = false;
    }
  };

  /**
   * 查询绑定卡号余额
   */
  window.queryBoundBalance = async function() {
    if (!currentEmoneyState.wallet) {
      showEmoneyError(getTranslation('emoney.error'));
      return;
    }

    const resultEl = document.getElementById('emoney-bound-balance');
    if (!resultEl) return;

    resultEl.style.display = 'none';
    resultEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
    resultEl.style.display = 'block';

    try {
      const response = await secureFetch(`https://api.am-all.com.cn/api/emoney/balance/${currentEmoneyState.wallet}`);

      // 检查 API 是否返回错误（权限不足等）
      if (response && response.error) {
        resultEl.innerHTML = '<span class="error">' + (response.error || '查询失败') + '</span>';
        // 重新验证权限
        await recheckEmoneyPermission();
        return;
      }

      if (response && response.success) {
        resultEl.innerHTML = `
          <span class="balance-amount">${response.balance?.amount || '--'}</span>
          <span class="balance-unit">${getTranslation('emoney.yen')}</span>
        `;
      } else {
        resultEl.innerHTML = '<span class="error">查询失败</span>';
      }
    } catch (error) {
      console.error('查询余额失败:', error);
      resultEl.innerHTML = '<span class="error">查询失败</span>';
      // 重新验证权限
      await recheckEmoneyPermission();
    }
  };

  /**
   * 返回主页面
   */
  window.goBackToMain = function() {
    currentEmoneyState.currentView = 'main';
    const content = document.getElementById('content-container');
    if (content) {
      showMainPage(content);
    }
  };

  /**
   * 设置卡号输入格式化（20位纯数字）
   */
  function setupCardNumberFormatter() {
    const inputs = document.querySelectorAll('.emoney-input');
    inputs.forEach(input => {
      // 移除已存在的事件监听器
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);

      newInput.addEventListener('input', function(e) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;

        // 只保留数字
        const filtered = e.target.value.replace(/[^0-9]/g, '');

        if (filtered !== e.target.value) {
          e.target.value = filtered;
          const newLength = filtered.length;
          if (start > newLength) {
            e.target.setSelectionRange(newLength, newLength);
          } else {
            e.target.setSelectionRange(start, end);
          }
        }
      });

      newInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          // 触发父元素的回车处理
          const onclickAttr = newInput.getAttribute('onclick');
          if (onclickAttr) {
            // 对于充值按钮
            if (newInput.id === 'emoney-card-input') {
              window.submitRecharge();
            }
          }
        }
      });
    });
  }

  /**
   * 隐藏卡号中间部分
   */
  function maskCardNumber(cardNumber) {
    if (!cardNumber || cardNumber.length !== 20) return cardNumber;
    return cardNumber.substring(0, 4) + '**********' + cardNumber.substring(14);
  }

  /**
   * 显示电子支付页面（授权码验证）
   */
  function showEmoneyPage(container, hasEmoneyAccess, userInfo) {
    // 使用内置翻译函数
    const t = getTranslation;
    const statusActive = t('emoney.statusActive');
    const statusInactive = t('emoney.statusInactive');
    const title = t('emoney.title');
    const cardTitle = t('emoney.cardTitle');
    const codeLabel = t('emoney.codeLabel');
    const codePlaceholder = t('emoney.codePlaceholder');
    const submitBtn = t('emoney.submitBtn');
    const orText = t('emoney.orText');
    const adminContact = t('emoney.adminContact');
    const successTitle = t('emoney.successTitle');
    const successMessage = t('emoney.successMessage');

    const statusHtml = hasEmoneyAccess ? `
      <span class="emoney-status active">
        <span class="emoney-status-icon"></span>
        ${statusActive}
      </span>
    ` : `
      <span class="emoney-status inactive">
        <span class="emoney-status-icon"></span>
        ${statusInactive}
      </span>
    `;

    const avatarUrl = userInfo?.avatar || 'https://api.am-all.com.cn/avatars/default_avatar.png';
    const userName = userInfo?.nickname || userInfo?.username || t('emoney.guestUser');

    container.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-header">
            <h1 class="emoney-title">
              <i class="fas fa-credit-card me-2"></i>
              ${title}
            </h1>
            ${statusHtml}
          </div>

          <div class="emoney-card">
            <div class="emoney-card-title">
              <i class="fas fa-key"></i>
              ${cardTitle}
            </div>

            ${hasEmoneyAccess ? `
              <div class="emoney-success-page">
                <div class="emoney-success-icon">
                  <i class="fas fa-check"></i>
                </div>
                <div class="emoney-success-title">${successTitle}</div>
                <div class="emoney-success-message">
                  ${successMessage}
                </div>
                <button class="emoney-btn emoney-btn-primary" onclick="window.initEmoneyPage()">
                  <i class="fas fa-arrow-right"></i>
                  进入电子支付
                </button>
              </div>
            ` : `
              <div class="emoney-form-group">
                <label class="emoney-label" for="emoney-code">
                  ${codeLabel}
                </label>
                <input
                  type="text"
                  id="emoney-code"
                  class="emoney-input"
                  placeholder="${codePlaceholder}"
                  maxlength="20"
                  autocomplete="off"
                >
              </div>

              <button
                type="button"
                id="emoney-submit-btn"
                class="emoney-btn emoney-btn-primary"
                onclick="submitEmoneyCode()"
              >
                <i class="fas fa-check-circle"></i>
                ${submitBtn}
              </button>

              <div class="emoney-divider">
                <span>${orText}</span>
              </div>

              <p style="color: #666; font-size: 0.875rem; text-align: center;">
                ${adminContact}
              </p>
            `}
          </div>
        </div>
      </div>
    `;

    // 如果未激活，添加输入框格式化功能
    if (!hasEmoneyAccess) {
      setupCodeInputFormatter();
    }
  }

  /**
   * 设置授权码输入框格式化
   */
  function setupCodeInputFormatter() {
    const input = document.getElementById('emoney-code');
    if (!input) return;

    input.addEventListener('input', function(e) {
      // 保存光标位置
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      // 只保留大写字母和数字，移除所有其他字符（包括-）
      const filtered = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

      // 只有值发生变化时才更新
      if (filtered !== e.target.value) {
        e.target.value = filtered;
        // 尝试恢复光标位置（可能会超出范围，需要调整）
        const newLength = filtered.length;
        if (start > newLength) {
          e.target.setSelectionRange(newLength, newLength);
        } else {
          e.target.setSelectionRange(start, end);
        }
      }
    });

    // 绑定回车键提交
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        submitEmoneyCode();
      }
    });
  }

  /**
   * 提交授权码
   */
  window.submitEmoneyCode = async function() {
    const input = document.getElementById('emoney-code');
    const btn = document.getElementById('emoney-submit-btn');

    // 使用内置翻译函数
    const t = getTranslation;
    const errorEmpty = t('emoney.errorEmpty');
    const errorInvalid = t('emoney.errorInvalid');

    if (!input || !btn) return;

    // 获取原始输入值，移除所有横杠
    const code = input.value.trim().toUpperCase().replace(/-/g, '');

    console.log('提交的授权码:', code, '长度:', code.length);

    if (!code) {
      showEmoneyError(errorEmpty);
      return;
    }

    // 验证格式：20位大写字母和数字
    const codePattern = /^[A-Z0-9]{20}$/;
    if (!codePattern.test(code)) {
      showEmoneyError(errorInvalid);
      return;
    }

    // 显示加载状态
    btn.classList.add('emoney-btn-loading');
    btn.disabled = true;

    try {
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (response && response.success) {
        showEmoneySuccess(response.message || getTranslation('emoney.successMessage'));

        // 更新本地用户信息
        await updateUserEmoneyStatus();

        // 2秒后刷新页面
        setTimeout(() => {
          window.initEmoneyPage();
        }, 2000);
      } else {
        showEmoneyError(response?.error || getTranslation('emoney.errorInvalid'));
      }
    } catch (error) {
      console.error('提交授权码失败:', error);
      showEmoneyError(error.message || getTranslation('common.error'));
    } finally {
      btn.classList.remove('emoney-btn-loading');
      btn.disabled = false;
    }
  };

  /**
   * 更新用户电子支付状态
   */
  async function updateUserEmoneyStatus() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await secureFetch('https://api.am-all.com.cn/api/user');
      if (response) {
        localStorage.setItem('userInfo', JSON.stringify(response));
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
    }
  }

  /**
   * 显示成功消息（Element Plus风格）
   */
  function showEmoneySuccess(message) {
    removeExistingMessage();

    const msgEl = document.createElement('div');
    msgEl.className = 'el-message el-message--success';
    msgEl.innerHTML = `
      <i class="el-message__icon fas fa-check-circle"></i>
      <span class="el-message__content">${escapeHtml(message)}</span>
    `;
    msgEl.id = 'emoney-message';

    document.body.appendChild(msgEl);

    setTimeout(() => {
      msgEl.remove();
    }, 3000);
  }

  /**
   * 显示错误消息（Element Plus风格）
   */
  function showEmoneyError(message) {
    removeExistingMessage();

    const msgEl = document.createElement('div');
    msgEl.className = 'el-message el-message--error';
    msgEl.innerHTML = `
      <i class="el-message__icon fas fa-times-circle"></i>
      <span class="el-message__content">${escapeHtml(message)}</span>
    `;
    msgEl.id = 'emoney-message';

    document.body.appendChild(msgEl);

    setTimeout(() => {
      msgEl.remove();
    }, 3000);
  }

  /**
   * 移除现有的消息
   */
  function removeExistingMessage() {
    const existing = document.getElementById('emoney-message');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * HTML转义
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 监听语言切换事件，刷新电子支付页面
  window.addEventListener('languageChanged', async function() {
    const content = document.getElementById('content-container');
    if (content && content.querySelector('.emoney-container')) {
      // 切换语言时，必须强制重新验证权限，不能依赖缓存状态
      // 直接重新初始化整个页面
      console.log('语言切换，强制重新验证电子支付权限...');

      try {
        const response = await secureFetch('https://api.am-all.com.cn/api/emoney/status');

        // 如果 API 返回错误或 has_emoney_access 为 false，强制显示授权码输入页面
        if (response && response.error) {
          console.log('权限验证失败，显示授权码输入页面');
          // 重置状态
          currentEmoneyState = {
            hasAccess: false,
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
            wallet: null,
            serviceStatus: 'normal',
            currentView: 'main'
          };
          showEmoneyPage(content, false, currentEmoneyState.userInfo);
          return;
        }

        // 如果用户没有电子支付权限，强制显示授权码输入页面
        if (!response || response.has_emoney_access === false) {
          console.log('用户没有电子支付权限，显示授权码输入页面');
          currentEmoneyState = {
            hasAccess: false,
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
            wallet: null,
            serviceStatus: 'normal',
            currentView: 'main'
          };
          showEmoneyPage(content, false, currentEmoneyState.userInfo);
          return;
        }

        // 权限验证成功，更新状态并刷新页面
        console.log('权限验证成功，刷新功能页面');
        currentEmoneyState.hasAccess = true;
        currentEmoneyState.wallet = response.wallet || null;

        // 根据当前视图刷新页面
        if (currentEmoneyState.currentView === 'main') {
          showMainPage(content);
        } else if (currentEmoneyState.currentView === 'recharge') {
          showRechargePage();
        } else if (currentEmoneyState.currentView === 'balance') {
          showBalancePage();
        } else if (currentEmoneyState.currentView === 'bind') {
          showBindPage();
        }
      } catch (error) {
        console.error('语言切换时验证权限失败:', error);
        // 强制显示授权码输入页面
        currentEmoneyState = {
          hasAccess: false,
          userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
          wallet: null,
          serviceStatus: 'normal',
          currentView: 'main'
        };
        showEmoneyPage(content, false, currentEmoneyState.userInfo);
      }
    }
  });

  // 覆盖 initEmoneyPage 以保存状态
  const originalInitEmoneyPage = window.initEmoneyPage;
  window.initEmoneyPage = async function() {
    const content = document.getElementById('content-container');
    if (!content) return;

    // 显示加载中
    content.innerHTML = `
      <div class="section">
        <div class="emoney-container">
          <div class="emoney-card">
            <div class="loading-cell">
              <i class="fas fa-spinner fa-spin"></i> ${getTranslation('common.loading')}
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      // 获取用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token');

      if (!token) {
        currentEmoneyState = { hasAccess: false, userInfo: null, wallet: null, serviceStatus: 'normal', currentView: 'main' };
        showEmoneyPage(content, false, null);
        return;
      }

      // 获取电子支付状态和钱包状态
      const [statusResponse, walletResponse] = await Promise.all([
        secureFetch('https://api.am-all.com.cn/api/emoney/status'),
        secureFetch('https://api.am-all.com.cn/api/emoney/wallet').catch(() => ({ has_emoney_access: false, wallet: null }))
      ]);

      const emoneyStatus = statusResponse || { has_emoney_access: false };
      const walletData = walletResponse || { has_emoney_access: false, wallet: null };

      currentEmoneyState = {
        hasAccess: emoneyStatus.has_emoney_access,
        userInfo: userInfo,
        wallet: walletData.wallet,
        serviceStatus: 'normal',
        currentView: 'main'
      };

      // 根据是否有电子支付权限显示不同页面
      if (emoneyStatus.has_emoney_access) {
        showMainPage(content);
      } else {
        showEmoneyPage(content, false, null);
      }
    } catch (error) {
      console.error('获取电子支付状态失败:', error);
      currentEmoneyState = { hasAccess: false, userInfo: null, wallet: null, serviceStatus: 'normal', currentView: 'main' };
      showEmoneyPage(content, false, null);
    }
  };

  console.log('电子支付页面模块已加载');
})();
