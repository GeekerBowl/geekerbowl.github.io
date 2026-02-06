let currentUser = null;
let cropper = null;
let currentOrders = [];
let currentPage = 1;
const ordersPerPage = 50;

const PROTECTED_PAGES = [
  'download','tools','dllpatcher','fortune','user-settings',
  'ccb','exchange','announcement-admin','site-admin','download-admin','order-entry','user-manager',
  'point-shop', 'points-shop-admin', 'point2-shop-admin',
  'credit-shop-admin', 'redemption-code-admin', 'emoji-admin', 'forum', 'forum-admin',
  'minigame', 'user-verification', 'verification-admin',
  'emoney'
];

const MUSIC_DATA_URLS = [
  'https://cos.am-all.com.cn/data/music.json',
];

let announcementsData = [];

function showSuccessAnimation(title, message, duration = 3000, callback = null) {
  const existingModal = document.getElementById('success-animation-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <div id="success-animation-modal" class="success-animation-modal">
      <div class="success-animation-content">
        <!-- 光晕效果 -->
        <div class="success-glow"></div>
        
        <!-- 星星效果 -->
        <div class="success-stars">
          <span class="star"></span>
          <span class="star"></span>
          <span class="star"></span>
          <span class="star"></span>
          <span class="star"></span>
        </div>
        
        <!-- 成功图标 -->
        <div class="success-checkmark-wrapper">
          <div class="success-circle">
            <svg class="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="success-checkmark-circle" cx="26" cy="26" r="25"/>
              <path class="success-checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>
        
        <!-- 文字内容 -->
        <h2 class="success-title">${title}</h2>
        <p class="success-message">${message}</p>
        
        <!-- 进度条 -->
        <div class="success-progress-bar">
          <div class="success-progress"></div>
        </div>
        
        <!-- 彩带效果 -->
        <div class="confetti-container" id="confetti-container"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('success-animation-modal');

  const confettiContainer = document.getElementById('confetti-container');
  if (confettiContainer) {
    createConfetti(confettiContainer, 30);
  }

  setTimeout(() => {
    modal.classList.add('show');
  }, 10);

  playSuccessSound();

  setTimeout(() => {
    closeSuccessAnimation(modal, callback);
  }, duration);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeSuccessAnimation(modal, callback);
    }
  });
}

function createConfetti(container, count) {
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);
  }
}

function closeSuccessAnimation(modal, callback) {
  if (!modal) return;
  
  modal.style.animation = 'fadeOut 0.3s ease';
  
  setTimeout(() => {
    modal.remove();
    if (callback && typeof callback === 'function') {
      callback();
    }
  }, 300);
}

function playSuccessSound() {
  // 如果需要音效，可以在这里添加
  // const audio = new Audio('path/to/success-sound.mp3');
  // audio.play().catch(e => console.log('音效播放失败'));
}

if (!document.querySelector('#fadeOutStyle')) {
  const style = document.createElement('style');
  style.id = 'fadeOutStyle';
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

function handleLoginWithAnimation() {
  const login = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  if (!login || !password) {
    showTempErrorMessage(errorElement, '用户名/邮箱和密码不能为空');
    return;
  }

  console.log('开始登录:', login);
  
  secureFetch('https://api.am-all.com.cn/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ login, password })
  })
  .then(data => {
    console.log('登录成功:', data);
    
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      showSuccessAnimation(
        '登录成功',
        `欢迎回来，${data.user.nickname || data.user.username}！`,
        2500,
        () => {
          updateUserInfo(data.user);
          showUserInfo();
          setupUserDropdown();
          fetchUserPermissions(data.token).then(permissions => {
            localStorage.setItem('userPermissions', JSON.stringify(permissions));
            updateSidebarVisibility(currentUser);
          });
          loadPage('home');
        }
      );
      
      return data;
    } else {
      throw new Error(data.error || '登录失败');
    }
  })
  .catch(error => {
    console.error('登录失败:', {
      error: error.message,
      status: error.status,
      details: error.details
    });
    
    let userMessage = '登录失败';
    if (error.status === 401) {
      userMessage = '用户名或密码错误';
    } else if (error.status === 500) {
      userMessage = '服务器内部错误，请稍后再试';
    }
    
    showTempErrorMessage(errorElement, userMessage);
  });
}

function handleRegisterWithAnimation() {
  const username = document.getElementById('register-username').value;
  const nickname = document.getElementById('register-nickname').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const verificationCode = document.getElementById('register-verification-code').value;
  const errorElement = document.getElementById('register-error');

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  if (!username || !password || !email || !verificationCode) {
    showTempErrorMessage(errorElement, '用户名、密码、邮箱和验证码不能为空');
    return;
  }

  if (username.length < 6 || username.length > 20) {
    showTempErrorMessage(errorElement, '用户名长度需在6-20个字符之间');
    return;
  }

  if (nickname && (nickname.length < 2 || nickname.length > 12)) {
    showTempErrorMessage(errorElement, '昵称长度需在2-12个字符之间');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showTempErrorMessage(errorElement, '邮箱格式不正确');
    return;
  }

  if (password.length < 8 || password.length > 16) {
    showTempErrorMessage(errorElement, '密码长度需在8-16个字符之间');
    return;
  }
  
  if (password !== confirmPassword) {
    showTempErrorMessage(errorElement, '两次输入的密码不一致');
    return;
  }

  fetch('https://api.am-all.com.cn/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password, nickname, email, verificationCode })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('token', data.token);

      showSuccessAnimation(
        '注册成功',
        `欢迎加入，${nickname || username}！`,
        3000,
        () => {
          updateUserInfo(data.user);
          showUserInfo();
          loadPage('home');
        }
      );
    } else {
      throw new Error(data.error || '注册失败');
    }
  })
  .catch(error => {
    showTempErrorMessage(errorElement, error.error || '注册失败');
  });
}

function saveSidebarScroll() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sessionStorage.setItem('sidebarScroll', sidebar.scrollTop);
  }
}

function restoreSidebarScroll() {
  const sidebar = document.querySelector('.sidebar');
  const savedScroll = sessionStorage.getItem('sidebarScroll');
  if (sidebar && savedScroll) {
    sidebar.scrollTop = parseInt(savedScroll);
  }
}

window.handleExternalLink = function(e) {
  e.stopPropagation();
};

document.addEventListener("DOMContentLoaded", function() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.addEventListener('scroll', saveSidebarScroll);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebar) {
    sidebar.addEventListener('touchstart', function(e) {
      if (window.innerWidth <= 992 && sidebar.classList.contains('show')) {
        e.stopPropagation();
      }
    });
    
    sidebar.addEventListener('touchmove', function(e) {
      if (window.innerWidth <= 992 && sidebar.classList.contains('show')) {
        e.stopPropagation();
      }
    });
  }
});

async function loadServerListCache() {
    if (window.serverListCache) {
        return window.serverListCache;
    }
    
    try {
        const list = await secureFetch('https://api.am-all.com.cn/api/ccb/servers');
        window.serverListCache = list || [];
        return window.serverListCache;
    } catch (error) {
        console.error('加载服务器列表失败:', error);
        window.serverListCache = [];
        return window.serverListCache;
    }
}

function getServerNameByUrl(serverUrl) {
    if (!serverUrl || !window.serverListCache) {
        return serverUrl || '未知服务器';
    }
    
    const server = window.serverListCache.find(s => s.server_url === serverUrl);
    return server ? server.server_name : serverUrl;
}

async function displayCCBBindingInfo() {
    const bindingSection = document.getElementById('ccb-binding-section');
    const noBindingMessage = document.getElementById('no-binding-message');
    
    if (!bindingSection || !noBindingMessage) return;

    await loadServerListCache();

    const slot1Bound = currentUser && currentUser.game_server && currentUser.keychip && currentUser.guid;
    const slot2Bound = currentUser && currentUser.ccb_slot2_server && currentUser.ccb_slot2_keychip && currentUser.ccb_slot2_guid;
    const slot3Bound = currentUser && currentUser.ccb_slot3_server && currentUser.ccb_slot3_keychip && currentUser.ccb_slot3_guid;
    
    const hasAnyBinding = slot1Bound || slot2Bound || slot3Bound;
    
    if (hasAnyBinding) {
        bindingSection.style.display = 'block';
        noBindingMessage.style.display = 'none';

        updateCardPanel(1, slot1Bound, {
            server: currentUser.game_server,
            keychip: currentUser.keychip,
            guid: currentUser.guid
        });

        updateCardPanel(2, slot2Bound, {
            server: currentUser.ccb_slot2_server,
            keychip: currentUser.ccb_slot2_keychip,
            guid: currentUser.ccb_slot2_guid
        });

        updateCardPanel(3, slot3Bound, {
            server: currentUser.ccb_slot3_server,
            keychip: currentUser.ccb_slot3_keychip,
            guid: currentUser.ccb_slot3_guid
        });

        updateActiveCardMarkers();

        initBindingTabs();

        initVisibilityToggle('ccb');

        const unbindBtns = bindingSection.querySelectorAll('.ccb-unbind-btn');
        unbindBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const slot = parseInt(this.getAttribute('data-slot'));
                handleUnbindFromSettings(slot);
            });
        });
        
    } else {
        bindingSection.style.display = 'none';
        noBindingMessage.style.display = 'block';
    }
}

function handleUnbindFromSettings(slot) {
    if (typeof slot !== 'number' || slot < 1 || slot > 3) {
        console.error('handleUnbindFromSettings: 无效的卡片槽位', slot);
        showErrorMessage('参数错误：无效的卡片槽位');
        return;
    }
    
    if (!confirm(`确定要解绑卡片${slot}吗？解绑后需要重新绑定才能使用查分功能。`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    secureFetch('https://api.am-all.com.cn/api/ccb/unbind', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slot: slot })
    })
    .then(result => {
        if (result.success) {
            showSuccessMessage(`卡片${slot}解绑成功`);

            if (slot === 1) {
                currentUser.game_server = null;
                currentUser.keychip = null;
                currentUser.guid = null;
            } else if (slot === 2) {
                currentUser.ccb_slot2_server = null;
                currentUser.ccb_slot2_keychip = null;
                currentUser.ccb_slot2_guid = null;
            } else if (slot === 3) {
                currentUser.ccb_slot3_server = null;
                currentUser.ccb_slot3_keychip = null;
                currentUser.ccb_slot3_guid = null;
            }

            localStorage.setItem('userInfo', JSON.stringify(currentUser));

            displayCCBBindingInfo();
            
        } else {
            showErrorMessage(result.error || '解绑失败');
        }
    })
    .catch(error => {
        console.error('解绑失败:', error);
        showErrorMessage('解绑失败: ' + (error.error || '服务器错误'));
    });
}

function displayShippingBindingInfo() {
    const shippingSection = document.getElementById('shipping-binding-section');
    const noShippingMessage = document.getElementById('no-shipping-message');
    
    if (!shippingSection || !noShippingMessage) return;

    const token = localStorage.getItem('token');
    if (!token) return;
    
    secureFetch('https://api.am-all.com.cn/api/shop/shipping-address', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(result => {
        if (result.success && result.address) {
            shippingSection.style.display = 'block';
            noShippingMessage.style.display = 'none';

            const nameEl = document.getElementById('shipping-name');
            const phoneEl = document.getElementById('shipping-phone');
            const addressEl = document.getElementById('shipping-address');
            const postalEl = document.getElementById('shipping-postal-code');
            
            const name = result.address.receiver_name || '-';
            const phone = result.address.contact_phone || '-';
            const address = result.address.shipping_address || '-';
            const postal = result.address.taobao_id || '-';
            
            nameEl.textContent = name;
            nameEl.setAttribute('data-original', name);
            
            phoneEl.textContent = phone;
            phoneEl.setAttribute('data-original', phone);
            
            addressEl.textContent = address;
            addressEl.setAttribute('data-original', address);
            
            postalEl.textContent = postal;
            postalEl.setAttribute('data-original', postal);

            initVisibilityToggle('shipping');

            const unbindBtn = document.getElementById('unbind-shipping-btn');
            if (unbindBtn) {
                unbindBtn.replaceWith(unbindBtn.cloneNode(true));
                document.getElementById('unbind-shipping-btn').addEventListener('click', handleUnbindShipping);
            }
        } else {
            shippingSection.style.display = 'none';
            noShippingMessage.style.display = 'block';

            const addBtn = document.getElementById('add-shipping-btn');
            if (addBtn) {
                addBtn.replaceWith(addBtn.cloneNode(true));
                document.getElementById('add-shipping-btn').addEventListener('click', () => {
                    loadPage('point-shop');
                });
            }
        }
    })
    .catch(error => {
        console.error('获取收货信息失败:', error);
        shippingSection.style.display = 'none';
        noShippingMessage.style.display = 'block';
    });
}

function updateCardPanel(cardNum, isBound, data) {
    const panel = document.getElementById(`card-${cardNum}-panel`);
    if (!panel) return;
    
    const bindingInfo = panel.querySelector('.binding-info');
    const unbindBtn = panel.querySelector('.ccb-unbind-btn');
    const noBindingHint = panel.querySelector('.no-binding-hint');
    const tabBtn = document.querySelector(`.binding-tab-btn[data-card="${cardNum}"]`);
    
    if (isBound) {
        bindingInfo.style.display = 'block';
        unbindBtn.style.display = 'block';
        noBindingHint.style.display = 'none';

        const serverName = getServerNameByUrl(data.server);
        const serverEl = panel.querySelector('[data-field="server"]');
        if (serverEl) {
            serverEl.textContent = serverName;
            serverEl.setAttribute('data-original', serverName);
        }
        
        const keychipEl = panel.querySelector('[data-field="keychip"]');
        if (keychipEl) {
            keychipEl.textContent = data.keychip;
            keychipEl.setAttribute('data-original', data.keychip);
        }
        
        const guidEl = panel.querySelector('[data-field="guid"]');
        if (guidEl) {
            guidEl.textContent = data.guid;
            guidEl.setAttribute('data-original', data.guid);
        }

        if (tabBtn) {
            tabBtn.classList.add('bound');
        }
    } else {
        bindingInfo.style.display = 'none';
        unbindBtn.style.display = 'none';
        noBindingHint.style.display = 'block';

        if (tabBtn) {
            tabBtn.classList.remove('bound');
        }
    }
}

function updateActiveCardMarkers() {
    document.querySelectorAll('.card-active-star').forEach(star => {
        star.style.display = 'none';
    });

    if (currentUser && currentUser.ccb_active_slot) {
        const activeSlot = currentUser.ccb_active_slot;
        const activeBtn = document.querySelector(`.binding-tab-btn[data-card="${activeSlot}"]`);
        if (activeBtn) {
            const star = activeBtn.querySelector('.card-active-star');
            if (star) {
                star.style.display = 'inline-block';
            }
        }
    }
}

function initBindingTabs() {
    const tabBtns = document.querySelectorAll('.binding-tab-btn');
    const tabPanels = document.querySelectorAll('.binding-tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const cardNum = this.getAttribute('data-card');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
            const targetPanel = document.getElementById(`card-${cardNum}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function initVisibilityToggle(type) {
    const toggleBtn = document.getElementById(`${type}-visibility-toggle`);
    if (!toggleBtn) return;

    const newBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

    let isVisible = true;
    
    newBtn.addEventListener('click', function() {
        isVisible = !isVisible;

        const icon = this.querySelector('i');
        if (isVisible) {
            icon.className = 'fas fa-eye';
        } else {
            icon.className = 'fas fa-eye-slash';
        }

        if (type === 'ccb') {
            toggleCCBSensitiveData(isVisible);
        } else if (type === 'shipping') {
            toggleShippingSensitiveData(isVisible);
        }
    });
}

function toggleCCBSensitiveData(isVisible) {
    const sensitiveElements = document.querySelectorAll('#ccb-binding-section .sensitive-data');
    
    sensitiveElements.forEach(el => {
        const original = el.getAttribute('data-original');
        if (!original || original === '-') return;
        
        if (isVisible) {
            el.textContent = original;
        } else {
            el.textContent = '***********';
        }
    });
}

function toggleShippingSensitiveData(isVisible) {
    const sensitiveElements = document.querySelectorAll('#shipping-binding-section .sensitive-data');
    
    sensitiveElements.forEach(el => {
        const original = el.getAttribute('data-original');
        if (!original || original === '-') return;
        
        if (isVisible) {
            el.textContent = original;
        } else {
            const fieldId = el.id;
            if (fieldId === 'shipping-phone') {
                el.textContent = '***********';
            } else if (fieldId === 'shipping-postal-code') {
                el.textContent = '********';
            } else {
                el.textContent = '***********';
            }
        }
    });
}

function handleUnbindShipping() {
    if (!confirm('确定要解绑收货信息吗？解绑后需要重新绑定才能使用积分商城。')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    secureFetch('https://api.am-all.com.cn/api/shop/shipping-address', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(result => {
        if (result.success) {
            showSuccessMessage('收货信息解绑成功');
            displayShippingBindingInfo();
        } else {
            showErrorMessage(result.error || '解绑失败');
        }
    })
    .catch(error => {
        console.error('解绑失败:', error);
        showErrorMessage('解绑失败: ' + (error.error || '服务器错误'));
    });
}

function refreshUserInfoDisplay() {
  const userInfoMobile = document.getElementById('user-info-mobile');
  if (userInfoMobile && userInfoMobile.offsetParent === null) {
    const originalDisplay = userInfoMobile.style.display;
    userInfoMobile.style.display = 'block';

    void userInfoMobile.offsetWidth;
    
    setTimeout(() => {
      userInfoMobile.style.display = originalDisplay;
    }, 50);
  }
}

async function updateSidebarVisibility(user) {
  const token = localStorage.getItem('token');
  const guestVisible = ['home', 'settings', 'help'];

  const setDisplay = (el, show) => { 
    if (el) {
      el.style.display = show ? '' : 'none';
    }
  };

	const allPages = [
	  'home', 'download', 'tools', 'dllpatcher', 'settings', 'help', 'fortune', 'user-settings',
	  'ccb', 'exchange', 'announcement-admin', 'site-admin', 'download-admin', 'user-manager', 'order-entry',
	  'point-shop', 'points-shop-admin', 'point2-shop-admin',
	  'credit-shop-admin', 'redemption-code-admin', 'emoji-admin',
	  'forum', 'forum-admin',
	  'minigame', 'user-verification', 'verification-admin',
	  'emoney'
	];

  const pageVisibility = {};

  if (!token) {
    for (const pageId of allPages) {
      pageVisibility[pageId] = guestVisible.includes(pageId);
    }
  } else {
    const headers = { 'Authorization': `Bearer ${token}` };
    const visibilityPromises = allPages.map(async (pageId) => {
      try {
        const url = `https://api.am-all.com.cn/api/page-visibility/${encodeURIComponent(pageId)}`;
        const response = await fetch(url, {
          headers: headers,
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          return { pageId, visible: !!(data && data.visible) };
        }
        return { pageId, visible: false };
      } catch (e) {
        console.warn(`检查页面 ${pageId} 可见性失败:`, e);
        return { pageId, visible: false };
      }
    });
    
    const results = await Promise.all(visibilityPromises);
    results.forEach(result => {
      pageVisibility[result.pageId] = result.visible;
    });
  }

  const nav = document.querySelector('.sidebar-nav');
  if (nav) {
    const links = nav.querySelectorAll('a[data-page]');
    links.forEach(a => {
      const pid = a.getAttribute('data-page');
      const parentLi = a.parentElement;
      if (parentLi) {
        setDisplay(parentLi, pageVisibility[pid] || false);
      }
    });
  }

  const legacyMap = {
    'sidebar-home': 'home',
    'sidebar-download': 'download',
    'sidebar-tools': 'tools',
    'sidebar-dllpatcher': 'dllpatcher',
    'sidebar-settings': 'settings',
    'sidebar-help': 'help',
    'sidebar-fortune': 'fortune',
    'sidebar-user-settings': 'user-settings',
    'sidebar-ccb': 'ccb',
    'sidebar-exchange': 'exchange',
    'sidebar-announcement-admin': 'announcement-admin',
    'sidebar-site-admin': 'site-admin',
    'sidebar-download-admin': 'download-admin',
    'sidebar-user-manager': 'user-manager',
    'sidebar-order-entry': 'order-entry',
    'sidebar-point-shop': 'point-shop',
    'sidebar-points-shop-admin': 'points-shop-admin',
    'sidebar-point2-shop-admin': 'point2-shop-admin',
    'sidebar-credit-shop-admin': 'credit-shop-admin',
    'sidebar-redemption-code-admin': 'redemption-code-admin',
    'sidebar-emoji-admin': 'emoji-admin',
    'sidebar-forum': 'forum',
    'sidebar-forum-admin': 'forum-admin',
    'sidebar-minigame': 'minigame',
    'sidebar-user-verification': 'user-verification',
    'sidebar-verification-admin': 'verification-admin',
    'sidebar-emoney': 'emoney'
  };

  for (const [id, pid] of Object.entries(legacyMap)) {
    const el = document.getElementById(id);
    if (el) {
      const visible = pageVisibility[pid] || false;
      const targetEl = el.querySelector('a')?.parentElement || el;
      setDisplay(targetEl, visible);

      const link = el.querySelector('a') || el;
      if (!link.getAttribute('data-page')) {
        link.setAttribute('data-page', pid);
      }
    }
  }

  setTimeout(() => {
	const functionTitle = document.querySelector('.sidebar-section-title');
	const functionNav = functionTitle ? functionTitle.nextElementSibling : null;

	if (functionTitle && functionNav && functionNav.tagName === 'UL') {
	  if (!token) {
		setDisplay(functionTitle, false);
		setDisplay(functionNav, false);
	  } else {
		const functionPages = ['fortune', 'ccb', 'exchange', 'point-shop', 'minigame', 'emoney', 'forum', 'user-verification'];
		const hasVisibleFunction = functionPages.some(p => pageVisibility[p]);
		setDisplay(functionTitle, hasVisibleFunction);
		setDisplay(functionNav, hasVisibleFunction);
	  }
	}

	const adminTitle = document.getElementById('admin-section-title');
	const adminNav = document.getElementById('admin-section-nav');

	if (adminTitle && adminNav) {
	  if (!token) {
		setDisplay(adminTitle, false);
		setDisplay(adminNav, false);
	  } else {
		const adminPages = ['announcement-admin', 'site-admin', 'download-admin', 'user-manager', 
						   'order-entry', 'points-shop-admin', 'point2-shop-admin', 
						   'credit-shop-admin', 'redemption-code-admin', 'forum-admin', 
						   'verification-admin'];
		const hasVisibleAdmin = adminPages.some(p => pageVisibility[p]);
		
		setDisplay(adminTitle, hasVisibleAdmin);
		setDisplay(adminNav, hasVisibleAdmin);

		adminPages.forEach(pageId => {
		  const el = document.getElementById(`sidebar-${pageId}`);
		  if (el) {
			const visible = pageVisibility[pageId] || false;
			const targetEl = el.querySelector('a')?.parentElement || el;
			setDisplay(targetEl, visible);
		  }
		});
	  }
	}
  }, 500);
}

document.addEventListener("DOMContentLoaded", function() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          if (sidebar.classList.contains('show')) {
            setTimeout(refreshUserInfoDisplay, 300);
          }
        }
      });
    });
    
    observer.observe(sidebar, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
});

function showTempErrorMessage(element, message, duration = 3000) {
  if (!element) {
    showErrorMessage(message);
    return;
  }
  
  element.textContent = message;
  element.style.display = 'block';
  
  if (element._errorTimer) {
    clearTimeout(element._errorTimer);
  }
  
  element._errorTimer = setTimeout(() => {
    element.style.display = 'none';
    element.textContent = '';
  }, duration);
}

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    document.body.classList.add('spa-loading');
    
    fetchUserInfo(token)
      .then(() => {
      })
      .catch(error => {
        showAuthLinks();
      })
      .finally(() => {
        restoreSidebarScroll();
        document.body.classList.remove('spa-loading');
      });
  } else {
    showAuthLinks();
  }
}

function getUserRankInfo(userRank) {
  const rankInfo = {
    background: "",
    icon: "",
    text: ""
  };
  
  switch(userRank) {
    case 0:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_normal.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_1.png';
      rankInfo.text = '普通用户';
      break;
    case 1:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_bronze.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_2.png';
      rankInfo.text = '初级用户';
      break;
    case 2:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_silver.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_3.png';
      rankInfo.text = '中级用户';
      break;
    case 3:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_gold.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_4.png';
      rankInfo.text = '高级用户';
      break;
    case 4:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_platinum.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_5.png';
      rankInfo.text = '贵宾用户';
      break;
    case 5:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_rainbow.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_6.png';
      rankInfo.text = '管理员';
      break;
    default:
      rankInfo.background = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_normal.png';
      rankInfo.icon = 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_1.png';
      rankInfo.text = '普通用户';
  }
  
  return rankInfo;
}

function fetchUserInfo(token) {
  return secureFetch('https://api.am-all.com.cn/api/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(user => {
    if (!user || user.error) {
      throw new Error(user?.error || '获取用户信息失败');
    }
    
    currentUser = user;
    updateUserInfo(user);
    showUserInfo();
    setupUserDropdown();
    localStorage.setItem('userInfo', JSON.stringify(user));

    return fetchUserPermissions(token).then(permissions => {
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
      updateSidebarVisibility(currentUser);
      
      return currentUser;
    });
  })
  .catch(error => {
    console.error('获取用户信息错误:', error);
    throw error;
  });
}

function fetchUserPermissions(token) {
  return secureFetch('https://api.am-all.com.cn/api/admin/users/permissions/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(permissions => {
    return permissions;
  })
  .catch(error => {
    console.error('获取用户权限失败:', error);
    return {};
  });
}

function updateUserInfo(user) {
  const defaultAvatarUrl = 'https://api.am-all.com.cn/avatars/default_avatar.png';
  const rankInfo = getUserRankInfo(user.user_rank || 0);

  if (typeof updateUserInfoDisplay === 'function') {
    updateUserInfoDisplay(user);
  }

  const dropdownCredit = document.getElementById('dropdown-credit');
  if (dropdownCredit) {
    dropdownCredit.innerHTML = `<i class="fas fa-star me-2"></i>CREDIT: ${user.credit || 0}`;
  }

  const settingsCredit = document.getElementById('settings-credit');
  if (settingsCredit) {
    settingsCredit.textContent = user.credit || 0;
  }

  let avatarUrl = defaultAvatarUrl;
	if (user.avatar) {
	  if (user.avatar.startsWith('http')) {
		avatarUrl = user.avatar;
	  } else {
		avatarUrl = `https://api.am-all.com.cn/avatars/${user.avatar}`;
	  }
	}

  const userAvatarPc = document.getElementById('user-avatar-pc');
  const userNicknamePc = document.getElementById('user-nickname-pc');
  const userUidPc = document.getElementById('user-uid-pc');
  const userInfoPc = document.getElementById('user-info-pc');
  const dropdownUid = document.getElementById('dropdown-uid');
  const dropdownRank = document.getElementById('dropdown-rank');
  const dropdownPoints = document.getElementById('dropdown-points');
  const userAvatarMobile = document.getElementById('user-avatar-mobile');
  const userNicknameMobile = document.getElementById('user-nickname-mobile');
  const userEmailMobile = document.getElementById('user-email-mobile');
  const userUidMobile = document.getElementById('user-uid-mobile');
  const userPointsMobile = document.getElementById('user-points-mobile');
  const settingsAvatar = document.getElementById('settings-avatar');
  const settingsUsername = document.getElementById('settings-username');
  const settingsEmail = document.getElementById('settings-email');
  const settingsUid = document.getElementById('settings-uid');
  const settingsPoints = document.getElementById('settings-points');
  const settingsPoint2 = document.getElementById('settings-point2');
  const settingsTotalPoints = document.getElementById('settings-total-points');
  const nicknameInput = document.getElementById('settings-nickname');
  const sidebarUserArea = document.querySelector('.sidebar-user-area');

  if (userInfoPc) {
    userInfoPc.style.setProperty('--user-rank-bg', `url(${rankInfo.background})`);
    
    let rankIcon = document.getElementById('user-rank-icon-pc');
    if (!rankIcon) {
      rankIcon = document.createElement('img');
      rankIcon.id = 'user-rank-icon-pc';
      rankIcon.className = 'user-rank-icon';
      userInfoPc.appendChild(rankIcon);
    }
    rankIcon.src = rankInfo.icon;
  }

if (userAvatarPc) {
  let avatarWrapper = userAvatarPc.closest('.user-avatar-wrapper-pc');
  
  if (!avatarWrapper) {
    avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'user-avatar-wrapper-pc';

    const parent = userAvatarPc.parentElement;
    const nextSibling = userAvatarPc.nextSibling;

    avatarWrapper.appendChild(userAvatarPc);

    if (nextSibling) {
      parent.insertBefore(avatarWrapper, nextSibling);
    } else {
      parent.appendChild(avatarWrapper);
    }
  }

  userAvatarPc.src = avatarUrl;

  const oldIcons = avatarWrapper.querySelectorAll('.user-state-icon, .user-auth-icon-official, .user-auth-icon-personal, .avatar-effect-rainbow');
  oldIcons.forEach(icon => icon.remove());

  if (user.user_rank === 5) {
    const effect = document.createElement('div');
    effect.className = 'avatar-effect-rainbow';
    avatarWrapper.appendChild(effect);
  }

  const stateIcon = document.createElement('img');
  stateIcon.className = 'user-state-icon';
  
  switch(user.banState || 0) {
    case 0:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs0.png';
      stateIcon.title = '正常';
      break;
    case 1:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs1.png';
      stateIcon.title = '受限';
      break;
    case 2:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs2.png';
      stateIcon.title = '封禁';
      break;
    default:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs0.png';
      stateIcon.title = '正常';
  }
  avatarWrapper.appendChild(stateIcon);

  const authType = user.account_auth || 0;
  
  if (authType === 1) {
    const authIcon = document.createElement('img');
    authIcon.className = 'user-auth-icon-personal';
    authIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/account/account_auth_1.png';
    authIcon.title = '个人认证';
    avatarWrapper.appendChild(authIcon);
  } else if (authType === 2) {
    const authIcon = document.createElement('img');
    authIcon.className = 'user-auth-icon-official';
    authIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/account/account_auth_2.png';
    authIcon.title = '官方认证';
    avatarWrapper.appendChild(authIcon);
  }
}
    
  if (userNicknamePc) {
    userNicknamePc.textContent = user.nickname || user.username;
  }
  if (userUidPc) {
    userUidPc.textContent = user.email || '未设置邮箱';
  }
  
  if (dropdownUid) {
    dropdownUid.textContent = `UID: ${user.uid}`;
  }
  
  if (dropdownRank) {
    dropdownRank.innerHTML = `<i class="fas fa-crown me-2"></i>用户组: ${rankInfo.text}`;
  }

  if (dropdownPoints) {
    const totalPoints = (user.points || 0) + (user.point2 || 0);
    dropdownPoints.innerHTML = `<i class="fas fa-coins me-2"></i>积分: ${totalPoints}`;
  }

if (userAvatarMobile) {
  let avatarWrapper = userAvatarMobile.closest('.user-avatar-wrapper-mobile');
  
  if (!avatarWrapper) {
    avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'user-avatar-wrapper-mobile';

    const parent = userAvatarMobile.parentElement;
    const nextSibling = userAvatarMobile.nextSibling;

    avatarWrapper.appendChild(userAvatarMobile);

    if (nextSibling) {
      parent.insertBefore(avatarWrapper, nextSibling);
    } else {
      parent.appendChild(avatarWrapper);
    }
  }

  userAvatarMobile.src = avatarUrl;

  const oldIcons = avatarWrapper.querySelectorAll('.user-state-icon-mobile, .user-auth-icon-mobile, .avatar-effect-rainbow');
  oldIcons.forEach(icon => icon.remove());

  if (user.user_rank === 5) {
    const effect = document.createElement('div');
    effect.className = 'avatar-effect-rainbow';
    avatarWrapper.appendChild(effect);
  }

  const stateIcon = document.createElement('img');
  stateIcon.className = 'user-state-icon-mobile';
  
  switch(user.banState || 0) {
    case 0:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs0.png';
      stateIcon.title = '正常';
      break;
    case 1:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs1.png';
      stateIcon.title = '受限';
      break;
    case 2:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs2.png';
      stateIcon.title = '封禁';
      break;
    default:
      stateIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/banState/bs0.png';
      stateIcon.title = '正常';
  }
  avatarWrapper.appendChild(stateIcon);

  const authType = user.account_auth || 0;
  
  if (authType === 1 || authType === 2) {
    const authIcon = document.createElement('img');
    authIcon.className = 'user-auth-icon-mobile';
    
    if (authType === 1) {
      authIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/account/account_auth_1.png';
      authIcon.title = '个人认证';
    } else {
      authIcon.src = 'https://oss.am-all.com.cn/asset/img/other/dc/account/account_auth_2.png';
      authIcon.title = '官方认证';
    }
    
    avatarWrapper.appendChild(authIcon);
  }
}
  
  if (userNicknameMobile) {
    userNicknameMobile.textContent = user.nickname || user.username;
  }
  if (userUidMobile) {
    userUidMobile.textContent = `UID: ${user.uid}`;
  }
  if (userPointsMobile) {
    const totalPoints = (user.points || 0) + (user.point2 || 0);
    userPointsMobile.textContent = `积分: ${totalPoints}`;
  }
  if (userEmailMobile) {
    userEmailMobile.textContent = user.email || '未设置邮箱';
  }

  if (settingsAvatar) {
    settingsAvatar.src = avatarUrl;
  }
  
if (settingsUsername) {
  const displayText = user.nickname ? 
    `${user.nickname} (${user.username})` : 
    user.username;
  settingsUsername.textContent = displayText;
}
  if (settingsEmail) {
    settingsEmail.textContent = user.email || '未设置';
  }
  if (settingsUid) {
    settingsUid.textContent = user.uid;
  }

	const settingsUserState = document.getElementById('settings-user-state');
	if (settingsUserState) {
	  let stateBadge = '';
	  let stateText = '';
	  
	  switch(user.banState || 0) {
		case 0:
		  stateBadge = 'state-normal';
		  stateText = '正常';
		  break;
		case 1:
		  stateBadge = 'state-limited';
		  stateText = '受限';
		  break;
		case 2:
		  stateBadge = 'state-banned';
		  stateText = '封禁';
		  break;
		default:
		  stateBadge = 'state-normal';
		  stateText = '正常';
	  }
	  
	  settingsUserState.innerHTML = `<span class="user-state-badge ${stateBadge}">${stateText}</span>`;
	}
  if (settingsPoints) {
    settingsPoints.textContent = user.points || 0;
  }
  if (settingsPoint2) {
    settingsPoint2.textContent = user.point2 || 0;
  }
  if (settingsTotalPoints) {
    const totalPoints = (user.points || 0) + (user.point2 || 0);
    settingsTotalPoints.textContent = totalPoints;
  }
  
  if (nicknameInput) {
    nicknameInput.value = user.nickname || '';
    document.getElementById('settings-nickname-counter').textContent = (user.nickname || '').length;
  }

  if (sidebarUserArea) {
    sidebarUserArea.style.setProperty('--user-rank-bg', `url(${rankInfo.background})`);
    
    let rankIconMobile = document.getElementById('user-rank-icon-mobile');
    if (!rankIconMobile) {
      rankIconMobile = document.createElement('img');
      rankIconMobile.id = 'user-rank-icon-mobile';
      rankIconMobile.className = 'user-rank-icon-mobile';
      sidebarUserArea.appendChild(rankIconMobile);
    }
    rankIconMobile.src = rankInfo.icon;
  }
}

function updateUserCredit(credit) {
  if (currentUser) {
    currentUser.credit = credit;

    const dropdownCredit = document.getElementById('dropdown-credit');
    if (dropdownCredit) {
      dropdownCredit.innerHTML = `<i class="fas fa-star me-2"></i>CREDIT: ${credit}`;
    }
    
    const settingsCredit = document.getElementById('settings-credit');
    if (settingsCredit) {
      settingsCredit.textContent = credit;
    }

    localStorage.setItem('userInfo', JSON.stringify(currentUser));
  }
}

function setupUserDropdown() {
  const userInfoPc = document.getElementById('user-info-pc');
  const userDropdown = userInfoPc ? userInfoPc.querySelector('.user-dropdown') : null;

  if (userInfoPc && userDropdown) {
    let dropdownTimeout;
    
    userInfoPc.addEventListener('mouseenter', () => {
      clearTimeout(dropdownTimeout);
      userDropdown.style.display = 'block';
      setTimeout(() => {
        userDropdown.style.opacity = '1';
        userDropdown.style.transform = 'translateY(0)';
      }, 10);
    });

    userInfoPc.addEventListener('mouseleave', () => {
      dropdownTimeout = setTimeout(() => {
        userDropdown.style.opacity = '0';
        userDropdown.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          userDropdown.style.display = 'none';
        }, 200);
      }, 300);
    });

    userDropdown.addEventListener('mouseenter', () => {
      clearTimeout(dropdownTimeout);
    });

    userDropdown.addEventListener('mouseleave', () => {
      userDropdown.style.opacity = '0';
      userDropdown.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        userDropdown.style.display = 'none';
      }, 200);
    });
  }
}

function showUserInfo() {
  const authLinksPc = document.getElementById('auth-links-pc');
  const userInfoPc = document.getElementById('user-info-pc');
  
  if (authLinksPc) authLinksPc.style.display = 'none';
  if (userInfoPc) userInfoPc.style.display = 'flex';

  const authLinksMobile = document.getElementById('auth-links-mobile');
  const userInfoMobile = document.getElementById('user-info-mobile');
  
  if (authLinksMobile) authLinksMobile.style.display = 'none';
  if (userInfoMobile) userInfoMobile.style.display = 'block';

  try {
    if (typeof updateSidebarVisibility === 'function') {
      updateSidebarVisibility(window.currentUser || null);
    }
  } catch (e) {
    console.warn('updateSidebarVisibility 失败', e);
  }
}

function showAuthLinks() {
  const authLinksPc = document.getElementById('auth-links-pc');
  const userInfoPc = document.getElementById('user-info-pc');
  
  if (authLinksPc) authLinksPc.style.display = 'flex';
  if (userInfoPc) userInfoPc.style.display = 'none';

  const authLinksMobile = document.getElementById('auth-links-mobile');
  const userInfoMobile = document.getElementById('user-info-mobile');
  
  if (authLinksMobile) authLinksMobile.style.display = 'block';
  if (userInfoMobile) userInfoMobile.style.display = 'none';

  const sidebarUserArea = document.querySelector('.sidebar-user-area');
  if (sidebarUserArea) {
    sidebarUserArea.style.removeProperty('--user-rank-bg');
    const rankIconMobile = document.getElementById('user-rank-icon-mobile');
    if (rankIconMobile) {
      rankIconMobile.remove();
    }
  }

  updateSidebarVisibility(null);
}

function sendVerificationCode(email, type) {
  console.log(`发送验证码: ${email} (${type})`);
  
  const sendBtn = document.getElementById(type === 'register' ? 'send-verification-code' : 'send-reset-code');

  if (!sendBtn || sendBtn.disabled || sendBtn._timer) {
    console.log('按钮已禁用或正在倒计时，忽略点击');
    return Promise.reject(new Error('请勿重复点击'));
  }
  
  const originalText = sendBtn.innerHTML;

  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>发送中...';

  return fetch('https://api.am-all.com.cn/api/send-verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, type })
  })
  .then(response => {
    console.log(`验证码响应: ${response.status}`);
    
    if (!response.ok) {
      return response.json().then(err => { 
        throw new Error(err.error || '发送验证码失败');
      }).catch(() => {
        throw new Error(`发送验证码失败: ${response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    if (sendBtn) {
      let seconds = 60;

      sendBtn.innerHTML = '<i class="fas fa-check me-2"></i>已发送';
      sendBtn.classList.add('btn-success');

      setTimeout(() => {
        sendBtn.classList.remove('btn-success');
        sendBtn.innerHTML = `<i class="fas fa-clock me-2"></i>${seconds}秒后重试`;
        sendBtn._timer = setInterval(() => {
          seconds--;
          if (seconds < 0) {
            clearInterval(sendBtn._timer);
            sendBtn._timer = null;
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
          } else {
            sendBtn.innerHTML = `<i class="fas fa-clock me-2"></i>${seconds}秒后重试`;
          }
        }, 1000);
      }, 1000);
    }
    
    showSuccessMessage('验证码已发送至您的邮箱');
    return data;
  })
  .catch(error => {
    console.error('验证码发送失败:', error);

    if (sendBtn) {
      if (sendBtn._timer) {
        clearInterval(sendBtn._timer);
        sendBtn._timer = null;
      }
      sendBtn.innerHTML = originalText;
      sendBtn.disabled = false;
      sendBtn.classList.remove('btn-success');
    }
    
    showErrorMessage(error.message || '发送验证码失败');
    throw error;
  });
}

function verifyCode(email, code, type) {
  return fetch('https://api.am-all.com.cn/api/verify-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, code, type })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  });
}

function resetPassword(resetToken, newPassword) {
  return fetch('https://api.am-all.com.cn/api/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resetToken, newPassword })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  });
}

function handleLogin() {
  const login = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  if (!login || !password) {
    showTempErrorMessage(errorElement, '用户名/邮箱和密码不能为空');
    return;
  }

  console.log('开始登录:', login);
  
  secureFetch('https://api.am-all.com.cn/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ login, password })
  })
.then(data => {
    console.log('登录成功:', data);
    
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      showSuccessAnimation(
        '登录成功',
        `欢迎回来，${data.user.nickname || data.user.username}！`,
        2500,
        () => {
          updateUserInfo(data.user);
          showUserInfo();
          setupUserDropdown();

          if (typeof initMessageSystem === 'function') {
            setTimeout(() => {
              try {
                initMessageSystem();
                console.log('消息系统初始化成功');
              } catch (error) {
                console.error('消息系统初始化失败:', error);
              }
            }, 500);
          }

		  if (typeof initEmojiSystem === 'function') {
			setTimeout(() => {
			  try {
				initEmojiSystem();
				console.log('表情系统初始化成功');
			  } catch (error) {
				console.error('表情系统初始化失败:', error);
			  }
			}, 600);
		  }

          if (typeof initFriendsSystem === 'function') {
            setTimeout(() => {
              try {
                window.friendsSystemInitialized = true; // 设置标记
                initFriendsSystem();
                console.log('好友系统初始化成功');
              } catch (error) {
                console.error('好友系统初始化失败:', error);
              }
            }, 600);
          }

          fetchUserPermissions(data.token).then(permissions => {
            localStorage.setItem('userPermissions', JSON.stringify(permissions));
            updateSidebarVisibility(currentUser);
          });

          loadPage('home');
        }
      );
      
      return data;
    }
})
  .catch(error => {
    console.error('登录失败:', {
      error: error.message,
      status: error.status,
      details: error.details
    });
    
    let userMessage = '登录失败';
    if (error.status === 401) {
      userMessage = '用户名或密码错误';
    } else if (error.status === 500) {
      userMessage = '服务器内部错误，请稍后再试';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    showTempErrorMessage(errorElement, userMessage);
  });
}

function handleRegister() {
  const username = document.getElementById('register-username').value;
  const nickname = document.getElementById('register-nickname').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const verificationCode = document.getElementById('register-verification-code').value;
  const errorElement = document.getElementById('register-error');

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  if (!username || !password || !email || !verificationCode) {
    showTempErrorMessage(errorElement, '用户名、密码、邮箱和验证码不能为空');
    return;
  }

  if (username.length < 6 || username.length > 20) {
    showTempErrorMessage(errorElement, '用户名长度需在6-20个字符之间');
    return;
  }

  if (nickname && (nickname.length < 2 || nickname.length > 12)) {
    showTempErrorMessage(errorElement, '昵称长度需在2-12个字符之间');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showTempErrorMessage(errorElement, '邮箱格式不正确');
    return;
  }

  if (password.length < 8 || password.length > 16) {
    showTempErrorMessage(errorElement, '密码长度需在8-16个字符之间');
    return;
  }
  
  if (password !== confirmPassword) {
    showTempErrorMessage(errorElement, '两次输入的密码不一致');
    return;
  }

  showUserAgreementModal(username, nickname, email, password, verificationCode, errorElement);
}

function showUserAgreementModal(username, nickname, email, password, verificationCode, errorElement) {
  const existingModal = document.getElementById('user-agreement-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'user-agreement-modal';
  modal.className = 'modal show';
  modal.style.zIndex = '10000';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <h3>用户服务协议</h3>
        <button class="modal-close" onclick="document.getElementById('user-agreement-modal').remove()">&times;</button>
      </div>
      <div class="modal-body" style="overflow-y: auto; flex: 1; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin-bottom: 15px;">用户服务协议</h4>
          <div style="font-size: 14px; line-height: 1.6; color: #333;">
            <p><strong>1. 服务条款的接受</strong></p>
            <p>欢迎使用本网站提供的服务。通过注册并使用本网站，您同意接受以下服务条款。</p>
            
            <p><strong>2. 账号注册</strong></p>
            <p>• 请妥善保管账号密码以及用户信息</p>
            <p>• 禁止出售、转让或共享账号</p>
            
            <p><strong>3. 用户行为规范</strong></p>
            <p>• 请您在本站发言时遵守相应的国家法律和法规条例</p>
			<p>• 请不要发布违法违规、虚假内容</p>
			<p>• 请您遵守本网站的相关规则，否则您的账户可能会遭到限制或封禁</p>
            
            <p><strong>4. 积分和虚拟物品</strong></p>
            <p>• 积分和虚拟物品仅限在本网站内使用</p>
			<p>• 所有积分都不支持转换为现金</p>
            <p>• 所有积分都不支持转让给其他用户</p>
            <p>• 本站对站内所有类型积分的兑换以及使用规则拥有最终解释权</p>
            
            <p><strong>5. 隐私保护</strong></p>
            <p>• 您的用户信息以及绑定的相关信息本站会妥善保管</p>
            <p>• 本站不会向第三方泄露您的个人信息</p>
			<p>• 您的隐私信息受加密算法保护并存储到数据库中</p>
            
            <p><strong>6. 服务变更和终止</strong></p>
            <p>• 本站提供之服务有可能随时变更或关闭</p>
			<p>• 本站对站内所有功能及权限拥有最终解释权</p>
          </div>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffc107;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
            请仔细阅读以上协议内容，勾选下方复选框表示您已阅读并同意本协议的所有条款。
          </p>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; flex-direction: column; gap: 15px; padding: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" id="agreement-checkbox" style="width: 18px; height: 18px;">
          <label for="agreement-checkbox" style="margin: 0; font-size: 14px; cursor: pointer;">
            我已仔细阅读并同意《用户服务协议》
          </label>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="document.getElementById('user-agreement-modal').remove()">
            <i class="fas fa-times"></i> 不同意
          </button>
          <button id="agree-btn" class="btn btn-primary" disabled onclick="proceedWithRegistration('${encodeURIComponent(username)}', '${encodeURIComponent(nickname)}', '${encodeURIComponent(email)}', '${encodeURIComponent(password)}', '${encodeURIComponent(verificationCode)}')">
            <i class="fas fa-check"></i> 同意并注册
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);

  const checkbox = document.getElementById('agreement-checkbox');
  const agreeBtn = document.getElementById('agree-btn');
  
  checkbox.addEventListener('change', function() {
    agreeBtn.disabled = !this.checked;
    if (this.checked) {
      agreeBtn.style.opacity = '1';
      agreeBtn.style.cursor = 'pointer';
    } else {
      agreeBtn.style.opacity = '0.5';
      agreeBtn.style.cursor = 'not-allowed';
    }
  });

  agreeBtn.style.opacity = '0.5';
  agreeBtn.style.cursor = 'not-allowed';
}

window.proceedWithRegistration = function(encodedUsername, encodedNickname, encodedEmail, encodedPassword, encodedVerificationCode) {
  const modal = document.getElementById('user-agreement-modal');
  if (modal) {
    modal.remove();
  }

  const username = decodeURIComponent(encodedUsername);
  const nickname = decodeURIComponent(encodedNickname);
  const email = decodeURIComponent(encodedEmail);
  const password = decodeURIComponent(encodedPassword);
  const verificationCode = decodeURIComponent(encodedVerificationCode);
  const errorElement = document.getElementById('register-error');

  fetch('https://api.am-all.com.cn/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password, nickname, email, verificationCode })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('token', data.token);
      currentUser = data.user;
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      showSuccessAnimation(
        '注册成功',
        `欢迎加入，${nickname || username}！`,
        3000,
        () => {
          updateUserInfo(data.user);
          showUserInfo();

          if (typeof initMessageSystem === 'function') {
            setTimeout(() => {
              try {
                initMessageSystem();
                console.log('消息系统初始化成功');
              } catch (error) {
                console.error('消息系统初始化失败:', error);
              }
            }, 500);
          }
          
          loadPage('home');
        }
      );
    } else {
      throw new Error(data.error || '注册失败');
    }
  })
  .catch(error => {
    showTempErrorMessage(errorElement, error.error || '注册失败');
  });
};

function handleLogout() {
  if (typeof cleanupMessageSystem === 'function') {
    try {
      cleanupMessageSystem();
      console.log('消息系统已清理');
    } catch (error) {
      console.error('清理消息系统失败:', error);
    }
  }

  if (typeof cleanupFriendsSystem === 'function') {
    try {
      cleanupFriendsSystem();
      console.log('好友系统已清理');
    } catch (error) {
      console.error('清理好友系统失败:', error);
    }
  }

  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userPermissions');

  currentUser = null;

  showAuthLinks();

  setTimeout(() => {
    if (typeof updateSidebarVisibility === 'function') {
      updateSidebarVisibility(null);
    }
  }, 100);

  if (typeof showSuccessMessage === 'function') {
    showSuccessMessage('已成功退出登录');
  }

  loadPage('home');
}

function getAnnouncementById(id) {
  return announcementsData.find(item => item.id === id);
}

function showAnnouncementModal(id) {
  const messageModal = document.getElementById('message-modal');
  if (messageModal && messageModal.classList.contains('show')) {
    messageModal.classList.remove('show');
  }

  let modal = document.getElementById('announcement-modal');
  if (!modal) {
    const modalHTML = `
      <div id="announcement-modal" class="modal">
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <h5 id="announcement-title"></h5>
            <button type="button" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="announcement-meta">
              <span id="announcement-date"></span>
            </div>
            <div id="announcement-content" class="announcement-content"></div>
          </div>
          <div class="modal-footer">
            <button id="announcement-close" class="btn-ok">关闭</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('announcement-modal');

    document.querySelector('#announcement-modal .modal-close').addEventListener('click', () => {
      modal.classList.remove('show');
    });
    
    document.getElementById('announcement-close').addEventListener('click', () => {
      modal.classList.remove('show');
    });
    
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });
  }
  
  const announcement = getAnnouncementById(id);
  
  if (announcement) {
    const titleElement = document.getElementById('announcement-title');
    const dateElement = document.getElementById('announcement-date');
    const contentElement = document.getElementById('announcement-content');
    
    if (titleElement) titleElement.textContent = announcement.title;
    if (dateElement) dateElement.textContent = announcement.date;
    if (contentElement) contentElement.innerHTML = announcement.content;
    
    modal.classList.add('show');

    const pageLinks = modal.querySelectorAll('[data-page]');
    pageLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.remove('show');
        
        if (window.innerWidth <= 992) {
          const sidebar = document.querySelector('.sidebar');
          if (sidebar) sidebar.classList.remove('show');
          document.body.classList.remove('mobile-sidebar-open');
          document.body.classList.add('mobile-sidebar-closed');
        }
        
        loadPage(this.getAttribute('data-page'));
      });
    });
  }
}

function loadHelpDetail(id) {
  const content = document.getElementById('content-container');
  if (!content) return;
  
  content.innerHTML = pages['help-detail'];
  
  const helpData = helpContentData[id] || {
    title: "帮助主题不存在",
    content: "<p>请求的帮助内容不存在</p>"
  };
  
  document.getElementById('help-detail-title').textContent = helpData.title;
  document.getElementById('help-content').innerHTML = helpData.content;
  
  const backButton = document.querySelector('.back-button[data-page="help"]');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage('help');
    });
  }
  
  if (typeof languageModule !== 'undefined') {
    languageModule.initLanguage();
  }
}

function showLoginRequired(pageId) {
  const contentContainer = document.getElementById('content-container');
  if (!contentContainer) return;
  
  const pageNames = {
    'tools': '实用工具',
    'dllpatcher': '补丁工具',
    'fortune': '每日签到',
    'user-settings': '用户设置',
    'order-entry': '订单录入',
    'exchange': '积分兑换',
    'announcement-admin': '公告管理',
    'download': '下载中心',
    'user-manager': '用户管理'
  };
  
  const pageName = pageNames[pageId] || '此功能';
  
  contentContainer.innerHTML = `
    <div class="section">
      <div class="login-required-container">
        <div class="login-required-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h2>请登录</h2>
        <p>${pageName}需要登录后才能使用</p>
        <button class="login-btn" data-page="login">
          <i class="fas fa-sign-in-alt me-2"></i>
          立即登录
        </button>
      </div>
    </div>
  `;
  
  const loginBtn = contentContainer.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage(this.getAttribute('data-page'));
    });
  }
  
  updateActiveMenuItem('home');

  document.body.classList.remove('spa-loading');
}

function setupCharCounters() {
  const usernameInput = document.getElementById('register-username');
  const nicknameInput = document.getElementById('register-nickname');
  const passwordInput = document.getElementById('register-password');
  
  if (usernameInput) {
    usernameInput.addEventListener('input', function() {
      document.getElementById('username-counter').textContent = this.value.length;
    });
  }
  
  if (nicknameInput) {
    nicknameInput.addEventListener('input', function() {
      document.getElementById('nickname-counter').textContent = this.value.length;
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      document.getElementById('password-counter').textContent = this.value.length;
    });
  }
  
  const settingsNicknameInput = document.getElementById('settings-nickname');
  const newPasswordInput = document.getElementById('new-password');
  
  if (settingsNicknameInput) {
    settingsNicknameInput.addEventListener('input', function() {
      document.getElementById('settings-nickname-counter').textContent = this.value.length;
    });
  }
  
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function() {
      document.getElementById('new-password-counter').textContent = this.value.length;
    });
  }
}

async function getUserPermissions() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  
  try {
    const response = await fetch('https://api.am-all.com.cn/api/admin/users/permissions/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return {};
      }
      throw new Error('获取用户权限失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return {};
  }
}

function isPageAllowedByDefault(pageId, user) {
  const defaultAllowedPages = ['home', 'tools', 'dllpatcher', 'settings', 'help', 'fortune', 'exchange'];
  return defaultAllowedPages.includes(pageId);
}

function showPermissionDenied(pageId) {
  const contentContainer = document.getElementById('content-container');
  const pageNames = {
    'download': '下载中心',
    'ccb': '游戏查分',
    'announcement-admin': '公告管理',
    'site-admin': '网站管理',
    'download-admin': '下载管理',
    'order-entry': '订单录入',
    'user-manager': '用户管理'
  };
  
  const pageName = pageNames[pageId] || '此功能';
  
  contentContainer.innerHTML = `
    <div class="section">
      <div class="permission-denied-container">
        <div class="permission-denied-icon">
          <i class="fas fa-ban"></i>
        </div>
        <h2>权限不足</h2>
        <p>您没有访问${pageName}的权限</p>
        <p>请联系管理员获取权限</p>
        <button class="back-btn" data-page="home">
          <i class="fas fa-arrow-left me-2"></i>
          返回首页
        </button>
      </div>
    </div>
  `;
  
  const backBtn = contentContainer.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage(this.getAttribute('data-page'));
    });
  }
}

async function loadPage(pageId) {
  const contentContainer = document.getElementById('content-container');
  if (!contentContainer) return;

  if (PROTECTED_PAGES.includes(pageId)) {
    const token = localStorage.getItem('token');
    if (!token) {
      showLoginRequired(pageId);
      return;
    }
    
    try {
      const response = await fetch(`https://api.am-all.com.cn/api/check-permission?page=${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) { 
        if (response.status === 401) { showLoginRequired(pageId); } 
        else if (typeof showPermissionDenied === 'function') { showPermissionDenied(pageId); }
        return; 
      }
      
      const data = await response.json();
      if (!data.hasAccess) {
        showPermissionDenied(pageId);
        return;
      }
    } catch (error) {
      console.error('检查权限失败:', error);
      showLoginRequired(pageId);
      return;
    }
  }
  
  document.body.classList.add('spa-loading');
  
  contentContainer.scrollTop = 0;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  
setTimeout(() => {

	if (pageId === 'forum') {
	  if (typeof window.ForumModule !== 'undefined' && window.ForumModule.init) {
		setTimeout(() => {
		  window.ForumModule.init();
		}, 100);
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>论坛模块未正确加载</p></div>';
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'forum-admin') {
	  if (typeof window.ForumAdminModule !== 'undefined' && window.ForumAdminModule.init) {
		setTimeout(() => {
		  window.ForumAdminModule.init();
		}, 100);
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>论坛管理模块未正确加载</p></div>';
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

    if (pageId === 'tools') {
      if (typeof initToolsDisplay === 'function') {
        initToolsDisplay();
      } else {
        console.error('initToolsDisplay 函数未定义');
        contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>工具页面模块未加载</p></div>';
      }
      
      if (typeof languageModule !== 'undefined') {
        languageModule.initLanguage();
      }
      
      document.body.classList.remove('spa-loading');
      updateActiveMenuItem(pageId);
      return;
    }

    if (pageId === 'message-center') {
      if (typeof renderMessageCenter === 'function') {
        renderMessageCenter();
      } else {
        contentContainer.innerHTML = '<div class="section"><h1>消息中心</h1><p>消息系统加载失败</p></div>';
      }

      setTimeout(() => {
        document.body.classList.remove('spa-loading');
        updateActiveMenuItem(pageId);
      }, 100);
      
      return;
    }

	if (pageId === 'point-shop' || pageId === 'points-shop-admin' || pageId === 'point2-shop-admin') {
	  contentContainer.innerHTML = '<div class="section"><div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div></div>';
	  
	  if (pageId === 'point-shop' && typeof initPointShop === 'function') {
		initPointShop();
	  } else if (pageId === 'points-shop-admin' && typeof initShopAdmin === 'function') {
		initShopAdmin('points');
	  } else if (pageId === 'point2-shop-admin' && typeof initShopAdmin === 'function') {
		initShopAdmin('point2');
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'dllpatcher') {
	  if (typeof renderPatcherCategories === 'function') {
		renderPatcherCategories();
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>补丁工具模块未正确加载</p></div>';
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'patcher-admin') {
	  if (typeof renderPatcherAdmin === 'function') {
		renderPatcherAdmin();
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>补丁工具管理模块未正确加载</p></div>';
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'credit-shop-admin') {
	  contentContainer.innerHTML = '<div class="section"><div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div></div>';
	  
	  if (typeof initCreditShopAdmin === 'function') {
		initCreditShopAdmin();
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'redemption-code-admin') {
	  contentContainer.innerHTML = '<div class="section"><div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div></div>';

	  if (typeof initRedemptionCodeAdmin === 'function') {
		initRedemptionCodeAdmin();
	  }

	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'emoney') {
	  contentContainer.innerHTML = '<div class="section"><div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div></div>';

	  if (typeof window.initEmoneyPage === 'function') {
		window.initEmoneyPage();
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>电子支付模块未正确加载</p></div>';
	  }

	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'emoji-admin') {
	  contentContainer.innerHTML = '<div class="section"><div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div></div>';
	  
	  if (typeof renderEmojiManagement === 'function') {
		renderEmojiManagement();
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'minigame') {
	  contentContainer.innerHTML = '<div class="section"><div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div></div>';
	  
	  if (typeof renderMinigamePage === 'function') {
		renderMinigamePage().then(html => {
		  contentContainer.innerHTML = html;
		  if (typeof initMinigamePage === 'function') {
			initMinigamePage();
		  }
		}).catch(error => {
		  contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>小游戏模块加载失败: ' + error.message + '</p></div>';
		});
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>小游戏模块未正确加载</p></div>';
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

	if (pageId === 'minigame-play') {
	  const gameId = sessionStorage.getItem('currentGameId');
	  
	  console.log('加载minigame-play页面, gameId:', gameId);
	  
	  if (typeof renderMinigamePlayPage === 'function') {
		if (gameId) {
		  contentContainer.innerHTML = renderMinigamePlayPage({ gameId });
		} else {
		  contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>游戏ID缺失,请从游戏列表选择游戏</p><button class="btn btn-primary" onclick="window.loadPage(\'minigame\')">返回游戏列表</button></div>';
		}
	  } else {
		contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>小游戏播放模块未加载</p></div>';
	  }
	  
	  document.body.classList.remove('spa-loading');
	  updateActiveMenuItem(pageId);
	  return;
	}

    if (pageId === 'system-message-admin') {
      document.body.classList.add('spa-loading');
    
      try {
        if (typeof renderSystemMessageAdmin === 'function') {
          renderSystemMessageAdmin();
        }
      } finally {
        document.body.classList.remove('spa-loading');
        updateActiveMenuItem(pageId);
    }
    return;
  }
    
    if (pages[pageId]) {
      contentContainer.innerHTML = pages[pageId];
      
      if (typeof languageModule !== 'undefined') {
        languageModule.initLanguage();
      }
      
if (pageId === 'user-settings') {
  const token = localStorage.getItem('token');
  if (token) {
    fetchUserInfo(token);
  } else {
    loadPage('login');
  }

  setTimeout(() => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabBtns.length > 0) {
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-tab');

          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${targetTab}-tab`) {
              content.classList.add('active');

              if (targetTab === 'privacy' && typeof renderPrivacySettings === 'function') {
                renderPrivacySettings();
              }
            }
          });
        });
      });
    }

    const savePrivacyBtn = document.getElementById('save-privacy-btn');
    if (savePrivacyBtn) {
      savePrivacyBtn.addEventListener('click', savePrivacySettings);
    }

    const avatarWrapper = document.querySelector('.avatar-wrapper');
    const avatarUpload = document.getElementById('avatar-upload');
    
    if (avatarWrapper && avatarUpload) {
      avatarWrapper.addEventListener('click', () => {
        avatarUpload.click();
      });
    }

    const bindingSection = document.getElementById('ccb-binding-section');
    const noBindingMessage = document.getElementById('no-binding-message');
    
    if (currentUser && currentUser.game_server && currentUser.keychip && currentUser.guid) {
      if (bindingSection) bindingSection.style.display = 'block';
      if (noBindingMessage) noBindingMessage.style.display = 'none';
    } else {
      if (bindingSection) bindingSection.style.display = 'none';
      if (noBindingMessage) noBindingMessage.style.display = 'block';
    }

    const usernameDisplay = document.getElementById('settings-username-display');
    const emailDisplay = document.getElementById('settings-email-display');
    
    if (usernameDisplay && currentUser) {
      usernameDisplay.textContent = currentUser.username || '-';
    }
    if (emailDisplay && currentUser) {
      emailDisplay.textContent = currentUser.email || '未设置';
    }
  }, 100);

  const changeAvatarBtn = document.getElementById('change-avatar-btn');
  const avatarUpload = document.getElementById('avatar-upload');
  const cancelAvatarBtn = document.getElementById('cancel-avatar-btn');
  
  if (avatarUpload) {
    avatarUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 500 * 1024) {
          showErrorMessage('头像大小不能超过500KB');
          return;
        }
        
        if (cropper) {
          cropper.destroy();
          cropper = null;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          const cropContainer = document.getElementById('avatar-crop-container');
          const cropSection = document.getElementById('avatar-crop-section');
          
          cropContainer.innerHTML = '';
          const img = document.createElement('img');
          img.id = 'avatar-to-crop';
          img.src = event.target.result;
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.display = 'block';
          
          cropContainer.appendChild(img);

          img.onload = function() {
            cropper = new Cropper(img, {
              aspectRatio: 1,
              viewMode: 1,
              autoCropArea: 0.8,
              movable: true,
              zoomable: true,
              rotatable: false,
              scalable: true,
              guides: false,
              center: true,
              highlight: true,
              background: true,
              cropBoxResizable: true,
              cropBoxMovable: true,
              dragMode: 'move',
              minCropBoxWidth: 100,
              minCropBoxHeight: 100,
              responsive: true,
              restore: true,
              checkCrossOrigin: true,
              checkOrientation: true,
              modal: true,
              toggleDragModeOnDblclick: false
            });
          };
          
          cropSection.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  if (cancelAvatarBtn) {
    cancelAvatarBtn.addEventListener('click', function() {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      document.getElementById('avatar-crop-section').style.display = 'none';
      document.getElementById('avatar-upload').value = '';
    });
  }
  
  const saveAvatarBtn = document.getElementById('save-avatar-btn');
  if (saveAvatarBtn) {
    saveAvatarBtn.addEventListener('click', function() {
      if (cropper) {
        const canvas = cropper.getCroppedCanvas({
          width: 200,
          height: 200
        });
        
        canvas.toBlob(function(blob) {
          if (blob.size > 150 * 1024) {
            showErrorMessage('裁剪后的头像大小不能超过150KB');
            return;
          }
          
          const formData = new FormData();
          formData.append('avatar', blob, 'avatar.png');
          
          const token = localStorage.getItem('token');
          fetch('https://api.am-all.com.cn/api/user/avatar', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              updateUserInfo(data.user);
              document.getElementById('avatar-crop-section').style.display = 'none';
              document.getElementById('avatar-upload').value = '';
              showSuccessMessage('头像更新成功');
              
              if (cropper) {
                cropper.destroy();
                cropper = null;
              }
            } else {
              showErrorMessage('头像更新失败: ' + (data.error || '未知错误'));
            }
          })
          .catch(error => {
            console.error('头像更新错误:', error);
            showErrorMessage('头像更新失败');
          });
        }, 'image/png', 0.9);
      } else {
        showErrorMessage('请先选择并裁剪头像');
      }
    });
  }
  
  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      const nickname = document.getElementById('settings-nickname').value;
      
      if (nickname && (nickname.length < 2 || nickname.length > 12)) {
        showErrorMessage('昵称长度需在2-12个字符之间');
        return;
      }
      
      const token = localStorage.getItem('token');
      fetch('https://api.am-all.com.cn/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          updateUserInfo(data.user);
          showSuccessMessage('个人信息更新成功');
        } else {
          showErrorMessage('个人信息更新失败: ' + (data.error || '未知错误'));
        }
      })
      .catch(error => {
        console.error('个人信息更新错误:', error);
        showErrorMessage('个人信息更新失败');
      });
    });
  }

  setTimeout(displayCCBBindingInfo, 100);
  setTimeout(displayShippingBindingInfo, 100);
  
  const savePasswordBtn = document.getElementById('save-password-btn');
  if (savePasswordBtn) {
    savePasswordBtn.addEventListener('click', function() {
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        showErrorMessage('请填写所有密码字段');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showErrorMessage('两次输入的新密码不一致');
        return;
      }
      
      if (newPassword.length < 8 || newPassword.length > 16) {
        showErrorMessage('密码长度需在8-16个字符之间');
        return;
      }
      
      const token = localStorage.getItem('token');
      fetch('https://api.am-all.com.cn/api/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showSuccessMessage('密码更新成功');
          document.getElementById('current-password').value = '';
          document.getElementById('new-password').value = '';
          document.getElementById('confirm-password').value = '';
          document.getElementById('new-password-counter').textContent = '0';
        } else {
          showErrorMessage('密码更新失败: ' + (data.error || '未知错误'));
        }
      })
      .catch(error => {
        console.error('密码更新错误:', error);
        showErrorMessage('密码更新失败');
      });
    });
  }

  const nicknameInput = document.getElementById('settings-nickname');
  if (nicknameInput) {
    nicknameInput.addEventListener('input', function() {
      const counter = document.getElementById('settings-nickname-counter');
      if (counter) {
        counter.textContent = this.value.length;
      }
    });
  }
  
  const newPasswordInput = document.getElementById('new-password');
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function() {
      const counter = document.getElementById('new-password-counter');
      if (counter) {
        counter.textContent = this.value.length;
      }
    });
  }
}

if (pageId === 'settings') {
  const languageSelect = document.getElementById('language-select');
  const rememberLanguage = document.getElementById('remember-language');
  
  if (languageSelect) {
    languageSelect.value = localStorage.getItem('language') || 'zh-cn';
  }
  if (rememberLanguage) {
    rememberLanguage.checked = localStorage.getItem('rememberLanguage') === 'true';
  }

  if (languageSelect) {
    languageSelect.addEventListener('change', function() {
      const lang = this.value;
      const remember = document.getElementById('remember-language').checked;

      localStorage.setItem('language', lang);
      if (remember) {
        localStorage.setItem('savedLanguage', lang);
      }

      if (typeof languageModule !== 'undefined' && languageModule.setLanguage) {
        const loadingEl = document.querySelector('.spa-loader');
        if (loadingEl) {
          loadingEl.style.display = 'flex';
        }

        setTimeout(() => {
          languageModule.setLanguage(lang);

          if (loadingEl) {
            loadingEl.style.display = 'none';
          }

          if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('语言已切换为: ' + (lang === 'zh-cn' ? '中文' : lang === 'en-us' ? 'English' : '日本語'));
          }
        }, 50);
      }

      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);

    });
  }

  if (rememberLanguage) {
    rememberLanguage.addEventListener('change', function() {
      localStorage.setItem('rememberLanguage', this.checked);
      if (this.checked) {
        const currentLang = document.getElementById('language-select').value;
        localStorage.setItem('savedLanguage', currentLang);
        showSuccessMessage('已启用语言记忆功能');
      } else {
        localStorage.removeItem('savedLanguage');
        showSuccessMessage('已关闭语言记忆功能');
      }
    });
  }

  setTimeout(() => {
    if (typeof window.initCursorSettings === 'function') {
      window.initCursorSettings();
    }
    else if (typeof CursorManager !== 'undefined' && CursorManager.initSettingsUI) {
      CursorManager.initSettingsUI();
    }
    else {
      console.log('正在手动初始化鼠标设置界面...');
      initCursorSettingsManually();
    }
  }, 100);

  const saveBtn = document.getElementById('save-settings');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      const language = document.getElementById('language-select').value;
      const rememberLanguage = document.getElementById('remember-language').checked;

      localStorage.setItem('language', language);
      localStorage.setItem('rememberLanguage', rememberLanguage);
      
      if (rememberLanguage) {
        localStorage.setItem('savedLanguage', language);
      }

      showSuccessMessage('设置已保存');

    });
  }
}

function initCursorSettingsManually() {
  const container = document.getElementById('cursor-preview-container');
  if (!container) {
    console.error('找不到鼠标预览容器');
    return;
  }
  
  const currentStyle = localStorage.getItem('cursorStyle') || 'default';

  const cursorStyles = {
    default: {
      name: '默认',
      description: '系统默认鼠标',
      icon: 'fas fa-mouse-pointer',
      value: 'default'
    },
    custom1: {
      name: '井盖',
      description: '个性化鼠标样式',
      icon: 'fas fa-circle',
      value: 'custom1'
    },
    custom2: {
      name: 'まひろ',
      description: '可爱风格鼠标',
      icon: 'fas fa-heart',
      value: 'custom2'
    }
  };

  let html = '<div class="cursor-preview">';
  
  Object.entries(cursorStyles).forEach(([key, style]) => {
    const isActive = key === currentStyle;
    html += `
      <div class="cursor-option ${isActive ? 'active' : ''}" data-cursor="${key}">
        <div class="cursor-option-icon">
          <i class="${style.icon}"></i>
        </div>
        <div class="cursor-option-name">${style.name}</div>
        <div class="cursor-option-desc">${style.description}</div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.cursor-option').forEach(option => {
    option.addEventListener('click', function(e) {
      const cursorType = this.dataset.cursor;

      document.querySelectorAll('.cursor-option').forEach(opt => {
        opt.classList.remove('active');
      });
      this.classList.add('active');

      localStorage.setItem('cursorStyle', cursorType);

      applyCursorStyle(cursorType);

      if (typeof showSuccessMessage === 'function') {
        showSuccessMessage(`鼠标样式已切换为: ${cursorStyles[cursorType].name}`);
      }
    });
  });
}

		function applyCursorStyle(styleName) {
		  document.body.classList.remove('cursor-default', 'cursor-custom1', 'cursor-custom2');
		  document.body.classList.add(`cursor-${styleName}`);
}

		if (pageId === 'user-manager') {
		  if (typeof initUserManager === 'function') {
			setTimeout(initUserManager, 100);
		  }
		}
		
		if (pageId === 'download') {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        if (false && userInfo && userInfo.user_rank <= 0) {
          showPermissionDenied('download');
        }

        setTimeout(() => {
          if (typeof initDownloadPage === 'function') {
            initDownloadPage();
          } else {
            console.error('initDownloadPage 函数未定义');
            document.body.classList.remove('spa-loading');
          }
        }, 100);
      }
      if (pageId === 'ccb') {
        try { if (typeof initCCBPage === 'function') setTimeout(initCCBPage, 50); }
        catch(e){ console.error('初始化 ccb 页面失败:', e); }
      }

      if (pageId === 'download-detail') {
        const urlParams = new URLSearchParams(window.location.search);
        const downloadId = urlParams.get('id');
        
        if (downloadId && typeof loadDownloadDetail === 'function') {
          setTimeout(() => loadDownloadDetail(downloadId), 100);
        }
      }

		if (pageId === 'download-admin') {
		  if (typeof initDownloadAdminPage === 'function') {
			setTimeout(initDownloadAdminPage, 100);
		  }
		}

		if (pageId === 'fortune') {
		  setTimeout(() => {
			if (typeof window.FortuneModule === 'undefined') {
			  console.error('运势模块未加载');
			  const contentContainer = document.getElementById('content-container');
			  if (contentContainer) {
				contentContainer.innerHTML = `
				  <div class="section">
					<div class="error-state">
					  <i class="fas fa-exclamation-triangle"></i>
					  <h2>加载失败</h2>
					  <p>运势模块未正确加载，请刷新页面重试</p>
					</div>
				  </div>
				`;
			  }
			  return;
			}

			window.FortuneModule.reset();
			window.FortuneModule.init();
		  }, 100);
		}
      
	if (pageId === 'home') {
	  try {
		if (typeof window.initAnnouncementSystem === 'function') {
		  setTimeout(() => {
			try {
			  window.initAnnouncementSystem();
			} catch (e) {
			  console.error('初始化公告系统失败:', e);
			}
		  }, 100);
		} else {
		  console.warn('initAnnouncementSystem 不是函数');
		}
	  } catch (e) {
		console.error('公告系统初始化异常:', e);
	  }

	  try {
		if (typeof window.loadHomeAdvertisementsDebounced === 'function') {
		  setTimeout(() => {
			try {
			  const needsRefresh = localStorage.getItem('homeAdsNeedRefresh') === 'true';
			  
			  if (needsRefresh) {
				window.loadHomeAdvertisementsDebounced(true, 500);
			  } else {
				window.loadHomeAdvertisementsDebounced(false, 500);
			  }
			} catch (e) {
			  console.error('[SPA] 加载广告失败:', e);
			}
		  }, 400);
		} else {
		  console.warn('[SPA] loadHomeAdvertisementsDebounced 函数未定义');
		}
	  } catch (e) {
		console.error('[SPA] 广告系统初始化异常:', e);
	  }
	}

      if (pageId === 'announcement-admin') {
        if (typeof initAnnouncementAdminSystem === 'function') {
          setTimeout(initAnnouncementAdminSystem, 100);
        }
      }

	  if (pageId === 'user-verification') {
		if (typeof initVerificationHome === 'function') {
		  setTimeout(() => {
			initVerificationHome();
		  }, 100);
		} else {
		  contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>认证模块未正确加载</p></div>';
		}
		
		document.body.classList.remove('spa-loading');
		updateActiveMenuItem(pageId);
		return;
	  }

	  if (pageId === 'verification-admin') {
		if (typeof initVerificationAdmin === 'function') {
		  setTimeout(() => {
			initVerificationAdmin();
		  }, 100);
		} else {
		  contentContainer.innerHTML = '<div class="section"><h1>加载失败</h1><p>认证管理模块未正确加载</p></div>';
		}
		
		document.body.classList.remove('spa-loading');
		updateActiveMenuItem(pageId);
		return;
	  }

      if (pageId === 'order-entry') {
        initOrderEntryPage();
      }
      
	if (pageId === 'exchange') {
	  document.getElementById('redeem-order-btn').addEventListener('click', handleRedeemOrder);
	  document.getElementById('redeem-code-btn').addEventListener('click', handleRedeemCode);
	  document.getElementById('view-order-history-btn')?.addEventListener('click', () => {
		showRedemptionHistory('order');
	  });
	  document.getElementById('view-code-history-btn')?.addEventListener('click', () => {
		showRedemptionHistory('code');
	  });
	}

	function handleRedeemCode() {
	  const codeInput = document.getElementById('redeem-code-input').value;
	  const resultDiv = document.getElementById('code-exchange-result');
	  
	  if (!codeInput) {
		resultDiv.innerHTML = '<div class="error">请输入兑换码</div>';
		return;
	  }
	  
	  const token = localStorage.getItem('token');
	  
	  secureFetch('https://api.am-all.com.cn/api/redeem-code', {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${token}`,
		  'Content-Type': 'application/json'
		},
		body: JSON.stringify({ code: codeInput })
	  })
	  .then(data => {
		if (data.success) {
		  resultDiv.innerHTML = `<div class="success">兑换成功：${data.message}</div>`;

		  if (data.user) {
			currentUser = data.user;
			updateUserInfo(currentUser);
		  }
		  
		  document.getElementById('redeem-code-input').value = '';
		} else {
		  throw new Error(data.error || '兑换失败');
		}
	  })
	  .catch(error => {
		resultDiv.innerHTML = `<div class="error">${error.message}</div>`;
	  });
	}

      if (pageId === 'user-manager') {
        if (typeof initUserManager === 'function') {
          setTimeout(initUserManager, 100);
        }
      }
    } else {
        contentContainer.innerHTML = `<div class="section"><h1>404 NO LEAK</h1><p>页面不存在</p></div>`;
    }
    
    setupCharCounters();
    restoreSidebarScroll();
    
    document.body.classList.remove('spa-loading');
    updateActiveMenuItem(pageId);
  }, 300);
}

async function checkPageAccess(pageId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-permission?page=${pageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      return data.hasAccess;
    }
    
    return false;
  } catch (error) {
    console.error('检查页面权限失败:', error);
    return false;
  }
}

async function checkPageVisibility(pageId, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/page-visibility/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      return data.visible;
    }
    
    return false;
  } catch (error) {
    console.error('检查页面可见性失败:', error);
    return false;
  }
}

function showSuccessMessage(message) {
  const modal = document.getElementById('message-modal');
  if (!modal) {
    const modalHTML = `
      <div id="message-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modal-title">操作成功</h5>
            <button type="button" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="modal-content">${message}</p>
          </div>
          <div class="modal-footer">
            <button id="modal-ok" class="btn-ok">确定</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.querySelector('#message-modal .modal-close').addEventListener('click', () => {
      document.getElementById('message-modal').classList.remove('show');
    });
    
    document.getElementById('modal-ok').addEventListener('click', () => {
      document.getElementById('message-modal').classList.remove('show');
    });
    
    document.getElementById('message-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });
  } else {
    document.getElementById('modal-title').textContent = '操作成功';
    document.getElementById('modal-content').textContent = message;
  }
  
  document.getElementById('message-modal').classList.add('show');
}

function showErrorMessage(message) {
  const modal = document.getElementById('message-modal');
  if (!modal) {
    const modalHTML = `
      <div id="message-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modal-title">操作失败</h5>
            <button type="button" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="modal-content">${message}</p>
          </div>
          <div class="modal-footer">
            <button id="modal-ok" class="btn-ok">确定</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.querySelector('#message-modal .modal-close').addEventListener('click', () => {
      document.getElementById('message-modal').classList.remove('show');
    });
    
    document.getElementById('modal-ok').addEventListener('click', () => {
      document.getElementById('message-modal').classList.remove('show');
    });
    
    document.getElementById('message-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });
  } else {
    document.getElementById('modal-title').textContent = '操作失败';
    document.getElementById('modal-content').textContent = message;
  }
  
  document.getElementById('message-modal').classList.add('show');
}

function showInfoMessage(message) {
  const modal = document.getElementById('message-modal');
  if (!modal) {
    const modalHTML = `
      <div id="message-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="modal-title">提示信息</h5>
            <button type="button" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="modal-content">${message}</p>
          </div>
          <div class="modal-footer">
            <button id="modal-ok" class="btn-ok">确定</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.querySelector('#message-modal .modal-close').addEventListener('click', () => {
      document.getElementById('message-modal').classList.remove('show');
    });
    
    document.getElementById('modal-ok').addEventListener('click', () => {
      document.getElementById('message-modal').classList.remove('show');
    });
    
    document.getElementById('message-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });
  } else {
    document.getElementById('modal-title').textContent = '提示信息';
    document.getElementById('modal-content').textContent = message;
  }
  
  document.getElementById('message-modal').classList.add('show');
}

function normalizePageId(pid) {
  if (!pid) return pid;
  var map = { 
    'ccb': 'ccb', 
    'game-check': 'ccb', 
    'games': 'ccb'
  };
  return map[pid] || pid;
}

function updateActiveMenuItem(activePage) {
  try {
    var page = normalizePageId(activePage);
    var els = document.querySelectorAll('.sidebar-nav li, .sidebar-nav a');
    for (var i=0;i<els.length;i++){ els[i].classList.remove('active'); }
    var link = document.querySelector('.sidebar-nav a[data-page="' + page + '"]');
    if (!link) {
      var legacy = document.getElementById('sidebar-' + page);
      if (legacy) link = legacy.tagName === 'A' ? legacy : legacy.querySelector('a');
    }
    if (link) {
      link.classList.add('active');
      var li = link.closest ? link.closest('li') : null;
      if (li) li.classList.add('active');
      return;
    }
  } catch (e) { console.warn('[updateActiveMenuItem] error:', e); }
}

function initOrderEntryPage() {
  loadOrders();

  const searchBtn = document.getElementById('order-search-btn');
  const searchInput = document.getElementById('order-search-input');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      currentPage = 1;
      loadOrders();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        currentPage = 1;
        loadOrders();
      }
    });

    searchInput.addEventListener('input', function(e) {
      if (e.target.value === '') {
        currentPage = 1;
        loadOrders();
      }
    });
  }

  const addBtn = document.getElementById('add-order-btn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      showOrderModal();
    });
  }

  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveOrder();
    });
  }

  const closeBtn = document.querySelector('#order-modal .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeOrderModal();
    });
  }

  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeOrderModal();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('order-modal');
      if (modal && modal.classList.contains('show')) {
        closeOrderModal();
      }
    }
  });
}

async function loadOrders() {
  try {
    const search = document.getElementById('order-search-input').value;
    const token = localStorage.getItem('token');
    
    if (!token) {
      showLoginRequired('order-entry');
      return;
    }
    
    const response = await fetch(`https://api.am-all.com.cn/api/orders?page=${currentPage}&limit=${ordersPerPage}&search=${encodeURIComponent(search)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取订单失败');
    }
    
    const data = await response.json();
    
    currentOrders = data.orders.map(function(order){
      return Object.assign({}, order, {
        price: (typeof order.price === 'string') ? parseFloat(order.price) : order.price
      });
    });
    
    renderOrders(currentOrders);
    renderPagination(data.pagination);
    
  } catch (error) {
    console.error('加载订单错误:', error);
    showErrorMessage('加载订单失败: ' + error.message);
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('orders-body');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>暂无订单数据</p>
          </div>
        </td>
      </tr>`;
    return;
  }
  
  const sortedOrders = [...orders].sort((a, b) => a.id - b.id);
  
  sortedOrders.forEach((order, index) => {
    const tr = document.createElement('tr');
    const price = typeof order.price === 'number' ? order.price : parseFloat(order.price || 0);
    const formattedPrice = isNaN(price) ? '0.00' : price.toFixed(2);
    const redemptionRate = order.redemption_rate || 100;
    const calculatedPoints = Math.floor(price * redemptionRate / 100);
    const isRedeemed = order.redeemed === true || order.redeemed === 1 || order.redeemed === '1';
    
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${order.taobao_id || '-'}</td>
      <td title="${order.product_name || '-'}">${order.product_name || '-'}</td>
      <td>${order.order_number || '-'}</td>
      <td>¥${formattedPrice}</td>
      <td>
        <span class="rate-badge">${redemptionRate}%</span>
        <span class="points-badge">${calculatedPoints}积分</span>
      </td>
      <td>
        ${isRedeemed ? 
          '<span class="status-badge redeemed"><i class="fas fa-check-circle"></i>已兑换</span>' : 
          '<span class="status-badge pending"><i class="fas fa-clock"></i>未兑换</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editOrder(${order.id})" title="编辑订单">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${order.id})" title="删除订单">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editOrder(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (order) {
    showOrderModal(order);
  } else {
    showErrorMessage('订单不存在');
  }
}

function deleteOrder(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) {
    showErrorMessage('订单不存在');
    return;
  }
  
  if (confirm(`确定要删除订单 "${order.order_number}" 吗？\n此操作不可撤销！`)) {
    deleteOrderById(orderId);
  }
}

async function deleteOrderById(id) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`https://api.am-all.com.cn/api/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('删除订单失败');
    }

    await loadOrders();

    if (typeof showSuccessAnimation === 'function') {
      showSuccessAnimation(
        '删除成功',
        '订单已删除',
        2000
      );
    } else {
      showSuccessMessage('订单删除成功');
    }
  } catch (error) {
    console.error('删除订单错误:', error);
    showErrorMessage('删除订单失败: ' + error.message);
  }
}

window.editOrder = editOrder;
window.deleteOrder = deleteOrder;

function renderPagination(pagination) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (pagination.totalPages <= 1) return;
  
  const ul = document.createElement('ul');
  ul.className = 'pagination';
  
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
  prevLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      loadOrders();
    }
  });
  ul.appendChild(prevLi);
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(pagination.totalPages, currentPage + 2);
  
  if (startPage > 1) {
    const li = document.createElement('li');
    li.className = 'page-item';
    li.innerHTML = `<a class="page-link" href="#">1</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = 1;
      loadOrders();
    });
    ul.appendChild(li);
    
    if (startPage > 2) {
      const dotLi = document.createElement('li');
      dotLi.className = 'page-item disabled';
      dotLi.innerHTML = `<span class="page-link">...</span>`;
      ul.appendChild(dotLi);
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      loadOrders();
    });
    
    ul.appendChild(li);
  }
  
  if (endPage < pagination.totalPages) {
    if (endPage < pagination.totalPages - 1) {
      const dotLi = document.createElement('li');
      dotLi.className = 'page-item disabled';
      dotLi.innerHTML = `<span class="page-link">...</span>`;
      ul.appendChild(dotLi);
    }
    
    const li = document.createElement('li');
    li.className = 'page-item';
    li.innerHTML = `<a class="page-link" href="#">${pagination.totalPages}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = pagination.totalPages;
      loadOrders();
    });
    ul.appendChild(li);
  }
  
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
  nextLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < pagination.totalPages) {
      currentPage++;
      loadOrders();
    }
  });
  ul.appendChild(nextLi);
  
  const jumpDiv = document.createElement('div');
  jumpDiv.className = 'pagination-jump';
  jumpDiv.innerHTML = `
    <span>跳转到</span>
    <input type="number" min="1" max="${pagination.totalPages}" value="${currentPage}" id="page-jump-input">
    <span>页</span>
    <button class="btn btn-sm btn-outline-primary" id="page-jump-btn">跳转</button>
  `;
  
  const jumpBtn = document.getElementById('page-jump-btn');
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      const pageInput = document.getElementById('page-jump-input');
      if (pageInput) {
        const page = parseInt(pageInput.value);
        if (page >= 1 && page <= pagination.totalPages) {
          currentPage = page;
          loadOrders();
        }
      }
    });
    
    const pageInput = document.getElementById('page-jump-input');
    if (pageInput) {
      pageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const page = parseInt(pageInput.value);
          if (page >= 1 && page <= pagination.totalPages) {
            currentPage = page;
            loadOrders();
          }
        }
      });
    }
  }
  
  container.appendChild(ul);
}

function showOrderModal(order = null) {
  const modal = document.getElementById('order-modal');
  const form = document.getElementById('order-form');
  const title = document.getElementById('modal-title');
  
  if (!modal || !form || !title) return;

  let redemptionRateGroup = document.getElementById('redemption-rate-group');
  if (!redemptionRateGroup) {
    const priceGroup = document.querySelector('#order-form .form-group:has(#price)');
    if (priceGroup) {
      const rateGroupHtml = `
        <div class="form-group" id="redemption-rate-group">
          <label for="redemption-rate">
            还原率 (%)
            <span class="text-muted" style="font-size: 12px; font-weight: normal;">
              - 1%-100%，积分 = 价格 × 还原率，取整数
            </span>
          </label>
          <input 
            type="number" 
            id="redemption-rate" 
            class="form-control" 
            min="1" 
            max="100" 
            step="1" 
            value="100"
            placeholder="输入还原率 (1-100)"
            required
          >
          <small class="form-text text-muted" id="points-preview" style="margin-top: 8px; display: block; color: #667eea; font-weight: 500;">
            预计积分: 0
          </small>
        </div>
      `;
      priceGroup.insertAdjacentHTML('afterend', rateGroupHtml);

      const priceInput = document.getElementById('price');
      const rateInput = document.getElementById('redemption-rate');
      const previewEl = document.getElementById('points-preview');
      
      function updatePointsPreview() {
        const price = parseFloat(priceInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 100;
        const points = Math.floor(price * rate / 100);
        previewEl.textContent = `预计积分: ${points}`;
      }
      
      priceInput.addEventListener('input', updatePointsPreview);
      rateInput.addEventListener('input', updatePointsPreview);
    }
  }
  
  if (order) {
    title.innerHTML = '<i class="fas fa-edit me-2"></i>编辑订单';
    document.getElementById('order-id').value = order.id;
    document.getElementById('taobao-id').value = order.taobao_id || '';
    document.getElementById('product-name').value = order.product_name || '';
    document.getElementById('order-number').value = order.order_number || '';
    document.getElementById('price').value = order.price || '';

    const rateInput = document.getElementById('redemption-rate');
    if (rateInput) {
      rateInput.value = order.redemption_rate || 100;
    }
    
    const redeemedSelect = document.getElementById('redeemed');
    const isRedeemed = order.redeemed === true || order.redeemed === 1 || order.redeemed === '1';
    redeemedSelect.value = isRedeemed ? 'true' : 'false';

    const previewEl = document.getElementById('points-preview');
    if (previewEl) {
      const price = parseFloat(order.price) || 0;
      const rate = parseFloat(order.redemption_rate || 100);
      const points = Math.floor(price * rate / 100);
      previewEl.textContent = `预计积分: ${points}`;
    }
  } else {
    title.innerHTML = '<i class="fas fa-plus-circle me-2"></i>添加订单';
    form.reset();
    document.getElementById('order-id').value = '';
    document.getElementById('redeemed').value = 'false';

    const rateInput = document.getElementById('redemption-rate');
    if (rateInput) {
      rateInput.value = 100;
    }

    const previewEl = document.getElementById('points-preview');
    if (previewEl) {
      previewEl.textContent = '预计积分: 0';
    }
  }
  
  modal.classList.add('show');
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.remove('show');
    const form = document.getElementById('order-form');
    if (form) {
      form.reset();
      document.getElementById('order-id').value = '';
    }
  }
}

async function saveOrder() {
  try {
    const form = document.getElementById('order-form');
    if (!form) return;
    
    const orderId = document.getElementById('order-id').value;
    const taobaoId = document.getElementById('taobao-id').value.trim();
    const productName = document.getElementById('product-name').value.trim();
    const orderNumber = document.getElementById('order-number').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const redemptionRateInput = document.getElementById('redemption-rate');
    let redemptionRate = redemptionRateInput ? parseFloat(redemptionRateInput.value) : 100;

    if (isNaN(redemptionRate) || redemptionRate < 1 || redemptionRate > 100) {
      showErrorMessage('还原率必须在 1% 到 100% 之间');
      return;
    }

    redemptionRate = Math.floor(redemptionRate);
    
    const redeemedValue = document.getElementById('redeemed').value;
    const redeemed = redeemedValue === 'true' || redeemedValue === '1';
    const token = localStorage.getItem('token');

    if (!taobaoId || !productName || !orderNumber || isNaN(price)) {
      showErrorMessage('请填写所有必填字段');
      return;
    }

    if (price < 0) {
      showErrorMessage('价格不能为负数');
      return;
    }
    
    let url, method;
    
    if (orderId) {
      url = `https://api.am-all.com.cn/api/orders/${orderId}`;
      method = 'PUT';
    } else {
      url = 'https://api.am-all.com.cn/api/orders';
      method = 'POST';
    }
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taobao_id: taobaoId,
        product_name: productName,
        order_number: orderNumber,
        price: price,
        redemption_rate: redemptionRate,
        redeemed: redeemed
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '保存订单失败');
    }
    
    closeOrderModal();
    await loadOrders();
    const actualPoints = Math.floor(price * redemptionRate / 100);
    
    if (typeof showSuccessAnimation === 'function') {
      showSuccessAnimation(
        `订单${orderId ? '更新' : '添加'}成功`,
        `订单号: ${orderNumber}\n还原率: ${redemptionRate}%\n预计积分: ${actualPoints}`,
        2500
      );
    } else {
      showSuccessMessage(`订单${orderId ? '更新' : '添加'}成功，预计积分: ${actualPoints}`);
    }
  } catch (error) {
    console.error('保存订单错误:', error);
    showErrorMessage(`保存订单失败: ${error.message}`);
  }
}

async function handleRedeemOrder() {
  const orderNumber = document.getElementById('order-number-input').value;
  const resultDiv = document.getElementById('order-exchange-result');
  
  if (!orderNumber) {
    resultDiv.className = 'exchange-result show error';
    resultDiv.textContent = '请输入订单号';
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('https://api.am-all.com.cn/api/redeem-order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ order_number: orderNumber })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '兑换失败');
    }
    
    const data = await response.json();
    
    let pointsEarned = 0;
    
    if (data.pointsEarned !== undefined) {
      pointsEarned = data.pointsEarned;
    } else if (data.point2 !== undefined && currentUser?.point2 !== undefined) {
      pointsEarned = data.point2 - currentUser.point2;
    } else if (data.deltaPoints !== undefined) {
      pointsEarned = data.deltaPoints;
    } else if (data.points !== undefined) {
      pointsEarned = data.points;
    }

    if (currentUser) {
      if (data.point2 !== undefined) {
        currentUser.point2 = data.point2;
      } else if (pointsEarned > 0) {
        currentUser.point2 = (currentUser.point2 || 0) + pointsEarned;
      }
      updateUserInfo(currentUser);
    }

    const totalPoints = (currentUser.points || 0) + (currentUser.point2 || 0);

    resultDiv.className = 'exchange-result show success';
    resultDiv.textContent = `兑换成功！获得 ${pointsEarned} 鸽屋积分，当前总积分: ${totalPoints}`;
    
    document.getElementById('order-number-input').value = '';

    setTimeout(() => {
      resultDiv.className = 'exchange-result';
      resultDiv.style.display = 'none';
    }, 5000);
    
  } catch (error) {
    console.error('兑换错误:', error);
    resultDiv.className = 'exchange-result show error';
    resultDiv.textContent = error.message;
  }
}

function saveSettings() {
  const languageSelect = document.getElementById('language-select');
  const rememberLanguage = document.getElementById('remember-language');
  
  if (languageSelect) {
    localStorage.setItem('language', languageSelect.value);
  }
  if (rememberLanguage) {
    localStorage.setItem('rememberLanguage', rememberLanguage.checked);
  }
  
  showSuccessMessage('设置已保存');
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}

function secureFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('X-Requested-With', 'XMLHttpRequest');
  
  const finalOptions = {
    ...options,
    credentials: 'include',
    mode: 'cors',
    headers
  };
  
  return fetch(url, finalOptions)
    .then(response => {
      if (!response.ok) {
        const error = new Error(`请求失败: ${response.status} ${response.statusText}`);
        error.status = response.status;

        return response.text().then(text => {
          try {
            const errorData = JSON.parse(text);
            error.message = errorData.error || error.message;
            error.details = errorData.details;
          } catch (e) {
            error.message = text || error.message;
          }
          throw error;
        });
      }
      
      return response.json();
    })
    .catch(error => {
      console.error('请求处理错误:', error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        error.message = '网络连接失败，请检查网络设置';
      }
      
      throw error;
    });
}

document.addEventListener("DOMContentLoaded", function() {
  function checkAndResetDailyFortune() {
    const lastDrawDate = localStorage.getItem('dailyFortuneDate');
    const today = new Date().toDateString();
    const token = localStorage.getItem('token');
    const savedUserInfo = localStorage.getItem('userInfo');

    if (token && savedUserInfo) {
      try {
        const user = JSON.parse(savedUserInfo);
        currentUser = user;
        updateUserInfo(user);
        showUserInfo();
        setupUserDropdown();
      } catch (e) {
        console.error('从本地存储恢复用户信息失败:', e);
        checkLoginStatus();
      }
    } else {
      checkLoginStatus();
    }

    if (lastDrawDate && lastDrawDate !== today) {
      localStorage.removeItem('dailyFortuneDate');
      localStorage.removeItem('dailyFortuneData');
      
      const activePage = document.querySelector('.sidebar-nav a.active')?.getAttribute('data-page');
      if (activePage === 'fortune') {
        const fortuneSection = document.querySelector('.fortume-section');
        if (fortuneSection) {
          fortuneSection.classList.add('reset-fortune');
          setTimeout(() => {
            loadPage('fortune');
            fortuneSection.classList.remove('reset-fortune');
          }, 1000);
        }
      }
    }
  }

  checkAndResetDailyFortune();
  setInterval(checkAndResetDailyFortune, 60 * 60 * 1000);
    
    checkLoginStatus();
    
    document.getElementById('logout-pc')?.addEventListener('click', handleLogout);
    document.getElementById('logout-mobile')?.addEventListener('click', handleLogout);
    
  document.body.addEventListener('click', function(e) {

    if (e && e.target && e.target.closest && e.target.closest('.permission-modal')) { return; }
      const pageLink = e.target.closest('[data-page]');
      if (pageLink) {
        e.preventDefault();
        const pageId = pageLink.getAttribute('data-page');
        loadPage(pageId);
        
        if (window.innerWidth <= 992) {
          const sidebar = document.querySelector('.sidebar');
          if (sidebar) sidebar.classList.remove('show');
          document.body.classList.remove('mobile-sidebar-open');
          document.body.classList.add('mobile-sidebar-closed');
        }
        return;
      }

      const announcementPageLink = e.target.closest('[data-announcement-page]');
      if (announcementPageLink) {
        return;
      }
        
      if (e.target.closest('#login-btn')) {
          e.preventDefault();
          handleLogin();
      }
      
      if (e.target.closest('#register-btn')) {
          e.preventDefault();
          handleRegister();
      }
      
      if (e.target.closest('#send-verification-code')) {
          e.preventDefault();
          const emailInput = document.getElementById('register-email');
          const errorElement = document.getElementById('register-error');
          if (emailInput && emailInput.value) {
              sendVerificationCode(emailInput.value, 'register')
                  .then(() => {
                      showSuccessMessage('验证码已发送');
                  })
                  .catch(error => {
                      showTempErrorMessage(errorElement, error.message || '发送验证码失败');
                  });
          } else {
              showTempErrorMessage(errorElement, '请输入邮箱地址');
          }
      }

      if (e.target.closest('#send-reset-code')) {
          e.preventDefault();
          const emailInput = document.getElementById('forgot-email');
          const errorElement = document.getElementById('forgot-error');
          if (emailInput && emailInput.value) {
              sendVerificationCode(emailInput.value, 'reset')
                  .then(() => {
                      showSuccessMessage('验证码已发送');
                  })
                  .catch(error => {
                      showTempErrorMessage(errorElement, error.message || '发送验证码失败');
                  });
          } else {
              showTempErrorMessage(errorElement, '请输入邮箱地址');
          }
      }

      if (e.target.closest('#verify-code-btn')) {
          e.preventDefault();
          const email = document.getElementById('forgot-email').value;
          const code = document.getElementById('forgot-verification-code').value;
          const errorElement = document.getElementById('forgot-error');

          if (!email || !code) {
              showTempErrorMessage(errorElement, '邮箱和验证码不能为空');
              return;
          }

          verifyCode(email, code, 'reset')
              .then(data => {
                  localStorage.setItem('resetToken', data.resetToken);
                  loadPage('reset-password');
              })
              .catch(error => {
                  showTempErrorMessage(errorElement, error.error || '验证码验证失败');
              });
      }

      if (e.target.closest('#reset-password-btn')) {
          e.preventDefault();
          const newPassword = document.getElementById('reset-new-password').value;
          const confirmPassword = document.getElementById('reset-confirm-password').value;
          const resetToken = localStorage.getItem('resetToken');
          const errorElement = document.getElementById('reset-error');

          if (!newPassword || !confirmPassword) {
              showTempErrorMessage(errorElement, '新密码和确认密码不能为空');
              return;
          }

          if (newPassword !== confirmPassword) {
              showTempErrorMessage(errorElement, '两次输入的密码不一致');
              return;
          }

          if (newPassword.length < 8 || newPassword.length > 16) {
              showTempErrorMessage(errorElement, '密码长度需在8-16个字符之间');
              return;
          }

          resetPassword(resetToken, newPassword)
              .then(() => {
                  showSuccessMessage('密码重置成功');
                  localStorage.removeItem('resetToken');
                  setTimeout(() => {
                      loadPage('login');
                  }, 2000);
              })
              .catch(error => {
                  showTempErrorMessage(errorElement, error.error || '密码重置失败');
              });
      }

    if (e.target.closest('a[href^="http"]') && !e.target.closest('a[href*="am-all.com.cn"]')) {
      return;
    }

    if (e.target.closest('a.external-link')) {
      return;
    }

    const languageLink = e.target.closest('a[href*="lang="]');
    if (languageLink) {
      return;
    }

    const downloadLink = e.target.closest('a[href*="/download/"]') || 
               e.target.closest('a[href$=".zip"]') || 
               e.target.closest('a[href$=".rar"]') || 
               e.target.closest('a[href$=".7z"]') || 
               e.target.closest('a[href$=".exe"]');
    if (downloadLink) {
      return;
    }

    const isMessageSystemClick = e.target.closest('.message-dropdown') || 
                                  e.target.closest('.message-dropdown-mobile') ||
                                  e.target.closest('.message-item') ||
                                  e.target.closest('.chat-modal') ||
                                  e.target.closest('#system-message-modal') ||
                                  e.target.closest('[data-message-id]');
    
    if (isMessageSystemClick) {
      return;
    }
    
    const spaLink = e.target.closest('a[href^="#"]') || 
            e.target.closest('a[href^="/"]') && !e.target.closest('a[href^="http"]');
    if (spaLink) {
      const href = spaLink.getAttribute('href');
      if (href && href !== '#' && !href.includes('javascript:')) {
        e.preventDefault();
      }
    }
  });

  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
      sidebarToggle.style.display = 'none';
  }

  loadPage('home');
});

document.addEventListener('click', function(e){
  if (e.target && e.target.closest && e.target.closest('.permission-modal')) { /* allow */ }
}, true);

document.addEventListener('DOMContentLoaded', () => {
  const side = document.querySelector('.sidebar-nav') || document.getElementById('admin-section-nav');
  if (!side) return;
  side.addEventListener('click', (e) => {
    const el = e.target.closest('[data-page]');
    if (!el) return;
    const pid = el.getAttribute('data-page');
    if (!pid) return;
    e.preventDefault();
    try { if (typeof loadPage === 'function') loadPage(pid); } catch {}
  }, { passive: false });
});

(function(){
  function handleHashRoute(){
    try {
      const h = location.hash || '';
      const m = h.match(/^#\/(\w[\w-]*)/);
      if (m && typeof loadPage === 'function') {
        loadPage(m[1]);
      }
    } catch(e) { console.warn('hash route fail', e); }
  }
  window.addEventListener('hashchange', handleHashRoute, false);
  if (location.hash && typeof loadPage === 'function') {
    try { handleHashRoute(); } catch {}
  }
})();

(function(){
  if (window.__routeContractInstalledSafe) return;
  window.__routeContractInstalledSafe = true;

  if (typeof window !== 'undefined' && typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://api.am-all.com.cn';
  }

  function ensure(fnName){
    return (typeof window[fnName] === 'function') ? window[fnName] : function(){
      const c = document.getElementById('content-container') || document.body;
      if (c) c.innerHTML = '<div class="section"><h1>404</h1><p>缺少渲染函数：' + fnName + '</p></div>';
    };
  }

  async function checkAuth(permissionPage){
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const base = window.API_BASE_URL || 'https://api.am-all.com.cn';
      const r = await fetch(base + '/api/check-permission?page=' + encodeURIComponent(permissionPage), {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await r.json().catch(()=>({}));
      return !!(r.ok && (data.hasAccess !== false));
    } catch (e) {
      console.warn('checkAuth error:', e);
      return false;
    }
  }

  const ROUTES = {
    'ccb': { protected: true, perm: 'ccb', handler: () => ensure('renderCCBUserPage')() },
    'site-admin': { protected: true, perm: 'site-admin', handler: () => ensure('renderSiteAdminHome')() },
    'site-admin-ccb-servers': { protected: true, perm: 'site-admin', handler: () => ensure('renderCCBServersPage')() },
    'site-admin-ccb-games': { protected: true, perm: 'site-admin', handler: () => ensure('renderCCBGamesPage')() },
  };
  window.ROUTES = Object.assign({}, window.ROUTES || {}, ROUTES);

  function makeWrapper(orig){
    async function wrapper(pageId){
      try {
        const route = (window.ROUTES && window.ROUTES[pageId]) || null;
        if (route) {
          if (route.protected) {
            const ok = await checkAuth(route.perm || pageId);
            if (!ok) {
              if (typeof showErrorMessage === 'function') showErrorMessage('需要权限才能访问此页面');
              if (typeof orig === 'function') return orig('home');
              return;
            }
          }
          return route.handler();
        }
        if (typeof orig === 'function') return orig(pageId);
      } catch (e) {
        console.error('Route wrapper error:', e);
        if (typeof orig === 'function') return orig(pageId);
      }
    }
    Object.defineProperty(wrapper, '__isRouteWrapper', { value: true });
    return wrapper;
  }

  function install(){
    const orig = (typeof window.loadPage === 'function' && !window.loadPage.__isRouteWrapper)
      ? window.loadPage
      : (typeof window.__origLoadPage === 'function' ? window.__origLoadPage : null);

    window.__origLoadPage = orig || window.__origLoadPage || null;
    const wrapper = makeWrapper(window.__origLoadPage);
    window.loadPage = wrapper;
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(install, 0);
  } else {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(install, 0); });
  }

  let tries = 0;
  const maxTries = 20;
  const iv = setInterval(function(){
    tries++;
    const lp = window.loadPage;
    if (typeof lp === 'function' && !lp.__isRouteWrapper) {
      window.__origLoadPage = lp;
      window.loadPage = makeWrapper(lp);
    }
    if (tries >= maxTries) clearInterval(iv);
  }, 250);
})();

document.addEventListener('click', function(e){
  var t = e.target; if (!t || !t.closest) return;
  var a = t.closest('.sidebar-nav a[data-page]');
  if (!a) return;
  var pid = a.getAttribute('data-page');
  if (!pid) return;
  try { updateActiveMenuItem(pid); } catch(_) {}
}, true);

function renderPrivacySettings() {
  loadPrivacySettings();
}

async function loadPrivacySettings() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('未登录，无法加载隐私设置');
      return;
    }
    
    const response = await secureFetch('https://api.am-all.com.cn/api/friends/privacy', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('隐私设置响应:', response);
    
    if (response && !response.error) {
      const searchOptions = response.searchable_by ? response.searchable_by.split(',') : ['uid', 'username', 'nickname'];
      const uidCheckbox = document.getElementById('search-by-uid');
      const usernameCheckbox = document.getElementById('search-by-username');
      const nicknameCheckbox = document.getElementById('search-by-nickname');
      
      if (uidCheckbox) {
        uidCheckbox.checked = searchOptions.includes('uid');
        console.log('设置 UID 复选框:', searchOptions.includes('uid'));
      }
      if (usernameCheckbox) {
        usernameCheckbox.checked = searchOptions.includes('username');
        console.log('设置用户名复选框:', searchOptions.includes('username'));
      }
      if (nicknameCheckbox) {
        nicknameCheckbox.checked = searchOptions.includes('nickname');
        console.log('设置昵称复选框:', searchOptions.includes('nickname'));
      }

      const messagePrivacy = response.message_privacy || 'all';
      const messageRadio = document.querySelector(`input[name="message-privacy"][value="${messagePrivacy}"]`);
      if (messageRadio) {
        messageRadio.checked = true;
        console.log('设置消息隐私:', messagePrivacy);
      }
    }
  } catch (error) {
    console.error('加载隐私设置失败:', error);
  }
}

async function savePrivacySettings() {
  const searchOptions = [];
  const uidCheckbox = document.getElementById('search-by-uid');
  const usernameCheckbox = document.getElementById('search-by-username');
  const nicknameCheckbox = document.getElementById('search-by-nickname');
  
  if (uidCheckbox && uidCheckbox.checked) searchOptions.push('uid');
  if (usernameCheckbox && usernameCheckbox.checked) searchOptions.push('username');
  if (nicknameCheckbox && nicknameCheckbox.checked) searchOptions.push('nickname');
  
  const messageRadio = document.querySelector('input[name="message-privacy"]:checked');
  const messagePrivacy = messageRadio ? messageRadio.value : 'all';

  if (searchOptions.length === 0) {
    showErrorMessage('至少选择一种搜索方式');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await secureFetch('https://api.am-all.com.cn/api/friends/privacy', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        searchable_by: searchOptions.join(','),
        message_privacy: messagePrivacy
      })
    });
    
    if (response && !response.error) {
      showSuccessMessage('隐私设置已保存');
    } else {
      showErrorMessage(response.error || '保存失败');
    }
  } catch (error) {
    console.error('保存隐私设置失败:', error);
    showErrorMessage('保存失败，请稍后重试');
  }
}

window.renderPrivacySettings = renderPrivacySettings;
window.loadPrivacySettings = loadPrivacySettings;
window.savePrivacySettings = savePrivacySettings;