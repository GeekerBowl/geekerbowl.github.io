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
            
            // 确保弹窗内容使用当前语言
            if (typeof languageModule !== 'undefined') {
                languageModule.initLanguage();
            }
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
});