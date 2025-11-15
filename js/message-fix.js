(function(global) {
  'use strict';

  document.addEventListener('click', function(e) {
    const messageIcon = e.target.closest('.message-icon-wrapper, .message-icon-wrapper-mobile');
    if (!messageIcon) return;

    const isMobile = messageIcon.classList.contains('message-icon-wrapper-mobile');
    const dropdownId = isMobile ? 'message-dropdown-mobile' : 'message-dropdown';
    const dropdown = document.getElementById(dropdownId);
    
    if (dropdown) {
      if (dropdown.style.display === 'none') {
        dropdown.style.display = '';
      }
    }
  }, true);

  const originalCloseMessageDropdown = window.closeMessageDropdown;
  
  window.closeMessageDropdown = function() {
    const dropdowns = document.querySelectorAll('.message-dropdown, .message-dropdown-mobile');
    dropdowns.forEach(d => {
      d.classList.remove('show');
      if (d.style.display === 'none') {
        d.style.display = '';
      }
    });
  };

  const checkDropdownState = function() {
    const dropdowns = document.querySelectorAll('.message-dropdown, .message-dropdown-mobile');
    dropdowns.forEach(dropdown => {
      if (dropdown.style.display === 'none' && !dropdown.classList.contains('show')) {
        dropdown.style.display = '';
      }
    });
  };

  setInterval(checkDropdownState, 500);

  async function refreshCacheStatsSilently() {
    try {

      if (!window.EmojiCache) {
        updateCacheDisplayDefault();
        return;
      }

      if (window.EmojiCache.init) {
        await window.EmojiCache.init();
      }

      if (window.EmojiCache.getStats) {
        const stats = await window.EmojiCache.getStats();
        if (stats) {
          updateCacheDisplay(stats);
        } else {
          updateCacheDisplayDefault();
        }
      }
    } catch (error) {
      console.error('Failed to refresh cache stats silently:', error);
      updateCacheDisplayDefault();
    }
  }

  function updateCacheDisplay(stats) {
    const emojiCountEl = document.getElementById('cache-emoji-count');
    const messageCountEl = document.getElementById('cache-message-count');
    const cacheSizeEl = document.getElementById('cache-size');
    const usageTextEl = document.getElementById('cache-usage-text');
    const progressFillEl = document.getElementById('cache-progress-fill');
    
    if (emojiCountEl) emojiCountEl.textContent = stats.emojiCount || 0;
    if (messageCountEl) messageCountEl.textContent = stats.messageCount || 0;
    if (cacheSizeEl) cacheSizeEl.textContent = (stats.totalSizeMB || '0.00') + ' MB';
    
    const totalMB = parseFloat(stats.totalSizeMB) || 0;
    const maxMB = parseFloat(stats.maxSizeMB) || 100;
    const percent = parseFloat(stats.usagePercent) || 0;
    
    if (usageTextEl) {
      usageTextEl.textContent = `${totalMB.toFixed(2)} MB / ${maxMB} MB`;
    }
    
    if (progressFillEl) {
      progressFillEl.style.width = Math.max(percent, 5) + '%';
      const progressText = progressFillEl.querySelector('.progress-text');
      if (progressText) {
        progressText.textContent = percent.toFixed(1) + '%';
      }
    }
  }

  function updateCacheDisplayDefault() {
    const emojiCountEl = document.getElementById('cache-emoji-count');
    const messageCountEl = document.getElementById('cache-message-count');
    const cacheSizeEl = document.getElementById('cache-size');
    const usageTextEl = document.getElementById('cache-usage-text');
    const progressFillEl = document.getElementById('cache-progress-fill');
    
    if (emojiCountEl) emojiCountEl.textContent = '0';
    if (messageCountEl) messageCountEl.textContent = '0';
    if (cacheSizeEl) cacheSizeEl.textContent = '0.00 MB';
    if (usageTextEl) usageTextEl.textContent = '0.00 MB / 100 MB';
    
    if (progressFillEl) {
      progressFillEl.style.width = '5%';
      const progressText = progressFillEl.querySelector('.progress-text');
      if (progressText) {
        progressText.textContent = '0.0%';
      }
    }
  }

  function onSettingsPageLoad() {
    const settingsContainer = document.querySelector('.settings-container');
    const cacheCard = document.getElementById('emoji-cache-card');
    
    if (settingsContainer && cacheCard) {
      refreshCacheStatsSilently();

      const autoCleanSwitch = document.getElementById('auto-clean-cache');
      const preloadSwitch = document.getElementById('preload-emoji');
      
      if (autoCleanSwitch) {
        const autoClean = localStorage.getItem('autoCleanCache') !== 'false';
        autoCleanSwitch.checked = autoClean;
      }
      
      if (preloadSwitch) {
        const preload = localStorage.getItem('preloadEmoji') !== 'false';
        preloadSwitch.checked = preload;
      }
    }
  }

  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#/settings') {
      setTimeout(onSettingsPageLoad, 200);
    }
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.target.id === 'content-container') {
        if (document.querySelector('.settings-container')) {
          setTimeout(onSettingsPageLoad, 200);
        }
      }
    });
  });

  const contentContainer = document.getElementById('content-container');
  if (contentContainer) {
    observer.observe(contentContainer, {
      childList: true,
      subtree: false
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        if (window.location.hash === '#/settings') {
          onSettingsPageLoad();
        }
        checkDropdownState();
      }, 300);
    });
  } else {
    setTimeout(function() {
      if (window.location.hash === '#/settings') {
        onSettingsPageLoad();
      }
      checkDropdownState();
    }, 300);
  }

  (function() {
    'use strict';

    const chatObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.id === 'chat-modal') {
            setTimeout(() => {
              fixChatWindow(node);
            }, 100);
          }
        });
      });
    });
    
    chatObserver.observe(document.body, {
      childList: true,
      subtree: false
    });

    function fixChatWindow(modal) {
      const container = modal.querySelector('.chat-container');
      if (!container) return;
      
      const isPCDraggable = modal.classList.contains('pc-draggable');
      const isMobile = modal.classList.contains('mobile-centered');
      
      if (isPCDraggable) {

        const currentHeight = parseInt(container.style.height);

        if (!currentHeight || currentHeight > 700 || currentHeight < 400 || !container.dataset.initialized) {
          container.style.width = '450px';
          container.style.height = '550px';
          container.dataset.initialized = 'true';
        }

        container.style.minWidth = '380px';
        container.style.minHeight = '400px';
        container.style.maxWidth = 'min(800px, 90vw)';
        container.style.maxHeight = '700px';
        container.style.resize = 'both';
        container.style.overflow = 'auto';

        if (parseInt(container.style.height) > 700) {
          container.style.height = '550px';
        }

        container.style.position = 'fixed';
        if (!container.style.top || container.style.top === '100px') {
          container.style.top = '80px';
        }
        if (!container.style.left || container.style.left === '50%') {
          container.style.left = '50%';
          container.style.transform = 'translateX(-50%)';
        }

        addManualResize(container);
        
      } else if (isMobile) {
        
        const viewportHeight = window.innerHeight;
        const maxHeight = Math.min(600, viewportHeight - 100);
        
        container.style.height = maxHeight + 'px';
        container.style.maxHeight = maxHeight + 'px';
        container.style.minHeight = '400px';
        container.style.resize = 'none';
      }

      fixInternalLayout(container);
    }

    function fixInternalLayout(container) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';

      const header = container.querySelector('.chat-header');
      const searchArea = container.querySelector('.user-search-area');
      const messages = container.querySelector('.chat-messages');
      const inputArea = container.querySelector('.chat-input-area');
      
      if (header) {
        header.style.flexShrink = '0';
        header.style.height = '50px';
        header.style.minHeight = '50px';
        header.style.maxHeight = '50px';
      }
      
      if (searchArea) {
        searchArea.style.flexShrink = '0';
        searchArea.style.maxHeight = '150px';
        searchArea.style.overflowY = 'auto';
      }
      
      if (messages) {
        messages.style.flex = '1 1 auto';
        messages.style.minHeight = '200px';
        messages.style.overflowY = 'auto';
        messages.style.overflowX = 'hidden';
      }
      
      if (inputArea) {
        inputArea.style.flexShrink = '0';
        inputArea.style.height = '60px';
        inputArea.style.minHeight = '60px';
        inputArea.style.maxHeight = '60px';
      }
    }

    function addManualResize(container) {
      if (container.querySelector('.manual-resize-handle')) return;

      const handle = document.createElement('div');
      handle.className = 'manual-resize-handle';
      handle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        cursor: nwse-resize;
        background: linear-gradient(135deg, transparent 0%, transparent 50%, rgba(150, 150, 150, 0.5) 50%, rgba(150, 150, 150, 0.5) 100%);
        border-radius: 0 0 12px 0;
        z-index: 1000;
        pointer-events: auto;
      `;
      container.appendChild(handle);
      
      let isResizing = false;
      let startX, startY, startWidth, startHeight;
      
      handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(container).width, 10);
        startHeight = parseInt(window.getComputedStyle(container).height, 10);
        
        container.classList.add('resizing');
        e.preventDefault();
        e.stopPropagation();
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const newWidth = startWidth + e.clientX - startX;
        const newHeight = startHeight + e.clientY - startY;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const minWidth = 380;
        const maxWidth = Math.min(800, viewportWidth * 0.9);
        const minHeight = 400;
        const maxHeight = viewportHeight * 0.8;
        
        const finalWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
        const finalHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
        
        container.style.width = finalWidth + 'px';
        container.style.height = finalHeight + 'px';

        e.preventDefault();
      });
      
      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          container.classList.remove('resizing');
        }
      });
    }

    function fixExistingChatWindows() {
      const modal = document.getElementById('chat-modal');
      if (modal) {
        fixChatWindow(modal);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fixExistingChatWindows);
    } else {
      setTimeout(fixExistingChatWindows, 100);
    }

    let checkInterval = setInterval(() => {
      fixExistingChatWindows();
    }, 1000);
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);
  })();

  (function() {
    'use strict';

    function forceFixAllIframes() {
      const iframes = document.querySelectorAll('iframe, .icf-editor-iframe, .tool-iframe, .content-iframe');
      
      iframes.forEach(iframe => {
        iframe.style.cssText = `
          width: 100% !important;
          min-height: 600px !important;
          height: 600px !important;
          border: none !important;
          display: block !important;
        `;

        const parent = iframe.parentElement;
        if (parent) {
          parent.style.minHeight = 'auto';
          parent.style.height = 'auto';
          parent.style.maxHeight = 'none';
          parent.style.overflow = 'visible';

          if (parent.classList.contains('iframe-container')) {
            parent.style.cssText += `
              min-height: auto !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
            `;
          }
        }

        iframe.addEventListener('load', function() {
          adjustIframeHeight(iframe);
        });

        adjustIframeHeight(iframe);
      });
    }

    function adjustIframeHeight(iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc && iframeDoc.body) {
          const contentHeight = Math.max(
            iframeDoc.body.scrollHeight || 0,
            iframeDoc.body.offsetHeight || 0,
            iframeDoc.documentElement?.scrollHeight || 0,
            iframeDoc.documentElement?.offsetHeight || 0,
            600
          );

          const finalHeight = Math.max(600, contentHeight + 50);
          iframe.style.height = finalHeight + 'px';
          iframe.style.minHeight = '600px';
        } else {
          iframe.style.height = '650px';
          iframe.style.minHeight = '600px';
        }
      } catch (e) {
        iframe.style.height = '650px';
        iframe.style.minHeight = '600px';
      }
    }

    const iframeObserver = new MutationObserver((mutations) => {
      let hasNewIframe = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'IFRAME' || (node.querySelector && node.querySelector('iframe'))) {
              hasNewIframe = true;
            }
          }
        });
      });
      
      if (hasNewIframe) {
        setTimeout(forceFixAllIframes, 100);
      }
    });

    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
      iframeObserver.observe(contentContainer, {
        childList: true,
        subtree: true
      });
    }

    function addIframeStyles() {
      if (document.getElementById('iframe-fix-styles')) {
        document.getElementById('iframe-fix-styles').remove();
      }
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'iframe-fix-styles';
      styleSheet.textContent = `
        /* 强制修复iframe高度 */
        iframe,
        .icf-editor-iframe,
        .tool-iframe,
        .content-iframe {
          min-height: 600px !important;
          width: 100% !important;
          border: none !important;
          display: block !important;
        }
        
        /* 修复iframe容器 */
        .iframe-container {
          min-height: auto !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* 确保所有内容页面的iframe都有足够高度 */
        .download-section iframe,
        .game-detail iframe,
        .tool-section iframe,
        [class*="-container"] iframe {
          min-height: 600px !important;
        }
        
        /* 修复聊天窗口高度 - 强制限制 */
        .chat-modal.pc-draggable .chat-container {
          resize: both !important;
          overflow: auto !important;
          max-height: 700px !important;  /* 固定最大高度 */
          min-height: 400px !important;
          min-width: 380px !important;
          max-width: min(800px, 90vw) !important;
        }
        
        /* 初始聊天窗口高度 */
        .chat-modal.pc-draggable .chat-container:not([data-initialized]) {
          height: 550px !important;
          width: 450px !important;
        }
        
        /* 移动端聊天窗口 */
        .chat-modal.mobile-centered .chat-container {
          max-height: min(600px, calc(100vh - 100px)) !important;
          resize: none !important;
        }
        
        /* 手动resize手柄样式 */
        .manual-resize-handle {
          position: absolute !important;
          bottom: 0 !important;
          right: 0 !important;
          width: 20px !important;
          height: 20px !important;
          cursor: nwse-resize !important;
          z-index: 10000 !important;
        }
        
        /* 防止聊天窗口内容溢出 */
        .chat-modal .chat-messages {
          flex: 1 1 auto !important;
          min-height: 200px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
      `;
      
      document.head.appendChild(styleSheet);
    }

    function initIframeFix() {
      addIframeStyles();
      forceFixAllIframes();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initIframeFix, 100);
      });
    } else {
      setTimeout(initIframeFix, 100);
    }

    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      forceFixAllIframes();
      
      if (checkCount > 10) {
        clearInterval(checkInterval);
      }
    }, 1000);
  })();

})(window);