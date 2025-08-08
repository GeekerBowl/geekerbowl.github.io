// spa.js - 单页面应用主模块
// 用户状态管理
let currentUser = null;

// 检查登录状态
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    fetchUserInfo(token);
  } else {
    showAuthLinks();
  }
}

// 获取用户信息
function fetchUserInfo(token) {
  fetch('https://api.am-all.com.cn/api/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    return response.json();
  })
  .then(user => {
    currentUser = user;
    updateUserInfo(user);
    showUserInfo();
  })
  .catch(error => {
    console.error(error);
    // 清除无效的token
    localStorage.removeItem('token');
    showAuthLinks();
  });
}

// 更新用户信息显示
function updateUserInfo(user) {
  // PC视图
  const userAvatarPc = document.getElementById('user-avatar-pc');
  const userNicknamePc = document.getElementById('user-nickname-pc');
  
  if (userAvatarPc && user.avatar) {
    userAvatarPc.src = user.avatar;
  }
  if (userNicknamePc) {
    userNicknamePc.textContent = user.nickname || user.username;
  }
  
  // 移动视图
  const userAvatarMobile = document.getElementById('user-avatar-mobile');
  const userNicknameMobile = document.getElementById('user-nickname-mobile');
  
  if (userAvatarMobile && user.avatar) {
    userAvatarMobile.src = user.avatar;
  }
  if (userNicknameMobile) {
    userNicknameMobile.textContent = user.nickname || user.username;
  }
  
  // 用户设置页面
  const settingsAvatar = document.getElementById('settings-avatar');
  const settingsUsername = document.getElementById('settings-username');
  if (settingsAvatar && user.avatar) {
    settingsAvatar.src = user.avatar;
  }
  if (settingsUsername) {
    settingsUsername.textContent = user.nickname || user.username;
  }
  
  const nicknameInput = document.getElementById('settings-nickname');
  if (nicknameInput) {
    nicknameInput.value = user.nickname || '';
  }
}

// 显示用户信息区域
function showUserInfo() {
  // PC视图
  const authLinksPc = document.getElementById('auth-links-pc');
  const userInfoPc = document.getElementById('user-info-pc');
  
  if (authLinksPc) authLinksPc.style.display = 'none';
  if (userInfoPc) userInfoPc.style.display = 'flex';
  
  // 移动视图
  const authLinksMobile = document.getElementById('auth-links-mobile');
  const userInfoMobile = document.getElementById('user-info-mobile');
  
  if (authLinksMobile) authLinksMobile.style.display = 'none';
  if (userInfoMobile) userInfoMobile.style.display = 'block';
}

// 显示登录/注册链接
function showAuthLinks() {
  // PC视图
  const authLinksPc = document.getElementById('auth-links-pc');
  const userInfoPc = document.getElementById('user-info-pc');
  
  if (authLinksPc) authLinksPc.style.display = 'flex';
  if (userInfoPc) userInfoPc.style.display = 'none';
  
  // 移动视图
  const authLinksMobile = document.getElementById('auth-links-mobile');
  const userInfoMobile = document.getElementById('user-info-mobile');
  
  if (authLinksMobile) authLinksMobile.style.display = 'block';
  if (userInfoMobile) userInfoMobile.style.display = 'none';
}

// 登录功能
function handleLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');

  if (!username || !password) {
    if (errorElement) errorElement.textContent = '用户名和密码不能为空';
    return;
  }

  fetch('https://api.am-all.com.cn/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    // 保存token
    localStorage.setItem('token', data.token);
    // 更新用户信息
    updateUserInfo(data.user);
    showUserInfo();
    // 跳转到首页
    loadPage('home');
  })
  .catch(error => {
    if (errorElement) {
      errorElement.textContent = error.error || '登录失败';
    }
  });
}

// 注册功能
function handleRegister() {
  const username = document.getElementById('register-username').value;
  const nickname = document.getElementById('register-nickname').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const errorElement = document.getElementById('register-error');

  if (!username || !password) {
    if (errorElement) errorElement.textContent = '用户名和密码不能为空';
    return;
  }
  if (password.length < 6) {
    if (errorElement) errorElement.textContent = '密码长度至少为6位';
    return;
  }
  if (password !== confirmPassword) {
    if (errorElement) errorElement.textContent = '两次输入的密码不一致';
    return;
  }

  fetch('https://api.am-all.com.cn/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password, nickname })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    // 注册成功，自动登录
    localStorage.setItem('token', data.token);
    updateUserInfo(data.user);
    showUserInfo();
    loadPage('home');
  })
  .catch(error => {
    if (errorElement) {
      errorElement.textContent = error.error || '注册失败';
    }
  });
}

// 更新用户设置
function handleSaveSettings() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('请先登录');
    loadPage('login');
    return;
  }

  const nickname = document.getElementById('settings-nickname').value;
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const avatarFile = document.getElementById('avatar-upload').files[0];
  const errorElement = document.getElementById('settings-error');
  const successElement = document.getElementById('settings-success');

  // 验证新密码
  if (newPassword && newPassword.length < 6) {
    if (errorElement) errorElement.textContent = '密码长度至少为6位';
    return;
  }
  if (newPassword && newPassword !== confirmPassword) {
    if (errorElement) errorElement.textContent = '两次输入的新密码不一致';
    return;
  }
  
  // 关键修复：必须提供当前密码进行身份验证
  if (!currentPassword) {
    if (errorElement) errorElement.textContent = '当前密码不能为空';
    return;
  }

  // 构建FormData
  const formData = new FormData();
  formData.append('nickname', nickname || '');
  formData.append('currentPassword', currentPassword);
  formData.append('newPassword', newPassword || '');
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  fetch('https://api.am-all.com.cn/api/user', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(data => {
    if (successElement) successElement.textContent = '设置保存成功';
    if (errorElement) errorElement.textContent = '';
    // 更新用户信息显示
    updateUserInfo(data.user);
  })
  .catch(error => {
    if (errorElement) {
      errorElement.textContent = error.error || '保存失败';
    }
  });
}

// 退出登录
function handleLogout() {
  localStorage.removeItem('token');
  currentUser = null;
  showAuthLinks();
  loadPage('home');
}

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

// ICF帮助弹窗
function showICFHelpModal() {
  const modal = document.getElementById('about-modal');
  if (!modal) return;
  
  document.getElementById('modal-title').textContent = 'ICF Editor 使用帮助';
  
  const helpContent = `
    <div class="icf-help-content">
      <h4>基本功能</h4>
      <ul>
        <li><strong>导入ICF文件</strong>：将ICF文件直接拖拽到修改区域即可加载</li>
        <li><strong>编辑内容</strong>：在编辑区按官方文件格式填写对应的pack、app以及opt文件名</li>
        <li><strong>保存文件</strong>：编辑完成后点击"SAVE ICF"导出新的ICF文件</li>
      </ul>
      
      <h4>注意事项</h4>
      <ul>
        <li>开头SDXXACA0为游戏代码，必须填写</li>
        <li>请填写正确格式的pack、app以及opt文件名</li>
        <li>导入后页面会一直保留上次修改的内容，如需清除请点击"Clear Editor"清除页面</li>
      </ul>
      
      <h4>常见问题</h4>
      <p><strong>Q: 为什么导入后数据显示不正确？</strong><br>
      A: 如果导入文件后右侧显示红字可能此ICF已经被游戏修改但未正常保存，如果什么都不显示请检查ICF文件是否正确</p>
    </div>
  `;
  
  document.getElementById('modal-content').innerHTML = helpContent;
  modal.classList.add('show');
}

// 加载帮助详情页
function loadHelpDetail(id) {
  const content = document.getElementById('content-container');
  if (!content) return;
  
  // 加载帮助详情模板
  content.innerHTML = pages['help-detail'];
  
  // 设置帮助详情内容
  const helpData = helpContentData[id] || {
    title: "帮助主题不存在",
    content: "<p>请求的帮助内容不存在</p>"
  };
  
  document.getElementById('help-detail-title').textContent = helpData.title;
  document.getElementById('help-content').innerHTML = helpData.content;
  
  // 绑定返回按钮
  const backButton = document.querySelector('.back-button[data-page="help"]');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage('help');
    });
  }
  
  // 绑定语言
  if (typeof languageModule !== 'undefined') {
    languageModule.initLanguage();
  }
}

// 宜不宜词库
const luckyItems = ['出勤', '家勤', '越级', '下埋', '理论'];
const unluckyItems = ['出勤', '家勤', '越级', '下埋', '理论'];

// 获取随机不重复的词
function getRandomRecommendations() {
  let lucky, unlucky;
  
  // 从宜词库随机取一个词
  lucky = luckyItems[Math.floor(Math.random() * luckyItems.length)];
  
  // 从不宣词库随机取一个词（确保与宜词不同）
  do {
    unlucky = unluckyItems[Math.floor(Math.random() * unluckyItems.length)];
  } while (lucky === unlucky);
  
  return { lucky, unlucky };
}

// 加载页面内容
function loadPage(pageId) {
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) return;
    
    // 显示加载状态
    document.body.classList.add('spa-loading');
    
    // 关键修复：重置所有滚动位置
    contentContainer.scrollTop = 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    
    // 模拟网络延迟
    setTimeout(() => {
        if (pages[pageId]) {
            contentContainer.innerHTML = pages[pageId];
            
            // 使用从language.js导入的函数
            if (typeof languageModule !== 'undefined') {
                languageModule.initLanguage();
            }
            
            // 绑定返回按钮事件
            const backButton = contentContainer.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    loadPage(this.getAttribute('data-page'));
                });
            }
            
            // 移动端切换页面后自动关闭侧边栏
            if (window.innerWidth <= 992) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('show');
                    document.body.classList.remove('mobile-sidebar-open');
                    document.body.classList.add('mobile-sidebar-closed');
                }
            }
            
            // 为ICF帮助按钮添加事件
            if (pageId === 'icfeditor') {
                const helpBtn = contentContainer.querySelector('#icf-help-btn');
                if (helpBtn) {
                    helpBtn.addEventListener('click', showICFHelpModal);
                }
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

            // 添加公告点击事件绑定（仅当加载首页时）
            if (pageId === 'home') {
                // 绑定公告卡片点击事件
                document.querySelectorAll('.announcement-card').forEach(card => {
                    card.addEventListener('click', function(e) {
                        // 防止点击链接时触发
                        if (e.target.closest('.more-link')) return;
                        
                        const id = this.getAttribute('data-id');
                        showAnnouncementModal(id);
                    });
                });
                
                // 绑定公告列表项点击事件
                document.querySelectorAll('.announcement-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        showAnnouncementModal(id);
                    });
                });
                
                // 绑定"查看详情"链接点击事件
                document.querySelectorAll('.click-detail').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const id = this.closest('.announcement-card').getAttribute('data-id');
                        showAnnouncementModal(id);
                    });
                });
            }

            // 添加工具搜索功能
            if (pageId === 'tools') {
                const searchInput = contentContainer.querySelector('.search-box input');
                if (searchInput) {
                    searchInput.addEventListener('input', function() {
                        const searchTerm = this.value.toLowerCase();
                        const toolCards = contentContainer.querySelectorAll('.tool-card');
                        
                        toolCards.forEach(card => {
                            const title = card.querySelector('.tool-title').textContent.toLowerCase();
                            const desc = card.querySelector('.tool-description').textContent.toLowerCase();
                            
                            if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                                card.style.display = 'block';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                }
                
                // 修复：只处理没有data-page属性的无效链接
                const toolLinks = contentContainer.querySelectorAll('.tool-link[href="#"]:not([data-page])');
                toolLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // 获取当前语言设置
                        const urlParams = new URLSearchParams(window.location.search);
                        const lang = urlParams.get('lang') || 'zh-cn';
                        
                        // 定义提示文本
                        const noticeTexts = {
                            'zh-cn': {
                                title: '提示',
                                content: '该资源未开放下载'
                            },
                            'en-us': {
                                title: 'Notice',
                                content: 'Download link is not available yet.'
                            },
                            'ja-jp': {
                                title: 'お知らせ',
                                content: 'ダウンロードはまだ提供されていません。'
                            }
                        };
                        
                        const text = noticeTexts[lang] || noticeTexts['zh-cn'];
                        
                        // 更新弹窗内容
                        document.getElementById('modal-title').textContent = text.title;
                        document.getElementById('modal-content').textContent = text.content;
                        
                        // 显示弹窗
                        const modal = document.getElementById('about-modal');
                        if (modal) {
                            modal.classList.add('show');
                            
                            // 添加关闭事件监听
                            document.querySelector('.modal-close').addEventListener('click', () => {
                                modal.classList.remove('show');
                            });
                            
                            document.getElementById('modal-ok').addEventListener('click', () => {
                                modal.classList.remove('show');
                            });
                        }
                    });
                });
            }
            
            // 设置页面初始化
            if (pageId === 'settings') {
                // 初始化语言记忆开关状态
                const rememberLanguage = localStorage.getItem('rememberLanguage') === 'true';
                const rememberLanguageSwitch = document.getElementById('remember-language');
                if (rememberLanguageSwitch) {
                    rememberLanguageSwitch.checked = rememberLanguage;
                }
                
                // 保存设置按钮事件
                const saveBtn = document.getElementById('save-settings');
                if (saveBtn) {
                    saveBtn.addEventListener('click', function() {
                        // 保存语言记忆设置
                        const rememberLanguage = document.getElementById('remember-language').checked;
                        localStorage.setItem('rememberLanguage', rememberLanguage);
                        
                        // 显示保存成功提示
                        const modal = document.getElementById('about-modal');
                        if (modal) {
                            document.getElementById('modal-title').textContent = '设置已保存';
                            document.getElementById('modal-content').textContent = '您的设置已成功保存，下次访问时将自动应用。';
                            modal.classList.add('show');
                            
                            // 添加关闭事件监听
                            document.querySelector('.modal-close').addEventListener('click', () => {
                                modal.classList.remove('show');
                            });
                            
                            document.getElementById('modal-ok').addEventListener('click', () => {
                                modal.classList.remove('show');
                            });
                        }
                    });
                }
            }

            // 帮助页面卡片点击事件
            if (pageId === 'help') {
                document.querySelectorAll('.help-card').forEach(card => {
                    card.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        loadHelpDetail(id);
                    });
                });
            }
            
            // =============== 用户功能页面绑定 =============== //
            
            // 登录页面绑定
            if (pageId === 'login') {
                const loginBtn = document.getElementById('login-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', handleLogin);
                }
            }
            
            // 注册页面绑定
            if (pageId === 'register') {
                const registerBtn = document.getElementById('register-btn');
                if (registerBtn) {
                    registerBtn.addEventListener('click', handleRegister);
                }
            }
            
            // 用户设置页面绑定
            if (pageId === 'user-settings') {
                // 获取用户信息
                const token = localStorage.getItem('token');
                if (token) {
                    fetchUserInfo(token);
                } else {
                    loadPage('login');
                }
                
                // 头像上传
                const changeAvatarBtn = document.getElementById('change-avatar-btn');
                const avatarUpload = document.getElementById('avatar-upload');
                if (changeAvatarBtn && avatarUpload) {
                    changeAvatarBtn.addEventListener('click', () => {
                        avatarUpload.click();
                    });
                    
                    avatarUpload.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(event) {
                                const settingsAvatar = document.getElementById('settings-avatar');
                                if (settingsAvatar) {
                                    settingsAvatar.src = event.target.result;
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
                
                // 保存设置
                const saveSettingsBtn = document.getElementById('save-settings-btn');
                if (saveSettingsBtn) {
                    saveSettingsBtn.addEventListener('click', handleSaveSettings);
                }
            }
            
            // =============== 运势页面初始化 =============== //
            if (pageId === 'fortune') {
                // 延迟执行以确保DOM完全加载
                setTimeout(() => {
                    // 获取元素
                    const coverImg = document.getElementById('cover-img');
                    const songIdEl = document.getElementById('song-id');
                    const songCategoryEl = document.getElementById('song-category');
                    const songTitleEl = document.getElementById('song-title');
                    const songArtistEl = document.getElementById('song-artist');
                    const difficultiesContainer = document.querySelector('.difficulties');
                    const fortuneLuckEl = document.getElementById('fortune-luck');
                    const drawBtn = document.getElementById('draw-btn');
                    const fortuneHint = document.getElementById('fortune-hint');
                    const luckyActionEl = document.getElementById('lucky-action');
                    const unluckyActionEl = document.getElementById('unlucky-action');
                    
                    // 设置封面图片大小 - 仅在移动端调整
                    if (coverImg) {
                        if (window.innerWidth <= 768) {
                            coverImg.style.width = '190px';
                            coverImg.style.height = '190px';
                        } else {
                            coverImg.style.width = '';
                            coverImg.style.height = '';
                        }
                    }
                    
                    // 吉凶文本数组
                    const luckTexts = ['大凶', '凶', '末吉', '吉', '小吉', '中吉', '大吉', '特大吉'];
                    
                    // 检查今日是否已经抽取
                    const lastDrawDate = localStorage.getItem('dailyFortuneDate');
                    const today = new Date().toDateString();
                    const dailyFortuneData = localStorage.getItem('dailyFortuneData');
                    
                    // 存储歌曲列表
                    let songList = [];
                    
                    // 创建dummy歌曲对象用于初始显示
                    const dummySong = {
                        id: '???',
                        title: '???',
                        artist: '???',
                        catname: '???',
                        // 添加所有难度字段
                        lev_bas: '?',
                        lev_adv: '?',
                        lev_exp: '?',
                        lev_mas: '?',
                        lev_ult: '?'
                    };
                    
                    // 初始显示dummy状态
                    updateDisplay(dummySong, '???', {lucky: '?', unlucky: '?'});
                    
                    // 从外部URL加载音乐数据
                    fetch('https://oss.am-all.com.cn/asset/img/main/data/music.json')
                        .then(response => response.json())
                        .then(data => {
                            songList = data;
                            
                            if (lastDrawDate === today && dailyFortuneData) {
                                try {
                                    const data = JSON.parse(dailyFortuneData);
                                    // 确保data中有song属性
                                    if (data && data.song) {
                                        displayFortune(data.song, data.luck, data.recommendations);
                                        if (drawBtn) {
                                            drawBtn.disabled = true;
                                            drawBtn.innerHTML = '<i class="fas fa-check me-2"></i>今日已抽取';
                                        }
                                        if (fortuneHint) {
                                            fortuneHint.textContent = '今日幸运乐曲已抽取，请明天再来！';
                                        }
                                    }
                                } catch (e) {
                                    console.error('解析运势数据失败', e);
                                    // 如果解析失败，清除本地存储
                                    localStorage.removeItem('dailyFortuneDate');
                                    localStorage.removeItem('dailyFortuneData');
                                    // 显示dummy状态
                                    updateDisplay(dummySong, '???', {lucky: '?', unlucky: '?'});
                                }
                            }
                        })
                        .catch(error => {
                            console.error('加载歌曲数据失败:', error);
                            if (fortuneHint) {
                                fortuneHint.textContent = '加载歌曲数据失败，请重试';
                            }
                            // 显示dummy状态
                            updateDisplay(dummySong, '???', {lucky: '?', unlucky: '?'});
                        });
                    
                    // 抽取按钮点击事件
                    if (drawBtn) {
                        drawBtn.addEventListener('click', () => {
                            if (!drawBtn) return;
                            
                            drawBtn.disabled = true;
                            drawBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>抽取中...';
                            if (fortuneHint) fortuneHint.textContent = '';
                            
                            // 隐藏封面，显示签筒动画
                            if (coverImg) {
                                coverImg.style.display = 'none';
                                const animationContainer = contentContainer.querySelector('.fortune-animation');
                                const kuji01 = contentContainer.querySelector('#kuji-01');
                                const kuji02 = contentContainer.querySelector('#kuji-02');
                                
                                // 重置动画状态
                                animationContainer.style.display = 'flex';
                                kuji01.style.display = 'block';
                                kuji01.classList.add('kuji-swing');
                                kuji02.style.display = 'none';
                                kuji02.classList.remove('kuji-fadein');
                            }
                            
                            // 模拟获取歌曲数据
                            setTimeout(() => {
                                // 模拟滚动效果
                                let scrollCount = 0;
                                const scrollInterval = setInterval(() => {
                                    if (songList.length === 0) {
                                        clearInterval(scrollInterval);
                                        return;
                                    }
                                    
                                    // 从整个歌曲列表中随机选择临时歌曲
                                    const tempSong = songList[Math.floor(Math.random() * songList.length)];
                                    
                                    updateDisplay(tempSong, '???', {lucky: '?', unlucky: '?'});
                                    scrollCount++;
                                    
                                    if (scrollCount > 30) {
                                        clearInterval(scrollInterval);
                                        
                                        // 最终从整个列表中随机选择一首歌
                                        const selectedSong = songList[Math.floor(Math.random() * songList.length)];
                                        
                                        // 随机选择吉凶
                                        const luck = luckTexts[Math.floor(Math.random() * luckTexts.length)];
                                        
                                        // 获取宜不宜词
                                        const recommendations = getRandomRecommendations();
                                        
                                        // 移除滚动动画
                                        if (coverImg) coverImg.classList.remove('scrolling');
                                        
                                        // 显示最终结果
                                        // 第二阶段动画：立即显示签文并快速过渡到结果
                                        setTimeout(() => {
                                            const animationContainer = contentContainer.querySelector('.fortune-animation');
                                            const kuji01 = contentContainer.querySelector('#kuji-01');
                                            const kuji02 = contentContainer.querySelector('#kuji-02');
                                            
                                            if (animationContainer && kuji01 && kuji02) {
                                                kuji01.classList.remove('kuji-swing');
                                                kuji01.style.display = 'none';
                                                kuji02.style.display = 'block';
                                                kuji02.classList.add('kuji-fadein');
                                                
                                                // 立即结束动画并显示结果
                                                setTimeout(() => {
                                                    animationContainer.style.display = 'none';
                                                    if (coverImg) coverImg.style.display = 'block';
                                                    
                                                    // 显示最终结果
                                                    updateDisplay(selectedSong, luck, recommendations);
                                                    
                                                    // 保存抽取结果
                                                    const today = new Date().toDateString();
                                                    localStorage.setItem('dailyFortuneDate', today);
                                                    localStorage.setItem('dailyFortuneData', JSON.stringify({
                                                        song: selectedSong,
                                                        luck: luck,
                                                        recommendations: recommendations
                                                    }));
                                                    
                                                    if (drawBtn) {
                                                        drawBtn.disabled = true;
                                                        drawBtn.innerHTML = '<i class="fas fa-check me-2"></i>今日已抽取';
                                                    }
                                                    if (fortuneHint) {
                                                        fortuneHint.textContent = '今日幸运乐曲已抽取，请明天再来！';
                                                    }
                                                }, 100); // 极短延迟确保动画完成
                                            }
                                        }, 0);
                                    }
                                }, 100);
                            }, 500);
                        });
                    }
                    
                    // 更新显示函数
                    function updateDisplay(song, luck, recommendations) {
                      if (!song) return;
                      
                      // 重置难度容器
                      if (difficultiesContainer) {
                        difficultiesContainer.innerHTML = '';
                      }
                      
                      if (coverImg) {
                        coverImg.src = song.image ? 
                          `https://oss.am-all.com.cn/asset/img/main/music/${song.image}` : 
                          'https://oss.am-all.com.cn/asset/img/main/music/dummy.jpg';
                      }
                      if (songIdEl) songIdEl.textContent = song.id || '???';
                      if (songTitleEl) songTitleEl.textContent = song.title || '???';
                      if (songArtistEl) songArtistEl.textContent = song.artist || '???';
                      if (fortuneLuckEl) fortuneLuckEl.textContent = luck || '???';
                      
                      // 设置宜不宜显示
                      if (luckyActionEl && unluckyActionEl) {
                        luckyActionEl.textContent = recommendations?.lucky || '?';
                        unluckyActionEl.textContent = recommendations?.unlucky || '?';
                      }
                      
                      // 判断是否为dummy状态
                      const isDummy = song.id === '???';
                      
                      // 设置分类样式
                      if (songCategoryEl) {
                        if (isDummy) {
                          // 未抽取时使用黑色分类标签
                          songCategoryEl.textContent = '???';
                          songCategoryEl.className = 'song-category cat-dummy';
                        } else if (song.catname) {
                          songCategoryEl.textContent = song.catname;
                          songCategoryEl.className = 'song-category ' + getCategoryClass(song.catname);
                        } else {
                          songCategoryEl.textContent = '???';
                          songCategoryEl.className = 'song-category';
                        }
                      }
                      
                      // 检查是否是World's End歌曲
                      const isWorldsEndSong = song.we_kanji || song.we_star;
                      
                      // 设置难度 - 添加 data-level 属性
                      if (isWorldsEndSong && !isDummy) {
                        if (song.we_kanji || song.we_star) {
                          const weDiv = document.createElement('div');
                          weDiv.className = 'difficulty-tag lev-we';
                          weDiv.textContent = 'World\'s End: ';
                          
                          if (song.we_kanji) {
                            weDiv.textContent += song.we_kanji;
                          }
                          
                          if (song.we_star) {
                            const starsContainer = document.createElement('span');
                            starsContainer.className = 'we-stars';
                            
                            const starCount = parseInt(song.we_star);
                            const starDisplayCount = Math.ceil(starCount / 2); // 1=1, 3=2, 5=3, 7=4, 9=5
                            
                            for (let i = 0; i < starDisplayCount; i++) {
                              const star = document.createElement('i');
                              star.className = 'fas fa-star star';
                              starsContainer.appendChild(star);
                            }
                            
                            weDiv.appendChild(starsContainer);
                          }
                          
                          if (difficultiesContainer) {
                            difficultiesContainer.appendChild(weDiv);
                          }
                        }
                      } else {
                        // 普通歌曲，显示常规难度
                        if (song.lev_bas || isDummy) {
                          const basDiv = document.createElement('div');
                          basDiv.className = 'difficulty-tag lev-bas';
                          basDiv.setAttribute('data-level', 'BASIC');
                          const basSpan = document.createElement('span');
                          // 未抽取时显示"?"
                          basSpan.textContent = isDummy ? '?' : song.lev_bas;
                          basDiv.appendChild(basSpan);
                          if (difficultiesContainer) difficultiesContainer.appendChild(basDiv);
                        }
                        
                        if (song.lev_adv || isDummy) {
                          const advDiv = document.createElement('div');
                          advDiv.className = 'difficulty-tag lev-adv';
                          advDiv.setAttribute('data-level', 'ADVANCE');
                          const advSpan = document.createElement('span');
                          // 未抽取时显示"?"
                          advSpan.textContent = isDummy ? '?' : song.lev_adv;
                          advDiv.appendChild(advSpan);
                          if (difficultiesContainer) difficultiesContainer.appendChild(advDiv);
                        }
                        
                        if (song.lev_exp || isDummy) {
                          const expDiv = document.createElement('div');
                          expDiv.className = 'difficulty-tag lev-exp';
                          expDiv.setAttribute('data-level', 'EXPERT');
                          const expSpan = document.createElement('span');
                          // 未抽取时显示"?"
                          expSpan.textContent = isDummy ? '?' : song.lev_exp;
                          expDiv.appendChild(expSpan);
                          if (difficultiesContainer) difficultiesContainer.appendChild(expDiv);
                        }
                        
                        if (song.lev_mas || isDummy) {
                          const masDiv = document.createElement('div');
                          masDiv.className = 'difficulty-tag lev-mas';
                          masDiv.setAttribute('data-level', 'MASTER');
                          const masSpan = document.createElement('span');
                          // 未抽取时显示"?"
                          masSpan.textContent = isDummy ? '?' : song.lev_mas;
                          masDiv.appendChild(masSpan);
                          if (difficultiesContainer) difficultiesContainer.appendChild(masDiv);
                        }
                        
                        if (song.lev_ult || isDummy) {
                          const ultDiv = document.createElement('div');
                          ultDiv.className = 'difficulty-tag lev-ult';
                          ultDiv.setAttribute('data-level', 'ULTIMA');
                          const ultSpan = document.createElement('span');
                          // 未抽取时显示"?"
                          ultSpan.textContent = isDummy ? '?' : song.lev_ult;
                          ultDiv.appendChild(ultSpan);
                          if (difficultiesContainer) difficultiesContainer.appendChild(ultDiv);
                        }
                      }
                    }
                
                    // 显示保存的运势
                    function displayFortune(song, luck, recommendations) {
                        updateDisplay(song, luck, recommendations);
                    }
                    
                    // 获取分类对应的CSS类
                    function getCategoryClass(catname) {
                        switch (catname) {
                            case 'POPS & ANIME': return 'cat-pops';
                            case 'niconico': return 'cat-nico';
                            case '東方Project': return 'cat-touhou';
                            case 'VARIETY': return 'cat-variety';
                            case 'イロドリミドリ': return 'cat-irodori';
                            case 'ゲキマイ': return 'cat-gekimai';
                            case 'ORIGINAL': return 'cat-original';
                            default: return '';
                        }
                    }
                }, 100);
            }
        } else {
            contentContainer.innerHTML = `<div class="section"><h1>404 NO LEAK</h1><p>页面不存在</p></div>`;
        }
        
        // 移除加载状态
        document.body.classList.remove('spa-loading');
        
        // 更新活动菜单项
        updateActiveMenuItem(pageId);
    }, 300);
}

// 更新活动菜单项 - 修复空值错误
function updateActiveMenuItem(activePage) {
    // 移除所有活动状态
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // 添加当前活动状态 - 添加空值检查
    const activeLink = document.querySelector(`.sidebar-nav a[data-page="${activePage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // 更新顶部导航 - 添加空值检查
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    if (activePage === 'home') {
        const navDownload = document.getElementById('nav-download');
        const navHome = document.getElementById('nav-home');
        if (navDownload) navDownload.classList.add('active');
        if (navHome) navHome.classList.add('active');
    }
}

// 初始化SPA功能
document.addEventListener("DOMContentLoaded", function() {
    function checkAndResetDailyFortune() {
        const lastDrawDate = localStorage.getItem('dailyFortuneDate');
        const today = new Date().toDateString();
        
        if (lastDrawDate && lastDrawDate !== today) {
            localStorage.removeItem('dailyFortuneDate');
            localStorage.removeItem('dailyFortuneData');
            
            // 如果当前在运势页面，刷新显示
            const activePage = document.querySelector('.sidebar-nav a.active')?.getAttribute('data-page');
            if (activePage === 'fortune') {
                const fortuneSection = document.querySelector('.fortune-section');
                if (fortuneSection) {
                    fortuneSection.classList.add('reset-fortune');
                    setTimeout(() => {
                        loadPage('fortune');
                        fortuneSection.classList.remove('reset-fortune');
                    }, 1000);
                }
            }
        }
    }

    // 初始化时检查
    checkAndResetDailyFortune();

    // 每小时检查一次
    setInterval(checkAndResetDailyFortune, 60 * 60 * 1000);
    
    // 初始化用户状态
    checkLoginStatus();
    
    // 绑定退出登录事件
    document.getElementById('logout-pc')?.addEventListener('click', handleLogout);
    document.getElementById('logout-mobile')?.addEventListener('click', handleLogout);
    
    // 事件委托处理页面导航
    document.body.addEventListener('click', function(e) {
        // 处理页面链接 - 修复：支持任意带有data-page属性的元素
        const pageLink = e.target.closest('[data-page]');
        if (pageLink) {
            e.preventDefault();
            const pageId = pageLink.getAttribute('data-page');
            loadPage(pageId);
        }
        
        // 处理弹窗关闭按钮
        const modalClose = e.target.closest('.modal-close, .modal-footer button');
        if (modalClose) {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                modal.classList.remove('show');
            }
        }
    });

    // 初始加载首页
    loadPage('home');
});