// 移动端优化脚本

// 移动端工具类
const MobileUtils = {
    // 检测是否为移动设备
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    // 检测是否为触摸设备
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // 获取设备类型
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 480) return 'mobile-small';
        if (width <= 768) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    },
    
    // 添加移动端事件监听
    addMobileEvents() {
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 防止长按选择文本
        document.addEventListener('selectstart', function (event) {
            if (this.isMobile()) {
                event.preventDefault();
            }
        });
        
        // 处理移动端键盘弹出
        window.addEventListener('resize', this.handleKeyboardResize.bind(this));
    },
    
    // 处理键盘弹出
    handleKeyboardResize() {
        if (this.isMobile()) {
            const viewportHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            if (viewportHeight < documentHeight * 0.75) {
                // 键盘弹出，调整布局
                document.body.classList.add('keyboard-open');
            } else {
                // 键盘收起
                document.body.classList.remove('keyboard-open');
            }
        }
    },
    
    // 优化滚动性能
    optimizeScroll() {
        if (this.isMobile()) {
            // 添加滚动优化样式
            const style = document.createElement('style');
            style.textContent = `
                .scroll-container {
                    -webkit-overflow-scrolling: touch;
                    overflow-scrolling: touch;
                }
                .smooth-scroll {
                    scroll-behavior: smooth;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // 显示移动端提示
    showMobileTip(message, duration = 3000) {
        if (!this.isMobile()) return;
        
        const tip = document.createElement('div');
        tip.className = 'mobile-tip';
        tip.textContent = message;
        document.body.appendChild(tip);
        
        setTimeout(() => {
            tip.remove();
        }, duration);
    },
    
    // 优化触摸反馈
    addTouchFeedback() {
        if (!this.isTouchDevice()) return;
        
        document.addEventListener('touchstart', function(e) {
            const target = e.target.closest('.el-button, .el-menu-item, .course-card, .mobile-nav-item');
            if (target) {
                target.classList.add('touch-active');
            }
        });
        
        document.addEventListener('touchend', function(e) {
            const target = e.target.closest('.el-button, .el-menu-item, .course-card, .mobile-nav-item');
            if (target) {
                setTimeout(() => {
                    target.classList.remove('touch-active');
                }, 150);
            }
        });
    }
};

// 移动端菜单管理
const MobileMenu = {
    init() {
        this.createMobileMenu();
        this.bindEvents();
    },
    
    createMobileMenu() {
        const header = document.querySelector('.header-content');
        if (!header) return;
        
        // 创建移动端菜单按钮
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '<i class="el-icon-menu"></i>';
        menuBtn.onclick = this.toggleMenu.bind(this);
        
        // 创建移动端菜单
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.id = 'mobile-menu';
        
        // 获取原有菜单项
        const menuItems = document.querySelectorAll('.header-menu .el-menu-item');
        menuItems.forEach(item => {
            const mobileItem = document.createElement('a');
            mobileItem.className = 'mobile-menu-item';
            mobileItem.href = '#';
            mobileItem.textContent = item.textContent.trim();
            mobileItem.onclick = (e) => {
                e.preventDefault();
                this.handleMenuClick(item.getAttribute('index'));
            };
            mobileMenu.appendChild(mobileItem);
        });
        
        // 添加用户操作项
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            const userItems = userSection.querySelectorAll('.el-dropdown-item');
            userItems.forEach(item => {
                const mobileItem = document.createElement('a');
                mobileItem.className = 'mobile-menu-item';
                mobileItem.href = '#';
                mobileItem.textContent = item.textContent.trim();
                mobileItem.onclick = (e) => {
                    e.preventDefault();
                    this.handleUserCommand(item.getAttribute('command'));
                };
                mobileMenu.appendChild(mobileItem);
            });
        }
        
        document.body.appendChild(mobileMenu);
        
        // 将菜单按钮添加到头部
        const navSection = document.querySelector('.nav-section');
        if (navSection) {
            navSection.appendChild(menuBtn);
        }
    },
    
    bindEvents() {
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('mobile-menu');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            
            if (menu && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMenu();
            }
        });
    },
    
    toggleMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.toggle('show');
        }
    },
    
    closeMenu() {
        const menu = document.getElementById('mobile-menu');
        if (menu) {
            menu.classList.remove('show');
        }
    },
    
    handleMenuClick(index) {
        this.closeMenu();
        // 触发原有菜单点击事件
        if (window.app && window.app.handleMenuSelect) {
            window.app.handleMenuSelect(index);
        }
    },
    
    handleUserCommand(command) {
        this.closeMenu();
        // 触发原有用户命令事件
        if (window.app && window.app.handleUserCommand) {
            window.app.handleUserCommand(command);
        }
    }
};

// 移动端底部导航
const MobileBottomNav = {
    init() {
        if (!MobileUtils.isMobile()) return;
        
        this.createBottomNav();
        this.bindEvents();
    },
    
    createBottomNav() {
        const bottomNav = document.createElement('div');
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.innerHTML = `
            <a href="#" class="mobile-nav-item active" data-index="courses">
                <i class="el-icon-menu"></i>
                <span>课程</span>
            </a>
            <a href="#" class="mobile-nav-item" data-index="my-selections">
                <i class="el-icon-s-order"></i>
                <span>选课</span>
            </a>
            <a href="#" class="mobile-nav-item" data-index="favorites">
                <i class="el-icon-star-on"></i>
                <span>收藏</span>
            </a>
            <a href="#" class="mobile-nav-item" data-index="history">
                <i class="el-icon-time"></i>
                <span>历史</span>
            </a>
        `;
        
        document.body.appendChild(bottomNav);
    },
    
    bindEvents() {
        const navItems = document.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const index = item.getAttribute('data-index');
                this.setActiveItem(item);
                this.handleNavClick(index);
            });
        });
    },
    
    setActiveItem(activeItem) {
        const navItems = document.querySelectorAll('.mobile-nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    },
    
    handleNavClick(index) {
        if (window.app && window.app.handleMenuSelect) {
            window.app.handleMenuSelect(index);
        }
    }
};

// 移动端手势支持
const MobileGestures = {
    init() {
        if (!MobileUtils.isTouchDevice()) return;
        
        this.addSwipeSupport();
        this.addPullToRefresh();
    },
    
    addSwipeSupport() {
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 判断是否为有效滑动
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // 左滑
                    this.handleSwipeLeft();
                } else {
                    // 右滑
                    this.handleSwipeRight();
                }
            }
        });
    },
    
    handleSwipeLeft() {
        // 左滑逻辑，可以用于切换页面
        console.log('左滑');
    },
    
    handleSwipeRight() {
        // 右滑逻辑，可以用于返回
        console.log('右滑');
    },
    
    addPullToRefresh() {
        let startY = 0;
        let isPulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            const currentY = e.touches[0].clientY;
            const diffY = currentY - startY;
            
            if (diffY > 0) {
                // 下拉刷新
                this.showPullToRefresh(diffY);
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isPulling) return;
            
            isPulling = false;
            this.hidePullToRefresh();
        });
    },
    
    showPullToRefresh(diffY) {
        // 显示下拉刷新指示器
        if (diffY > 100) {
            MobileUtils.showMobileTip('松开刷新');
        }
    },
    
    hidePullToRefresh() {
        // 隐藏下拉刷新指示器
    }
};

// 移动端性能优化
const MobilePerformance = {
    init() {
        this.optimizeImages();
        this.lazyLoadContent();
        this.debounceScroll();
    },
    
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // 添加懒加载
            img.setAttribute('loading', 'lazy');
            
            // 优化图片大小
            if (MobileUtils.isMobile()) {
                const src = img.src;
                if (src.includes('?')) {
                    img.src = src + '&w=400&q=80';
                } else {
                    img.src = src + '?w=400&q=80';
                }
            }
        });
    },
    
    lazyLoadContent() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add('loaded');
                    observer.unobserve(element);
                }
            });
        });
        
        const lazyElements = document.querySelectorAll('.lazy-load');
        lazyElements.forEach(el => observer.observe(el));
    },
    
    debounceScroll() {
        let scrollTimer = null;
        
        window.addEventListener('scroll', () => {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            scrollTimer = setTimeout(() => {
                this.handleScroll();
            }, 100);
        });
    },
    
    handleScroll() {
        // 滚动处理逻辑
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 显示/隐藏底部导航
        const bottomNav = document.querySelector('.mobile-bottom-nav');
        if (bottomNav) {
            if (scrollTop > 100) {
                bottomNav.style.transform = 'translateY(0)';
            } else {
                bottomNav.style.transform = 'translateY(100%)';
            }
        }
    }
};

// 移动端初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加移动端样式
    const mobileCSS = document.createElement('link');
    mobileCSS.rel = 'stylesheet';
    mobileCSS.href = '/css/mobile.css';
    document.head.appendChild(mobileCSS);
    
    // 初始化移动端功能
    MobileUtils.addMobileEvents();
    MobileUtils.optimizeScroll();
    MobileUtils.addTouchFeedback();
    
    MobileMenu.init();
    MobileBottomNav.init();
    MobileGestures.init();
    MobilePerformance.init();
    
    // 显示移动端提示
    if (MobileUtils.isMobile()) {
        MobileUtils.showMobileTip('欢迎使用移动端体育选课系统！');
    }
});

// 导出移动端工具
window.MobileUtils = MobileUtils;
window.MobileMenu = MobileMenu;
window.MobileBottomNav = MobileBottomNav;
