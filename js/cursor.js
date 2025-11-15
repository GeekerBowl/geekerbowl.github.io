const CursorManager = {
  styles: {
    default: {
      name: '默认',
      description: '系统默认鼠标',
      class: 'cursor-default',
      icon: 'fas fa-mouse-pointer',
      value: 'default'
    },
    custom1: {
      name: '井盖',
      description: 'Dungeon & Fighter',
      class: 'cursor-custom1',
      icon: 'fas fa-circle',
      image: 'https://oss.am-all.com.cn/asset/img/cursor/cursor1_preview.png',
      value: 'custom1'
    },
    custom2: {
      name: '緒山 まひろ',
      description: 'お兄ちゃんはおしまい！',
      class: 'cursor-custom2',
      icon: 'fas fa-heart',
      image: 'https://oss.am-all.com.cn/asset/img/cursor/cursor2_preview.png',
      value: 'custom2'
    }
  },

  init() {
    const savedStyle = localStorage.getItem('cursorStyle') || 'default';
    this.applyCursorStyle(savedStyle);

    if (document.getElementById('cursor-settings-card')) {
      this.initSettingsUI();
    }
  },

  applyCursorStyle(styleName) {
    Object.values(this.styles).forEach(style => {
      document.body.classList.remove(style.class);
    });

    if (this.styles[styleName]) {
      document.body.classList.add(this.styles[styleName].class);
      localStorage.setItem('cursorStyle', styleName);

      if (styleName !== 'default') {
        this.preloadCursorImages(styleName);
      }
    }
  },

  preloadCursorImages(styleName) {
    const cursorUrls = [
      `https://oss.am-all.com.cn/asset/img/cursor/cursor${styleName === 'custom1' ? '1_jinggai' : '2_mahiro'}.cur`,
      `https://oss.am-all.com.cn/asset/img/cursor/cursor${styleName === 'custom1' ? '1_jinggai' : '2_mahiro'}_pointer.cur`
    ];
    
    cursorUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  },

  initSettingsUI() {
    const container = document.getElementById('cursor-preview-container');
    if (!container) return;
    
    const currentStyle = localStorage.getItem('cursorStyle') || 'default';

    let html = '<div class="cursor-preview">';
    
    Object.entries(this.styles).forEach(([key, style]) => {
      const isActive = key === currentStyle;
      html += `
        <div class="cursor-option ${isActive ? 'active' : ''}" data-cursor="${key}">
          <div class="cursor-option-icon">
            ${style.image ? 
              `<img src="${style.image}" alt="${style.name}" class="cursor-option-image">` : 
              `<i class="${style.icon}"></i>`
            }
          </div>
          <div class="cursor-option-name">${style.name}</div>
          <div class="cursor-option-desc">${style.description}</div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('.cursor-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const cursorType = option.dataset.cursor;
        this.selectCursorStyle(cursorType);
      });
    });
  },

  selectCursorStyle(styleName) {
    document.querySelectorAll('.cursor-option').forEach(option => {
      option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.cursor-option[data-cursor="${styleName}"]`);
    if (selectedOption) {
      selectedOption.classList.add('active');
    }

    this.applyCursorStyle(styleName);

    if (typeof showSuccessMessage === 'function') {
      showSuccessMessage(`鼠标样式已切换为: ${this.styles[styleName].name}`);
    }
  },

  convertAniToCur() {
    const message = `
      <div style="text-align: left;">
        <h4>关于动态鼠标指针</h4>
        <p>浏览器原生不支持 .ani 动态光标格式。您可以：</p>
        <ol>
          <li>使用在线转换工具将 .ani 转换为 .cur 格式</li>
          <li>联系管理员提供 .cur 格式的光标文件</li>
          <li>使用 CSS 动画模拟光标动态效果</li>
        </ol>
        <p><strong>推荐工具：</strong></p>
        <ul>
          <li>AniTuner - 专业的光标编辑器</li>
          <li>RealWorld Cursor Editor</li>
          <li>在线转换器: convertio.co</li>
        </ul>
      </div>
    `;
    
    if (typeof showErrorMessage === 'function') {
      const modal = document.getElementById('message-modal');
      if (modal) {
        document.getElementById('modal-title').textContent = '提示';
        document.getElementById('modal-content').innerHTML = message;
        modal.classList.add('show');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  CursorManager.init();
});

window.initCursorSettings = function() {
  CursorManager.initSettingsUI();
};

(function() {
  const savedStyle = localStorage.getItem('cursorStyle') || 'default';
  CursorManager.applyCursorStyle(savedStyle);
})();