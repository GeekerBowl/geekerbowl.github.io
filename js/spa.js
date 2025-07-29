// 显示公告详情弹窗
function showAnnouncementModal(id) {
  const announcement = announcementsData.find(item => item.id === id);
  if (!announcement) return;
  
  // 获取当前语言设置
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || 'zh-cn';
  
  // 定义弹窗标题文本
  const modalTitles = {
    'zh-cn': '公告详情',
    'en-us': 'Announcement Details',
    'ja-jp': 'お知らせ'
  };
  
  // 更新弹窗内容
  document.getElementById('modal-title').textContent = modalTitles[lang] || modalTitles['zh-cn'];
  
  // 创建详细内容HTML
  const contentHTML = `
    <div class="announcement-modal-content">
      <div class="announcement-modal-header">
        <span class="badge bg-${announcement.type === 'dgr' ? 'danger' : announcement.type === 'upd' ? 'success' : 'info'}">
          ${announcement.type === 'dgr' ? '重要' : announcement.type === 'upd' ? '更新' : '通知'}
        </span>
        <span class="announcement-modal-date">${announcement.date}</span>
      </div>
      <h3 class="announcement-modal-title">${announcement.title}</h3>
      <div class="announcement-modal-body">
        <p>${announcement.content}</p>
      </div>
    </div>
  `;
  
  document.getElementById('modal-content').innerHTML = contentHTML;
  
  // 显示弹窗
  const modal = document.getElementById('about-modal');
  if (modal) {
    modal.classList.add('show');
  }
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

            // =============================================================
            // 每日运势页面处理
            // =============================================================
            if (pageId === 'fortune') {
                // 初始化元素
                const albumCover = contentContainer.querySelector('#album-cover');
                const placeholder = contentContainer.querySelector('.album-placeholder');
                const songId = contentContainer.querySelector('#song-id');
                const songCategory = contentContainer.querySelector('#song-category');
                const songTitle = contentContainer.querySelector('#song-title');
                const songArtist = contentContainer.querySelector('#song-artist');
                const levBas = contentContainer.querySelector('#lev-bas');
                const levAdv = contentContainer.querySelector('#lev-adv');
                const levExp = contentContainer.querySelector('#lev-exp');
                const levMas = contentContainer.querySelector('#lev-mas');
                const levUlt = contentContainer.querySelector('#lev-ult');
                const drawButton = contentContainer.querySelector('#draw-button');
                const saveButton = contentContainer.querySelector('#save-button');
                const fortuneInfo = contentContainer.querySelector('#fortune-info');
                const songInfo = contentContainer.querySelector('.song-info');
                
                // 存储音乐数据
                let musicData = [];
                
                // 检查是否已经抽取过今日运势
                const lastDraw = localStorage.getItem('lastFortuneDraw');
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                
                // 显示初始状态
                if (lastDraw && Number(lastDraw) >= today) {
                    // 已经抽取过，显示上次的结果
                    const lastResult = JSON.parse(localStorage.getItem('lastFortuneResult'));
                    if (lastResult) {
                        displaySong(lastResult);
                    }
                    drawButton.disabled = true;
                    drawButton.textContent = '今日已抽取';
                    fortuneInfo.textContent = '今日运势已抽取，明天再来吧！';
                } else {
                    drawButton.disabled = false;
                    drawButton.textContent = '抽取今日运势';
                    fortuneInfo.textContent = '点击下方按钮抽取今日运势';
                }
                
				  // 显示加载中状态
				  fortuneInfo.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>加载音乐数据中...</div>';
				  
				  // 修复后的音乐数据加载 - 使用绝对路径并添加CORS头
				  fetch('/data/music.json', {
					headers: {
					  'Content-Type': 'application/json',
					  'Accept': 'application/json'
					}
				  })
					.then(response => {
					  if (!response.ok) {
						throw new Error(`网络响应异常: ${response.status} ${response.statusText}`);
					  }
					  return response.json();
					})
					.then(data => {
					  musicData = data;
					  fortuneInfo.textContent = '音乐数据加载完成！';
					  
					  // 如果已经抽取过今日的，则显示存储的歌曲
					  if (lastDraw && Number(lastDraw) >= today) {
						const lastResult = JSON.parse(localStorage.getItem('lastFortuneResult'));
						if (lastResult) {
						  displaySong(lastResult);
						}
					  }
					})
					.catch(error => {
					  console.error('加载音乐数据失败:', error);
					  
					  // 提供更详细的错误信息
					  let errorMsg = `加载音乐数据失败: ${error.message}`;
					  
					  // 如果是网络错误，提供特定提示
					  if (error.message.includes('Failed to fetch')) {
						errorMsg = '无法连接到服务器，请检查网络连接或稍后再试';
					  }
					  
					  fortuneInfo.innerHTML = `<div class="alert alert-danger">${errorMsg}</div>`;
					});
                
                // 显示歌曲信息的函数
                function displaySong(song) {
                    // 隐藏占位符，显示封面
                    placeholder.style.display = 'none';
                    albumCover.style.display = 'block';
                    songInfo.style.display = 'block';
                    
                    // 设置封面
                    albumCover.src = `https://oss.am-all.com.cn/asset/img/main/music/${song.image}`;
                    songId.textContent = `ID: ${song.id}`;
                    songTitle.textContent = song.title;
                    songArtist.textContent = song.artist;
                    
                    // 设置分类
                    songCategory.textContent = song.catname;
                    // 根据分类设置背景色
                    songCategory.className = ''; // 清除之前的类
                    switch (song.catname) {
                        case 'POPS & ANIME':
                            songCategory.classList.add('category-pops');
                            break;
                        case 'niconico':
                            songCategory.classList.add('category-niconico');
                            break;
                        case '東方Project':
                            songCategory.classList.add('category-touhou');
                            break;
                        case 'VARIETY':
                            songCategory.classList.add('category-variety');
                            break;
                        case 'イロドリミドリ':
                            songCategory.classList.add('category-irodori');
                            break;
                        case 'ゲキマイ':
                            songCategory.classList.add('category-gekimai');
                            break;
                        case 'ORIGINAL':
                            songCategory.classList.add('category-original');
                            break;
                        default:
                            songCategory.classList.add('category-default');
                    }
                    
                    // 设置难度
                    levBas.textContent = song.lev_bas || '-';
                    levBas.className = 'difficulty-value difficulty-bas';
                    levAdv.textContent = song.lev_adv || '-';
                    levAdv.className = 'difficulty-value difficulty-adv';
                    levExp.textContent = song.lev_exp || '-';
                    levExp.className = 'difficulty-value difficulty-exp';
                    levMas.textContent = song.lev_mas || '-';
                    levMas.className = 'difficulty-value difficulty-mas';
                    levUlt.textContent = song.lev_ult || '-';
                    levUlt.className = 'difficulty-value difficulty-ult';
                    
                    // 启用保存按钮
                    saveButton.disabled = false;
                }
                
                // 抽取按钮事件
                drawButton.addEventListener('click', function() {
                    if (musicData.length === 0) {
                        fortuneInfo.innerHTML = '<div class="alert alert-warning">音乐数据尚未加载完成，请稍后再试</div>';
                        return;
                    }
                    
                    // 禁用按钮，防止多次点击
                    drawButton.disabled = true;
                    saveButton.disabled = true;
                    fortuneInfo.textContent = '抽取中...';
                    
                    // 显示旋转动画
                    placeholder.style.display = 'flex';
                    albumCover.style.display = 'none';
                    placeholder.innerHTML = '<i class="fas fa-compact-disc spinning" style="font-size: 5rem;"></i>';
                    
                    // 模拟抽取过程
                    let count = 0;
                    const maxCount = 15; // 滚动次数
                    const interval = setInterval(() => {
                        count++;
                        if (count >= maxCount) {
                            clearInterval(interval);
                            
                            // 确定最终抽取的歌曲
                            const finalIndex = Math.floor(Math.random() * musicData.length);
                            const finalSong = musicData[finalIndex];
                            displaySong(finalSong);
                            
                            // 保存抽取时间和结果
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                            localStorage.setItem('lastFortuneDraw', today);
                            localStorage.setItem('lastFortuneResult', JSON.stringify(finalSong));
                            
                            drawButton.disabled = true;
                            drawButton.textContent = '今日已抽取';
                            fortuneInfo.textContent = '今日运势已抽取，明天再来吧！';
                        }
                    }, 200); // 每200毫秒切换一次
                });
                
                // 保存截图按钮事件
                saveButton.addEventListener('click', function() {
                    // 截取.fortune-content区域
                    html2canvas(contentContainer.querySelector('.fortune-content')).then(canvas => {
                        // 将canvas转换为图片并下载
                        const link = document.createElement('a');
                        const dateStr = new Date().toISOString().slice(0, 10);
                        link.download = `每日运势_${dateStr}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    });
                });
            }
            // =============================================================
            // 每日运势页面处理结束
            // =============================================================

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

// 初始化SPA功能
document.addEventListener("DOMContentLoaded", function() {
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