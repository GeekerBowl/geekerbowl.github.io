const HomeAdsManager = {
  loading: false,
  loaded: false,
  loadTimer: null,
  lastLoadTime: 0,
  MIN_LOAD_INTERVAL: 500,

  reset() {
    this.loaded = false;
    this.loading = false;
  },

  canLoad() {
    const now = Date.now();
    const timeSinceLastLoad = now - this.lastLoadTime;
    
    if (this.loading) {
      return false;
    }
    
    if (timeSinceLastLoad < this.MIN_LOAD_INTERVAL) {
      return false;
    }
    
    return true;
  },

  startLoading() {
    this.loading = true;
    this.lastLoadTime = Date.now();
  },

  finishLoading(success) {
    this.loading = false;
    this.loaded = success;
  }
};

function clearAllAdvertisements() {
  const existingAds = document.querySelectorAll('.home-advertisements');
  if (existingAds.length > 0) {
    existingAds.forEach(ad => ad.remove());
    return true;
  }
  return false;
}

async function loadHomeAdvertisements(forceReload = false) {

  const hash = window.location.hash;
  const isHomePage = hash === '#/home' || hash === '' || hash === '#/';
  
  if (!isHomePage) {
    return;
  }

  const announcementsContainer = document.getElementById('announcements-container');
  if (!announcementsContainer) {
    return;
  }

  const needsRefresh = localStorage.getItem('homeAdsNeedRefresh') === 'true';

  if (needsRefresh || forceReload) {
    clearAllAdvertisements();
    HomeAdsManager.reset();
    localStorage.removeItem('homeAdsNeedRefresh');
  }

  if (HomeAdsManager.loaded && !needsRefresh && !forceReload) {

    const existingAds = document.querySelector('.home-advertisements');
    if (existingAds) {
      return;
    } else {
      HomeAdsManager.reset();
    }
  }

  if (!HomeAdsManager.canLoad()) {
    return;
  }

  HomeAdsManager.startLoading();
  
  try {
    const response = await fetch('https://api.am-all.com.cn/api/verification/active-ads');
    
    if (!response.ok) {
      HomeAdsManager.finishLoading(false);
      return;
    }
    
    const data = await response.json();
    
    if (!data.advertisements || data.advertisements.length === 0) {
      HomeAdsManager.finishLoading(true);
      return;
    }
    
    const ads = data.advertisements;

    clearAllAdvertisements();

    const adsHTML = `
      <div class="home-advertisements">
        <h3 class="home-advertisements-title">
          <i class="fas fa-star"></i> 合作伙伴
        </h3>
        <div class="home-advertisements-grid">
          ${ads.map(ad => `
            <div class="home-ad-item" onclick="handleAdClick(${ad.id}, '${ad.shop_type}')">
              <img src="https://api.am-all.com.cn${ad.banner_image}" alt="${ad.shop_name}">
              <div class="home-ad-badge ${ad.verification_type}">
                ${ad.verification_type === 'personal' ? '个人' : '官方'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <hr>
    `;

    announcementsContainer.insertAdjacentHTML('afterend', adsHTML);
    HomeAdsManager.finishLoading(true);
    
  } catch (error) {
    HomeAdsManager.finishLoading(false);
  }
}

function loadHomeAdvertisementsDebounced(forceReload = false, delay = 300) {

  if (HomeAdsManager.loadTimer) {
    clearTimeout(HomeAdsManager.loadTimer);
  }

  HomeAdsManager.loadTimer = setTimeout(() => {
    loadHomeAdvertisements(forceReload);
  }, delay);
}

async function handleAdClick(adId, shopType) {
  try {
    const response = await fetch(`https://api.am-all.com.cn/api/verification/ad/${adId}`);
    
    if (!response.ok) {
      showErrorMessage('获取广告信息失败');
      return;
    }
    
    const data = await response.json();
    const ad = data.advertisement;
    
    if (!ad) {
      showErrorMessage('广告不存在');
      return;
    }

    recordAdClick(adId);

    if (ad.shop_type === 'taobao') {
      if (ad.shop_link && ad.shop_link.trim() !== '') {
        window.open(ad.shop_link, '_blank');
      } else {
        showErrorMessage('该店铺暂无链接');
      }
    } else if (ad.shop_type === 'xianyu' || ad.shop_type === 'other') {
      if (ad.qr_code_image) {
        showAdQRCodeDirect(ad);
      } else {
        showErrorMessage('该店铺暂无二维码');
      }
    } else {
      showErrorMessage('未知的店铺类型');
    }
    
  } catch (error) {
    showErrorMessage('操作失败,请稍后重试');
  }
}

function showAdQRCodeDirect(ad) {
  const shopTypeText = {
    'xianyu': '闲鱼',
    'taobao': '淘宝',
    'other': '其他'
  };
  
  const modalHTML = `
    <div class="verification-modal show" id="ad-qrcode-modal">
      <div class="verification-modal-content">
        <div class="verification-modal-header">
          <div class="verification-modal-title">${ad.shop_name}</div>
          <button class="verification-modal-close" onclick="closeAdQRCodeModal()">×</button>
        </div>
        
        <div class="text-center">
          <div class="verification-info-item mb-3">
            <div class="verification-info-label">店铺类型</div>
            <div class="verification-info-value">${shopTypeText[ad.shop_type]}</div>
          </div>
          
          <div class="verification-info-label mb-2">扫描二维码访问店铺</div>
          <img src="https://api.am-all.com.cn${ad.qr_code_image}" 
               alt="店铺二维码" 
               style="max-width: 300px; width: 100%; border-radius: 8px;">
        </div>
        
        <div class="verification-tip mt-3">
          <i class="fas fa-info-circle"></i>
          使用对应平台的APP扫描二维码即可访问店铺
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function showErrorMessage(message) {
  alert(message);
}

async function showAdQRCode(adId) {
  try {
    const response = await fetch(`https://api.am-all.com.cn/api/verification/ad/${adId}`);
    
    if (!response.ok) {
      throw new Error('获取广告详情失败');
    }
    
    const data = await response.json();
    const ad = data.advertisement;
    
    if (!ad || !ad.qr_code_image) {
      showErrorMessage('该店铺暂无二维码');
      return;
    }
    
    showAdQRCodeDirect(ad);
    
  } catch (error) {
    showErrorMessage('获取店铺信息失败');
  }
}

function closeAdQRCodeModal() {
  const modal = document.getElementById('ad-qrcode-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

async function recordAdClick(adId) {
  try {
    await fetch(`https://api.am-all.com.cn/api/verification/ad/${adId}/click`, {
      method: 'POST'
    });
  } catch (error) {
  }
}

function refreshHomeAdvertisements() {
  clearAllAdvertisements();
  HomeAdsManager.reset();
  localStorage.removeItem('homeAdsNeedRefresh');
  loadHomeAdvertisements(true);
}

function markHomeAdsForRefresh() {
  localStorage.setItem('homeAdsNeedRefresh', 'true');
  HomeAdsManager.reset();
}

window.loadHomeAdvertisements = loadHomeAdvertisements;
window.loadHomeAdvertisementsDebounced = loadHomeAdvertisementsDebounced;
window.handleAdClick = handleAdClick;
window.showAdQRCode = showAdQRCode;
window.showAdQRCodeDirect = showAdQRCodeDirect;
window.showErrorMessage = showErrorMessage;
window.closeAdQRCodeModal = closeAdQRCodeModal;
window.recordAdClick = recordAdClick;
window.refreshHomeAdvertisements = refreshHomeAdvertisements;
window.markHomeAdsForRefresh = markHomeAdsForRefresh;
window.clearAllAdvertisements = clearAllAdvertisements;
window.HomeAdsManager = HomeAdsManager;

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadHomeAdvertisementsDebounced(false, 800);
  });
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;

    if (hash === '#/home' || hash === '' || hash === '#/') {

      const needsRefresh = localStorage.getItem('homeAdsNeedRefresh') === 'true';
      
      if (needsRefresh) {
        clearAllAdvertisements();
        HomeAdsManager.reset();
        localStorage.removeItem('homeAdsNeedRefresh');
        loadHomeAdvertisementsDebounced(true, 400);
      } else {
        if (!HomeAdsManager.loaded) {
          loadHomeAdvertisementsDebounced(false, 400);
        } else {
        }
      }
    } else {
      HomeAdsManager.loaded = false;
    }
  });

  window.forceRefreshHomeAds = function() {
    refreshHomeAdvertisements();
  };
}