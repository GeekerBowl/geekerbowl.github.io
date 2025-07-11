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
        });
    }
    
    // 初始化折叠状态 - 只处理侧边栏和主内容区
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar) {
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
    
    // 公告详情弹窗功能 - 修复位置：移出DOMContentLoaded嵌套
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.announcement-card');
        if (card) {
            const id = card.getAttribute('data-id');
            showAnnouncementModal(id);
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
                if (typeof loadPage === 'function') {
                    loadPage(this.getAttribute('data-page'));
                }
            });
        });
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
        }
    };
    
    return announcements[id] || null;
}