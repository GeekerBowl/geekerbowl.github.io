// datacenter.js - 主功能模块
document.addEventListener("DOMContentLoaded", function() {
    // 获取DOM元素
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mobileToggle = document.querySelector('.mobile-toggle');
    
    // 弹窗相关元素
    const modal = document.getElementById('about-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalOk = document.getElementById('modal-ok');
    
    // 侧边栏折叠功能 - 只处理侧边栏和主内容区
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            // 移动端不处理折叠按钮点击
            if (window.innerWidth <= 992) return;
            
            sidebar.classList.toggle('collapsed');
            if (mainContent) {
                mainContent.classList.toggle('collapsed');
            }
            
            // 保存折叠状态
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            
            // 移动端展开时添加特殊标记
            if (window.innerWidth <= 992) {
                document.body.classList.toggle('mobile-sidebar-open', sidebar.classList.contains('show'));
                document.body.classList.toggle('mobile-sidebar-closed', !sidebar.classList.contains('show'));
            }
        });
    }
    
    // 初始化折叠状态 - 只处理侧边栏和主内容区
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar && window.innerWidth > 992) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('collapsed');
        }
    }
    
    // 弹窗功能
    // 显示弹窗
    document.addEventListener('click', function(e) {
        if (e.target.closest('#nav-about')) {
            e.preventDefault();
            if (modal) {
                modal.classList.add('show');
                
                // 确保弹窗内容使用当前语言
                if (typeof languageModule !== 'undefined') {
                    languageModule.initLanguage();
                }
            }
        }
    });

    // 关闭弹窗
    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOk) {
        modalOk.addEventListener('click', closeModal);
    }

    // 点击外部关闭弹窗
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // 公告详情弹窗功能
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.announcement-card');
        if (card) {
            const id = card.getAttribute('data-id');
            showAnnouncementModal(id);
        }
        
        const listItem = e.target.closest('.announcement-item');
        if (listItem) {
            const id = listItem.getAttribute('data-id');
            showAnnouncementModal(id);
        }
    });
    
    // 点击遮罩层关闭侧边栏
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && 
            document.body.classList.contains('mobile-sidebar-open') && 
            e.target === document.body.querySelector('::after')) {
            sidebar.classList.remove('show');
            document.body.classList.remove('mobile-sidebar-open');
            document.body.classList.add('mobile-sidebar-closed');
        }
    });
});

// 显示公告详情弹窗
function showAnnouncementModal(id) {
    const modal = document.getElementById('announcement-modal');
    if (!modal) return;
    
    // 根据ID获取公告内容
    const announcement = getAnnouncementById(id);
    
    if (announcement) {
        // 更新弹窗内容
        const titleElement = document.getElementById('announcement-title');
        const dateElement = document.getElementById('announcement-date');
        const contentElement = document.getElementById('announcement-content');
        
        if (titleElement) titleElement.textContent = announcement.title;
        if (dateElement) dateElement.textContent = announcement.date;
        if (contentElement) contentElement.innerHTML = announcement.content;
        
        // 显示弹窗
        modal.classList.add('show');
        
        // 绑定弹窗内的页面导航
        const pageLinks = modal.querySelectorAll('[data-page]');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                modal.classList.remove('show');
                
                // 移动端切换页面时关闭侧边栏
                if (window.innerWidth <= 992) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) sidebar.classList.remove('show');
                    document.body.classList.remove('mobile-sidebar-open');
                    document.body.classList.add('mobile-sidebar-closed');
                }
                
                if (typeof loadPage === 'function') {
                    loadPage(this.getAttribute('data-page'));
                }
            });
        });
        
        // 绑定关闭按钮
        const closeBtn = document.getElementById('announcement-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('show');
            });
        }
    }
}

// 获取公告数据
function getAnnouncementById(id) {
    const announcements = {
        '1': {
            title: 'OneDrive下载渠道下线通知',
            date: '2025/07/11',
            content: `
                <div class="announcement-content">
                    <p>本站OneDrive下载渠道将于近期下线。</p>
                    
                    <h4>影响范围</h4>
                    <ul>
                        <li>所有资源下载链接</li>
                    </ul>
                    
                    <h4>替代方案</h4>
                    <p>请使用百度网盘下载资源，正在寻找替代渠道。</p>
                </div>
            `
        },
        '2': {
            title: 'maimai DX PRiSM PLUS 更新',
            date: '2025/07/11',
            content: `
                <div class="announcement-content">
                    <p>maimai DX PRiSM PLUS opt更新</p>
                    
                    <h4>更新内容</h4>
                    <ul>
                        <li>option包中增加K021</li>
                    </ul>
                    
                    <h4>下载方式</h4>
                    <p>请前往<a href="#" data-page="sdez">下载中心</a>下载最新option包</p>
                </div>
            `
        },
        '3': {
            title: '数据中心新功能上线',
            date: '2025/07/11',
            content: `
                <div class="announcement-content">
                    <p>数据中心新增实用工具模块，包含多个实用工具，帮助您更好地管理游戏资源。</p>
                    
                    <h4>新增工具</h4>
                    <ul>
                        <li>ICF编辑器：用于编辑和查看ICF文件</li>
                        <li>7zip：可提取HDD镜像中的数据</li>
                        <li>Runtime：运行HDD所必要的系统组件</li>
                        <li>MaiChartManager：管理游戏Mod与资源</li>
                    </ul>
                    
                    <p>请前往<a href="#" data-page="tools">实用工具</a>页面使用或下载这些工具</p>
                </div>
            `
        },
        '4': {
            title: '数据中心维护通知',
            date: '2025/07/04',
            content: `
                <div class="announcement-content">
                    <p>数据中心将于本周日进行系统维护。</p>
                    
                    <h4>维护时间</h4>
                    <ul>
                        <li>开始时间：2025年7月6日 02:00 (UTC+8)</li>
                        <li>预计时长：2小时</li>
                    </ul>
                    
                    <h4>影响范围</h4>
                    <p>维护期间，所有下载服务将暂时不可用，其他功能不受影响。</p>
                </div>
            `
        },
        '5': {
            title: 'CHUNITHM VERSE 新版本发布',
            date: '2025/07/01',
            content: `
                <div class="announcement-content">
                    <p>CHUNITHM VERSE 2.31版本现已上线。</p>
                    
                    <h4>新增内容</h4>
                    <ul>
                        <li>10首全新曲目</li>
                        <li>3个新角色</li>
                        <li>世界模式新增第7章</li>
                    </ul>
                    
                    <h4>下载方式</h4>
                    <p>请前往<a href="#" data-page="sdhd">CHUNITHM VERSE下载页面</a>获取最新版本</p>
                </div>
            `
        },
        '6': {
            title: '下载方式变更通知',
            date: '2025/06/28',
            content: `
                <div class="announcement-content">
                    <p>百度网盘下载方式已更新。</p>
                    
                    <h4>变更内容</h4>
                    <ul>
                        <li>所有资源提取码已更新</li>
                        <li>新增文件校验功能</li>
                    </ul>
                    
                    <h4>注意事项</h4>
                    <p>请使用最新提取码下载资源，旧提取码已失效。</p>
                </div>
            `
        }
    };
    
    return announcements[id] || null;
}

// 鼠标指针功能实现
document.addEventListener("DOMContentLoaded", function() {
  // 初始化鼠标指针设置
  const savedCursorStyle = localStorage.getItem('cursorStyle') || 'style1';
  applyCursorStyle(savedCursorStyle);
  
  // 设置页面中的指针选项事件处理
  document.addEventListener('click', function(e) {
    if (e.target.closest('.cursor-option')) {
      const option = e.target.closest('.cursor-option');
      const style = option.dataset.style;
      applyCursorStyle(style);
      localStorage.setItem('cursorStyle', style);
      
      // 更新UI选择状态
      document.querySelectorAll('.cursor-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      option.classList.add('selected');
    }
  });
  
  // 应用指针样式
  function applyCursorStyle(style) {
    document.body.classList.remove('cursor-style1', 'cursor-style2');
    document.body.classList.add(`cursor-${style}`);
  }
});