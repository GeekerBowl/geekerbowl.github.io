document.addEventListener("DOMContentLoaded", function() {
  // 获取DOM元素
  const languageBtn = document.querySelector('.language-btn');
  const languageDropdown = document.querySelector('.language-dropdown');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const mobileToggle = document.querySelector('.mobile-toggle');
  
  // 弹窗相关元素
  const modal = document.getElementById('about-modal');
  const modalClose = document.querySelector('.modal-close');
  const modalOk = document.getElementById('modal-ok');
  
  // 多语言功能
  function setLanguage(lang) {
    // 所有翻译文本
    const translations = {
      'zh-cn': {
        // 导航栏
        'navbar-brand': 'DATA CENTER',
        'nav-home-text': '返回EvilLeaker主页',
        'nav-download-text': 'N/A',
        'nav-about-text': '关于',
        'language-text': '语言',
        
        // 侧边栏
        'sidebar-home': '首页',
        'sidebar-data': '下载',
        'sidebar-settings': '设置',
        'sidebar-help': '帮助',
        'sidebar-game-download': '游戏下载',
        'sidebar-archive': '存档下载',
        
        // 主内容
        'download-heading': '下载',
        'game-heading': '游戏',
        'archive-heading': '资源存档',
        'other-heading': '其他资源',
        'warning-text': '重要提示：',
        'warning-detail': '本站OneDrive下载渠道将于近期下线',
        'latest-update-text': '最后更新',
        'latest-update-text-archive': '最后更新',
        'latest-update-text-other': '最后更新',
        'game-title': '游戏名称',
        'game-version': '版本',
        'game-files': '文件数',
        'archive-title': '游戏名称',
        'archive-filetype': '文件格式',
        'archive-version': '版本',
        'archive-files': '文件数',
        'other-title': '资源名称',
        'other-filetype': '文件格式',
        'other-files': '文件数',
        'download-all': '未使用',
        'download-info-text': '下载说明：',
        'download-info-detail': '本站全部资源仅提供「百度网盘」与「One Drive」作为下载方式',
        'notice-text': '注意：',
        'notice-detail': '此页面暂为临时下载页面',
        
        // 弹窗文本
        'modal-title': '关于 EVIL LEAKER',
        'modal-content': '所有资源仅供学习交流使用，请勿用于商业用途。下载后请于24小时内删除。',
        'modal-ok': '确定',
        
        // SPA新增翻译
        'back-to-home': '返回',
        'download-list-title': '下载列表',
        'last-update-label': '最后更新',
        'download-method': '下载方式',
        'file-count': '文件数',
        'access-code': '提取码/访问密码',
        'validity': '资源有效期',
        'unlimited': '无期限',
        'download-note': '本站全部资源仅提供',
        'resource-provider': '本站全部资源仅提供',
        'and': '与',
        'as-download': '作为下载方式',
        'temp-page-note': '此页面暂为临时下载页面',
        'temp-page-text': '此页面暂为临时下载页面'
      },
      'en-us': {
        'navbar-brand': 'DATA CENTER',
        'nav-home-text': 'Home Page',
        'nav-download-text': 'Downloads',
        'nav-about-text': 'About',
        'language-text': 'Language',
        // 侧边栏
        'sidebar-home': 'Top Page',
        'sidebar-data': 'Download',
        'sidebar-settings': 'Settings',
        'sidebar-help': 'Help',
        'sidebar-game-download': 'Game Downloads',
        'sidebar-archive': 'Archive',
        
        'download-heading': 'Download',
        'game-heading': 'Game Downloads',
        'archive-heading': 'Archive',
        'other-heading': 'Other',
        'warning-text': 'Important:',
        'warning-detail': 'The OneDrive download channel will be removed soon. Please download required resources as soon as possible.',
        'latest-update-text': 'Latest Update',
        'latest-update-text-archive': 'Latest Update',
        'latest-update-text-other': 'Latest Update',
        'game-title': 'Game Title',
        'game-version': 'Version',
        'game-files': 'Files',
        'archive-title': 'Game Title',
        'archive-filetype': 'File Type',
        'archive-version': 'Version',
        'archive-files': 'Files',
        'other-title': 'Resource Name',
        'other-filetype': 'File Type',
        'other-files': 'Files',
        'download-all': 'Download All Game Resources',
        'download-info-text': 'Download Info:',
        'download-info-detail': 'All resources on this site are only available via <a href="#" class="mx-1">「Baidu Netdisk」</a> and <a href="#" class="mx-1">「One Drive」</a>',
        'notice-text': 'Notice:',
        'notice-detail': 'This page is a temporary download page, the official page is under development',
        
        // 弹窗文本
        'modal-title': 'About EVIL LEAKER',
        'modal-content': 'This is the about page content. This site provides various game resources for download. All resources are for learning and exchange purposes only. Do not use for commercial purposes. Please delete within 24 hours after download.',
        'modal-ok': 'OK',
        
        // SPA新增翻译
        'back-to-home': 'BACK',
        'download-list-title': 'Download List',
        'last-update-label': 'Last Update',
        'download-method': 'Download Method',
        'file-count': 'File Count',
        'access-code': 'Access Code/Password',
        'validity': 'Validity',
        'unlimited': 'Unlimited',
        'download-note': 'All resources are only available via',
        'resource-provider': 'All resources are only available via',
        'and': 'and',
        'as-download': 'as download methods',
        'temp-page-note': 'This is a temporary download page',
        'temp-page-text': 'This is a temporary download page'
      },
      'ja-jp': {
        'navbar-brand': 'DATA CENTER',
        'nav-home-text': 'ホームページ',
        'nav-download-text': 'N/A',
        'nav-about-text': 'について',
        'language-text': '言語',
        'sidebar-home': 'トップページ',
        'sidebar-data': 'ダウンロード',
        'sidebar-settings': '設定',
        'sidebar-help': 'ヘルプ',
        'sidebar-game-download': 'ゲームダウンロード',
        'sidebar-archive': 'アーカイブ',
        'download-heading': 'ダウンロード',
        'game-heading': 'ゲーム',
        'archive-heading': 'アーカイブ',
        'other-heading': 'その他',
        'warning-text': '重要:',
        'warning-detail': 'OneDriveダウンロードは近日中に終了します。',
        'latest-update-text': '最終更新',
        'latest-update-text-archive': '最終更新',
        'latest-update-text-other': '最終更新',
        'game-title': 'ゲームタイトル',
        'game-version': 'バージョン',
        'game-files': 'ファイル数',
        'archive-title': 'ゲームタイトル',
        'archive-filetype': 'ファイル形式',
        'archive-version': 'バージョン',
        'archive-files': 'ファイル数',
        'other-title': 'リソース名',
        'other-filetype': 'ファイル形式',
        'other-files': 'ファイル数',
        'download-all': '未使用',
        'download-info-text': 'ダウンロード情報:',
        'download-info-detail': '当サイトのすべてのリソースは<a href="#" class="mx-1">「百度网盘」</a>と<a href="#" class="mx-1">「One Drive」</a>でのみ提供されます',
        'notice-text': '注意:',
        'notice-detail': 'このページは一時的なダウンロードページです。公式ページは開発中です',
        
        // 弹窗文本
        'modal-title': 'EVIL LEAKER について',
        'modal-content': 'これは概要ページの内容です。当サイトは様々なゲームリソースを提供しています。すべてのリソースは学習と交流目的のみで使用し、商用利用は禁止です。ダウンロード後24時間以内に削除してください。',
        'modal-ok': '確認',
        
        // SPA新增翻译
        'back-to-home': '戻る',
        'download-list-title': 'ダウンロードリスト',
        'last-update-label': '最終更新',
        'download-method': 'ダウンロード方法',
        'file-count': 'ファイル数',
        'access-code': 'アクセスコード/パスワード',
        'validity': '有効期限',
        'unlimited': '無期限',
        'unlimited2': '無期限',
        'download-note': '当サイトのすべてのリソースは',
        'resource-provider': '当サイトのすべてのリソースは',
        'and': 'と',
        'as-download': 'でのみ提供されます',
        'temp-page-note': 'このページは一時的なダウンロードページです',
        'temp-page-text': 'このページは一時的なダウンロードページです'
      }
    };

    // 默认使用中文
    const langData = translations[lang] || translations['zh-cn'];
    
    // 更新所有文本元素
    for (const [id, text] of Object.entries(langData)) {
      const element = document.getElementById(id);
      if (element) {
        // 检查是否是HTML内容
        if (text.includes('<a') || id === 'modal-content') {
          element.innerHTML = text;
        } else {
          element.textContent = text;
        }
      }
    }
  }

  // 初始化语言
  function initLanguage() {
    // 获取URL中的语言参数
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'zh-cn';
    
    // 设置语言
    setLanguage(lang);
  }

  // 初始化页面
  initLanguage();
  
  // 语言切换功能
  document.querySelectorAll('.language-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('href').split('=')[1];
      window.location.search = `?lang=${lang}`;
    });
  });

  // 语言下拉菜单显示/隐藏功能
  languageBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    languageDropdown.classList.toggle('show');
  });
  
  // 点击页面其他地方关闭下拉菜单
  document.addEventListener('click', function(e) {
    if (!languageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
      languageDropdown.classList.remove('show');
    }
  });

  // 侧边栏折叠功能 - 只处理侧边栏和主内容区
  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
    
    // 保存折叠状态
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });
  
  mobileToggle.addEventListener('click', function() {
    sidebar.classList.toggle('show');
  });
  
  // 初始化折叠状态 - 只处理侧边栏和主内容区
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('collapsed');
  }
  
  // 弹窗功能
  // 显示弹窗
  document.addEventListener('click', function(e) {
    if (e.target.closest('#nav-about')) {
      e.preventDefault();
      modal.classList.add('show');
    }
  });

  // 关闭弹窗
  function closeModal() {
    modal.classList.remove('show');
  }

  modalClose.addEventListener('click', closeModal);
  modalOk.addEventListener('click', closeModal);

  // 点击外部关闭弹窗
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ================= SPA路由功能 =================
  // 页面内容定义
  const pages = {
    download: `
      <h1 class="page-title" id="download-heading">下载中心</h1>
      <div class="section">
        <h2 class="section-title">
          <i class="fas fa-gamepad"></i>
          <span id="game-heading">游戏下载</span>
        </h2>
        <div class="warning">
          <strong><i class="fas fa-exclamation-circle me-2"></i> <span id="warning-text">重要提示：</span></strong>
          <span id="warning-detail">本站OneDrive下载渠道将于近期下线，请尽快下载所需资源。</span>
        </div>
        <p class="mb-4"><strong><span id="latest-update-text">最后更新</span>: 2025/03/28</strong></p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th id="game-title">游戏名称</th>
                <th id="game-version">版本</th>
                <th id="game-files">文件数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#" data-page="sdhd"><i class="fas fa-link me-2"></i> CHUNITHM VERSE (SDHD)</a></td>
                <td>2.30</td>
                <td>7</td>
              </tr>
              <tr>
                <td><a href="#" data-page="sdez"><i class="fas fa-link me-2"></i> maimai DX PRiSM PLUS (SDEZ)</a></td>
                <td>1.56</td>
                <td>14</td>
              </tr>
              <tr>
                <td><a href="#" data-page="sddt"><i class="fas fa-link me-2"></i> O.N.G.E.K.I Re:Fresh</a></td>
                <td>1.50</td>
                <td>3</td>
              </tr>
              <tr>
                <td><a href="#" data-page="sded"><i class="fas fa-link me-2"></i> CARD MAKER</a></td>
                <td>1.39</td>
                <td>3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <a href="#" class="download-link">
          <i class="fas fa-download"></i>
          <span id="download-all">未使用</span>
        </a>
      </div>
      
      <div class="section">
        <h2 class="section-title">
          <i class="fas fa-archive"></i>
          <span id="archive-heading">存档下载</span>
        </h2>
        <p class="mb-4"><strong><span id="latest-update-text-archive">最后更新</span>: 2025/03/02</strong></p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th id="archive-title">游戏名称</th>
                <th id="archive-filetype">文件格式</th>
                <th id="archive-version">版本</th>
                <th id="archive-files">文件数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#" data-page="sdbt"><i class="fas fa-link me-2"></i> CHUNITHM (SDBT)</a></td>
                <td>vhd</td>
                <td>1.00~1.51</td>
                <td>11</td>
              </tr>
              <tr>
                <td><a href="#"><i class="fas fa-link me-2"></i> CHUNITHM NEW / NEW PLUS</a></td>
                <td>N/A</td>
                <td>2.00 / 2.05</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td><a href="#"><i class="fas fa-link me-2"></i> CHUNITHM SUN / SUN PLUS</a></td>
                <td>N/A</td>
                <td>2.10 / 2.15</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td><a href="#"><i class="fas fa-link me-2"></i> CHUNITHM LUMINOUS</a></td>
                <td>N/A</td>
                <td>2.20</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td><a href="#" data-page="lmnp"><i class="fas fa-link me-2"></i> CHUNITHM LUMINOUS PLUS</a></td>
                <td>vhd</td>
                <td>2.27</td>
                <td>6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">
          <i class="fas fa-folder-plus"></i>
          <span id="other-heading">其他资源</span>
        </h2>
        <p class="mb-4"><strong><span id="latest-update-text-other">最后更新</span>: 2024/12/16</strong></p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th id="other-title">资源名称</th>
                <th id="other-filetype">文件格式</th>
                <th id="other-files">文件数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>NONE</td>
                <td>N/A</td>
                <td>N/A</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="warning mt-4">
          <strong><i class="fas fa-info-circle me-2"></i> <span id="download-info-text">下载说明：</span></strong>
          <span id="download-info-detail">本站全部资源仅提供<a href="#" class="mx-1">「百度网盘」</a>与<a href="#" class="mx-1">「One Drive」</a>作为下载方式</span>
        </div>
        <div class="warning">
          <strong><i class="fas fa-exclamation-triangle me-2"></i> <span id="notice-text">注意：</span></strong>
          <span id="notice-detail">此页面暂为临时下载页面，正式页面正在开发中</span>
        </div>
      </div>
      
      <footer>
        <p>SEGAY FEIWU</p>
        <p>1145141919810</p>
      </footer>
    `,
    
    // 游戏详情页示例
    sdhd: `
      <div class="game-detail">
        <h1 class="page-title">CHUNITHM VERSE</h1>
        <button class="back-button" data-page="download">
          <i class="fas fa-arrow-left me-2"></i>
          <span id="back-to-home">返回</span>
        </button>
        
        <div class="section">
          <h2 class="section-title">
            <i class="fas fa-download"></i>
            <span id="download-list-title">下载列表</span>
          </h2>
          
          <div class="mb-4">
            <p><span id="last-update-label">最后更新</span>: 2025/03/09</p>
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <td id="download-method">下载方式</td>
                    <td id="file-count">文件数</td>
                    <td id="access-code">提取码/访问密码</td>
                    <td id="validity">资源有效期</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th><a href="https://pan.baidu.com/s/1lblVy58yMv5r-5vJXr55Hg" target="_blank">百度网盘</a></th>
                    <td>7</td>
                    <td>vrse</td>
                    <td id="unlimited">无期限</td>
                  </tr>
                  <tr>
                    <th><a href="https://hitiko-my.sharepoint.com/:f:/p/evilleaker/Eu_T210f3E5Ihq5yJfZ46fwBEOB9OXz7VfH9naE7bAEcIw?e=9XDsnp" target="_blank">OneDrive</a></th>
                    <td>7</td>
                    <td>59a9cd6745</td>
                    <td id="unlimited2">无期限</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="download-info">
              <p><strong id="download-note"><span id="resource-provider">本站全部资源仅提供</span> 
                <a href="#">「百度网盘」</a> <span id="and">与</span> <a href="#">「One Drive」</a> 
                <span id="as-download">作为下载方式</span></strong></p>
              <p><strong id="temp-page-note"><span id="temp-page-text">此页面暂为临时下载页面</span></strong></p>
            </div>
          </div>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,
    
    // ICF Editor
    icfeditor: `
    <div class="game-detail">
      <h1 class="page-title">ICF Editor</h1>
      <button class="back-button" data-page="download">
        <i class="fas fa-arrow-left me-2"></i>
        <span id="back-to-home">返回</span>
      </button>
      
      <div class="section iframe-container">
        <iframe 
          src="icfemain.html" 
          frameborder="0"
          class="icf-editor-iframe">
        </iframe>
      </div>
      
      <footer>
        <p>SEGAY FEIWU</p>
        <p>1145141919810</p>
      </footer>
    </div>
   `,
    
    // 其他页面模板
    sdez: `<div class="game-detail">...coming soon...</div>`,
    sddt: `<div class="game-detail">...coming soon...</div>`,
    sded: `<div class="game-detail">...coming soon...</div>`,
    sdbt: `<div class="game-detail">...coming soon...</div>`,
    lmnp: `<div class="game-detail">...coming soon...</div>`,
    
    // 其他页面
    'data-center': `<div class="section"><h1>数据中心</h1><p>数据中心内容...</p></div>`,
    settings: `<div class="section"><h1>设置</h1><p>设置内容...</p></div>`,
    help: `<div class="section"><h1>帮助</h1><p>帮助内容...</p></div>`,
  };

  // 加载页面内容
  function loadPage(pageId) {
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) return;
    
    // 显示加载状态
    document.body.classList.add('spa-loading');
    
    // 模拟网络延迟
    setTimeout(() => {
      if (pages[pageId]) {
        contentContainer.innerHTML = pages[pageId];
        initLanguage(); // 重新初始化语言
        
        // 绑定返回按钮事件
        const backButton = contentContainer.querySelector('.back-button');
        if (backButton) {
          backButton.addEventListener('click', function(e) {
            e.preventDefault();
            loadPage(this.getAttribute('data-page'));
          });
        }
        
        // 处理 iframe 高度
        const iframe = contentContainer.querySelector('.icf-editor-iframe');
        if (iframe) {
          // 设置默认高度
          iframe.style.height = '800px';
          
          // 尝试调整高度
          const adjustIframeHeight = () => {
            try {
              const bodyHeight = iframe.contentWindow.document.body.scrollHeight;
              if (bodyHeight > 0) {
                iframe.style.height = (bodyHeight + 20) + 'px';
              }
            } catch (e) {
              console.log('跨域安全限制，无法自动调整高度');
            }
          };
          
          // 初始调整
          adjustIframeHeight();
          
          // 添加事件监听
          iframe.addEventListener('load', adjustIframeHeight);
        }
      } else {
        contentContainer.innerHTML = `<div class="section"><h1>页面未找到</h1><p>请求的页面不存在</p></div>`;
      }
      
      // 移除加载状态
      document.body.classList.remove('spa-loading');
      
      // 更新活动菜单项
      updateActiveMenuItem(pageId);
    }, 300);
  }

  // 更新活动菜单项
  function updateActiveMenuItem(activePage) {
    // 移除所有活动状态
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.classList.remove('active');
    });
    
    // 添加当前活动状态
    const activeLink = document.querySelector(`.sidebar-nav a[data-page="${activePage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // 更新顶部导航
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });
    
    if (activePage === 'home') {
      document.getElementById('nav-download').classList.add('active');
      document.getElementById('nav-home').classList.add('active');
    }
  }

  // 事件委托处理页面导航
  document.body.addEventListener('click', function(e) {
    // 处理页面链接
    const pageLink = e.target.closest('a[data-page]');
    if (pageLink) {
      e.preventDefault();
      const pageId = pageLink.getAttribute('data-page');
      loadPage(pageId);
    }
  });

  // 初始加载首页
  loadPage('home');
});