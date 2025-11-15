document.addEventListener("DOMContentLoaded", function() {
    function cleanupSidebarOverlays() {
        const overlays = document.querySelectorAll('.sidebar-overlay.dynamic-overlay');
        overlays.forEach(overlay => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
    }

    const staticOverlay = document.getElementById('sidebar-overlay');
    if (staticOverlay) {
        staticOverlay.remove();
    }

    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const modal = document.getElementById('about-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalOk = document.getElementById('modal-ok');

    if (window.innerWidth <= 992 && sidebarToggle) {
        sidebarToggle.style.display = 'none';
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 992) {
            if (sidebarToggle) sidebarToggle.style.display = 'none';
            cleanupSidebarOverlays();
            const hamburgerIcon = mobileToggle?.querySelector('.hamburger-icon');
            if (hamburgerIcon && !sidebar.classList.contains('show')) {
                hamburgerIcon.classList.remove('open');
            }
        } else {
            if (sidebarToggle) sidebarToggle.style.display = 'block';
            cleanupSidebarOverlays();
        }
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth <= 992) return;
            
            sidebar.classList.toggle('collapsed');
            if (mainContent) {
                mainContent.classList.toggle('collapsed');
            }

            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
        let hamburgerIcon = mobileToggle.querySelector('.hamburger-icon');
        if (!hamburgerIcon) {

            const oldIcon = mobileToggle.querySelector('i');
            if (oldIcon) {
                oldIcon.remove();
            }

            hamburgerIcon = document.createElement('span');
            hamburgerIcon.className = 'hamburger-icon';
            hamburgerIcon.innerHTML = '<span></span><span></span><span></span>';
            mobileToggle.appendChild(hamburgerIcon);
        }

        const wasOpen = sidebar.classList.contains('show');
        sidebar.classList.toggle('show');
        const isOpen = sidebar.classList.contains('show');

        if (hamburgerIcon) {
            if (isOpen) {
                hamburgerIcon.classList.add('open');
                void hamburgerIcon.offsetWidth;
            } else {
                hamburgerIcon.classList.remove('open');
            }

            console.log('Hamburger icon classes:', hamburgerIcon.className);
            console.log('Has open class?', hamburgerIcon.classList.contains('open'));
        }

        if (window.innerWidth <= 992) {
            if (isOpen) {
                cleanupSidebarOverlays();
                
                document.body.classList.add('mobile-sidebar-open');
                document.body.classList.remove('mobile-sidebar-closed');
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay dynamic-overlay show';
                overlay.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: rgba(0, 0, 0, 0.5) !important;
                    z-index: 899 !important;
                    display: block !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                `;
                document.body.appendChild(overlay);

                overlay.offsetHeight;
                overlay.addEventListener('click', function() {
                    console.log('Overlay clicked, closing sidebar');
                    
                    sidebar.classList.remove('show');
                    document.body.classList.remove('mobile-sidebar-open');
                    document.body.classList.add('mobile-sidebar-closed');

                    const currentHamburgerIcon = mobileToggle.querySelector('.hamburger-icon');
                    if (currentHamburgerIcon) {
                        console.log('Removing open class from hamburger (overlay click)');
                        currentHamburgerIcon.classList.remove('open');
                    }
                    
                    cleanupSidebarOverlays();
                });

                sidebar.scrollTop = 0;
            } else {
                cleanupSidebarOverlays();
                document.body.classList.remove('mobile-sidebar-open');
                document.body.classList.add('mobile-sidebar-closed');
            }
        }
    });
}

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && sidebar && window.innerWidth > 992) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('collapsed');
        }
    }

    document.addEventListener('click', function(e) {
        if (e.target.closest('#nav-about')) {
            e.preventDefault();
            if (modal) {
                modal.classList.add('show');
                if (typeof languageModule !== 'undefined') {
                    languageModule.initLanguage();
                }
            }
        }
    });

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

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && 
            document.body.classList.contains('mobile-sidebar-open')) {

            if (!sidebar.contains(e.target) && 
                !mobileToggle.contains(e.target) && 
                !e.target.classList.contains('sidebar-overlay')) {

                return;
            }
        }
    });

    if (typeof window.loadPage === 'function') {
        const originalLoadPage = window.loadPage;
        window.loadPage = function(...args) {
            if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
                document.body.classList.remove('mobile-sidebar-open');
                document.body.classList.add('mobile-sidebar-closed');
                const hamburgerIcon = mobileToggle?.querySelector('.hamburger-icon');
                if (hamburgerIcon) {
                    hamburgerIcon.classList.remove('open');
                }
                cleanupSidebarOverlays();
            }
            return originalLoadPage.apply(this, args);
        };
    }

    window.addEventListener('beforeunload', function() {
        cleanupSidebarOverlays();
    });
});