(function() {
    'use strict';

    if (window.__mobileSidebarInitialized) {
        return;
    }
    window.__mobileSidebarInitialized = true;

    const SidebarManager = {
        isOpen: false,
        isAnimating: false,
        scrollPosition: 0,
        initialized: false,

        elements: {
            sidebar: null,
            mobileToggle: null,
            overlay: null,
            body: document.body
        },

        init: function() {
            if (this.initialized) return;

            this.elements.sidebar = document.querySelector('.sidebar');
            this.elements.mobileToggle = document.querySelector('.mobile-toggle');
            
            if (!this.elements.sidebar || !this.elements.mobileToggle) {
                setTimeout(() => this.init(), 500);
                return;
            }

            this.cleanup();
            this.setupOverlay();
            this.bindEvents();
            this.resetState();
            this.setupViewportHeight();
            this.initialized = true;
        },

        cleanup: function() {
            const pcToggle = document.querySelector('.sidebar-toggle');
            if (pcToggle && window.innerWidth <= 992) {
                pcToggle.style.display = 'none';
            }

            const oldOverlays = document.querySelectorAll('.sidebar-overlay:not(#sidebar-overlay)');
            oldOverlays.forEach(overlay => overlay.remove());
        },

        setupOverlay: function() {
            let overlay = document.getElementById('sidebar-overlay');
            
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'sidebar-overlay';
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }
            this.elements.overlay = overlay;
        },

        setupViewportHeight: function() {
            const setVH = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);
        },

        open: function() {
            if (this.isOpen || this.isAnimating) return;
            if (window.innerWidth > 992) return;
            this.isAnimating = true;
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
            
            const { sidebar, overlay, mobileToggle, body } = this.elements;

            overlay.classList.add('show');
            sidebar.classList.add('show');
            if (mobileToggle) mobileToggle.classList.add('active');
            body.classList.add('mobile-sidebar-open');

            const hamburgerIcon = mobileToggle ? mobileToggle.querySelector('.hamburger-icon') : null;
            if (hamburgerIcon) {
                hamburgerIcon.classList.add('open');
            }

            body.style.cssText = `
                position: fixed;
                top: -${this.scrollPosition}px;
                left: 0;
                right: 0;
                width: 100%;
                overflow: hidden;
            `;

            sidebar.scrollTop = 0;

            setTimeout(() => {
                this.isOpen = true;
                this.isAnimating = false;
            }, 300);
        },

        close: function() {
            if (!this.isOpen || this.isAnimating) return;
            this.isAnimating = true;
            const { sidebar, overlay, mobileToggle, body } = this.elements;

            overlay.classList.remove('show');
            sidebar.classList.remove('show');
            if (mobileToggle) mobileToggle.classList.remove('active');
            body.classList.remove('mobile-sidebar-open');

            const hamburgerIcon = mobileToggle ? mobileToggle.querySelector('.hamburger-icon') : null;
            if (hamburgerIcon) {
                hamburgerIcon.classList.remove('open');
            }

            body.style.cssText = '';
            window.scrollTo(0, this.scrollPosition);

            setTimeout(() => {
                this.isOpen = false;
                this.isAnimating = false;
            }, 300);
        },

        toggle: function() {
            if (this.isAnimating) return;
            
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        bindEvents: function() {
            const self = this;
            const { mobileToggle, overlay, sidebar } = this.elements;

            if (mobileToggle) {
                const newToggle = mobileToggle.cloneNode(true);
                mobileToggle.parentNode.replaceChild(newToggle, mobileToggle);
                this.elements.mobileToggle = newToggle;
                
                newToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (window.innerWidth <= 992) {
                        self.toggle();
                    }
                }, false);

            }

            if (overlay) {
                overlay.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.close();
                }, false);

            }

            if (sidebar) {
                sidebar.addEventListener('click', function(e) {
                    const link = e.target.closest('a[data-page], a[href]');
                    if (link && window.innerWidth <= 992 && self.isOpen) {
                        setTimeout(() => self.close(), 150);
                    }
                }, false);

                sidebar.addEventListener('touchmove', function(e) {
                    if (!self.isOpen) return;
                    e.stopPropagation();
                }, { passive: true });
            }

            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    if (window.innerWidth > 992 && self.isOpen) {
                        self.close();
                    }

                    if (window.innerWidth <= 992 && self.elements.mobileToggle) {
                        self.elements.mobileToggle.style.display = 'flex';
                    }

                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', `${vh}px`);
                }, 250);
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && self.isOpen) {
                    self.close();
                }
            });

            if (typeof window.loadPage === 'function') {
                const originalLoadPage = window.loadPage;
                window.loadPage = function(...args) {
                    if (self.isOpen && window.innerWidth <= 992) {
                        self.close();
                    }
                    return originalLoadPage.apply(this, args);
                };
            }
        },

        resetState: function() {
            const { sidebar, overlay, mobileToggle, body } = this.elements;
            
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                if (mobileToggle) {
                    mobileToggle.classList.remove('active');
                    mobileToggle.style.display = 'flex';

                    const hamburgerIcon = mobileToggle.querySelector('.hamburger-icon');
                    if (hamburgerIcon) {
                        hamburgerIcon.classList.remove('open');

                    }
                }
                body.classList.remove('mobile-sidebar-open');
                body.style.cssText = '';
                
                this.isOpen = false;
            } else {
                if (mobileToggle) mobileToggle.style.display = 'none';
                overlay.classList.remove('show');
                sidebar.classList.remove('show');
                sidebar.style.transform = '';
            }
        }
    };

    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => SidebarManager.init(), 100);
            });
        } else {
            setTimeout(() => SidebarManager.init(), 100);
        }
    }

    window.MobileSidebar = {
        open: () => SidebarManager.open(),
        close: () => SidebarManager.close(),
        toggle: () => SidebarManager.toggle(),
        isOpen: () => SidebarManager.isOpen,
        reinit: () => {
            SidebarManager.initialized = false;
            SidebarManager.init();
        }
    };

    initialize();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && SidebarManager.initialized) {
            SidebarManager.resetState();
        }
    });
    
})();