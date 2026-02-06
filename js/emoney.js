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
      'emoney.errorInvalid': '授权码格式不正确，请检查后重新输入'
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
      'emoney.errorInvalid': 'Invalid authorization code format'
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
      'emoney.errorInvalid': '認証コードの形式が無効です'
    }
  };

  // 获取翻译的函数
  function getTranslation(key) {
    const lang = localStorage.getItem('language') || 'zh-cn';
    const translations = defaultTranslations[lang] || defaultTranslations['zh-cn'];
    return translations[key] || key;
  }

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
      // 获取用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token');

      if (!token) {
        showEmoneyPage(content, false, null);
        return;
      }

      // 获取电子支付状态
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/status');
      const emoneyStatus = response || { has_emoney_access: false };

      showEmoneyPage(content, emoneyStatus.has_emoney_access, userInfo);
    } catch (error) {
      console.error('获取电子支付状态失败:', error);
      showEmoneyPage(content, false, null);
    }
  };

  /**
   * 显示电子支付页面
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
        updateUserEmoneyStatus();

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

  // 保存当前页面的状态
  let currentEmoneyState = {
    hasAccess: false,
    userInfo: null
  };

  // 监听语言切换事件，刷新电子支付页面
  window.addEventListener('languageChanged', function() {
    const content = document.getElementById('content-container');
    if (content && content.querySelector('.emoney-container')) {
      // 重新渲染页面
      showEmoneyPage(content, currentEmoneyState.hasAccess, currentEmoneyState.userInfo);
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
        currentEmoneyState = { hasAccess: false, userInfo: null };
        showEmoneyPage(content, false, null);
        return;
      }

      // 获取电子支付状态
      const response = await secureFetch('https://api.am-all.com.cn/api/emoney/status');
      const emoneyStatus = response || { has_emoney_access: false };

      currentEmoneyState = { hasAccess: emoneyStatus.has_emoney_access, userInfo: userInfo };
      showEmoneyPage(content, emoneyStatus.has_emoney_access, userInfo);
    } catch (error) {
      console.error('获取电子支付状态失败:', error);
      currentEmoneyState = { hasAccess: false, userInfo: null };
      showEmoneyPage(content, false, null);
    }
  };

  console.log('电子支付页面模块已加载');
})();
