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
            
            // =============== 关键修复：运势页面初始化 =============== //
			if (pageId === 'fortune') {
				// 延迟执行以确保DOM完全加载
				setTimeout(() => {
					// 获取元素
					const coverImg = document.getElementById('cover-img');
					const songIdEl = document.getElementById('song-id');
					const songCategoryEl = document.getElementById('song-category');
					const songTitleEl = document.getElementById('song-title');
					const songArtistEl = document.getElementById('song-artist');
					const levBasEl = document.getElementById('lev-bas');
					const levAdvEl = document.getElementById('lev-adv');
					const levExpEl = document.getElementById('lev-exp');
					const levMasEl = document.getElementById('lev-mas');
					const levUltEl = document.getElementById('lev-ult');
					const difficultiesContainer = document.querySelector('.difficulties');
					const fortuneLuckEl = document.getElementById('fortune-luck');
					const drawBtn = document.getElementById('draw-btn');
					const fortuneHint = document.getElementById('fortune-hint');
					
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
										displayFortune(data.song, data.luck);
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
								}
							}
						})
						.catch(error => {
							console.error('加载歌曲数据失败:', error);
							if (fortuneHint) {
								fortuneHint.textContent = '加载歌曲数据失败，请重试';
							}
						});
					
					// 抽取按钮点击事件
					if (drawBtn) {
						drawBtn.addEventListener('click', () => {
							if (!drawBtn) return;
							
							drawBtn.disabled = true;
							drawBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>抽取中...';
							if (fortuneHint) fortuneHint.textContent = '';
							
							// 添加滚动动画
							if (coverImg) coverImg.classList.add('scrolling');
							
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
									
									updateDisplay(tempSong, '？？？');
									scrollCount++;
									
									if (scrollCount > 30) {
										clearInterval(scrollInterval);
										
										// 最终从整个列表中随机选择一首歌
										const selectedSong = songList[Math.floor(Math.random() * songList.length)];
										
										// 随机选择吉凶
										const luck = luckTexts[Math.floor(Math.random() * luckTexts.length)];
										
										// 移除滚动动画
										if (coverImg) coverImg.classList.remove('scrolling');
										
										// 显示最终结果
										setTimeout(() => {
											updateDisplay(selectedSong, luck);
											
											// 保存抽取结果
											const today = new Date().toDateString();
											localStorage.setItem('dailyFortuneDate', today);
											localStorage.setItem('dailyFortuneData', JSON.stringify({
												song: selectedSong,
												luck: luck
											}));
											
											if (drawBtn) {
												drawBtn.disabled = true;
												drawBtn.innerHTML = '<i class="fas fa-check me-2"></i>今日已抽取';
											}
											if (fortuneHint) {
												fortuneHint.textContent = '今日幸运乐曲已抽取，请明天再来！';
											}
										}, 300);
									}
								}, 100);
							}, 500);
						});
					}
					
					// 更新显示函数
					function updateDisplay(song, luck) {
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
						if (songIdEl) songIdEl.textContent = song.id || '？？？';
						if (songTitleEl) songTitleEl.textContent = song.title || '？？？';
						if (songArtistEl) songArtistEl.textContent = song.artist || '？？？';
						if (fortuneLuckEl) fortuneLuckEl.textContent = luck || '？？？';
						
						// 设置分类样式
						if (songCategoryEl && song.catname) {
							songCategoryEl.textContent = song.catname;
							songCategoryEl.className = 'song-category ' + getCategoryClass(song.catname);
						} else if (songCategoryEl) {
							songCategoryEl.textContent = '？？？';
							songCategoryEl.className = 'song-category';
						}
						
						// 检查是否是World's End歌曲
						const isWorldsEndSong = song.we_kanji || song.we_star;
						
						// 设置难度 - 如果是World's End歌曲则只显示WE难度
						if (isWorldsEndSong) {
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
							if (song.lev_bas) {
								const basDiv = document.createElement('div');
								basDiv.className = 'difficulty-tag lev-bas';
								basDiv.textContent = `BASIC: ${song.lev_bas}`;
								if (difficultiesContainer) difficultiesContainer.appendChild(basDiv);
							}
							
							if (song.lev_adv) {
								const advDiv = document.createElement('div');
								advDiv.className = 'difficulty-tag lev-adv';
								advDiv.textContent = `ADVANCE: ${song.lev_adv}`;
								if (difficultiesContainer) difficultiesContainer.appendChild(advDiv);
							}
							
							if (song.lev_exp) {
								const expDiv = document.createElement('div');
								expDiv.className = 'difficulty-tag lev-exp';
								expDiv.textContent = `EXPERT: ${song.lev_exp}`;
								if (difficultiesContainer) difficultiesContainer.appendChild(expDiv);
							}
							
							if (song.lev_mas) {
								const masDiv = document.createElement('div');
								masDiv.className = 'difficulty-tag lev-mas';
								masDiv.textContent = `MASTER: ${song.lev_mas}`;
								if (difficultiesContainer) difficultiesContainer.appendChild(masDiv);
							}
							
							if (song.lev_ult) {
								const ultDiv = document.createElement('div');
								ultDiv.className = 'difficulty-tag lev-ult';
								ultDiv.textContent = `ULTIMA: ${song.lev_ult}`;
								if (difficultiesContainer) difficultiesContainer.appendChild(ultDiv);
							}
						}
					}
				
					// 显示保存的运势
					function displayFortune(song, luck) {
						updateDisplay(song, luck);
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