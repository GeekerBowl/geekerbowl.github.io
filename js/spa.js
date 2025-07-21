// 公告详细数据
const announcementsData = [
  {
    id: "1",
	type: "dgr",
    date: "2025/07/15",
    title: "OneDrive下载渠道下线通知",
    preview: "OneDrive下载渠道今日起已正式下线",
    content: "由于一些原因本人不能再继续使用od账号上传新内容(权限变为只读了)，所以即日起将下架本站所有od下载链接，请知悉。替代渠道正在寻找中。"
  },
  {
    id: "2",
    type: "notice",
    date: "2025/07/14",
    title: "EvilLeaker 新下载站开放",
    preview: "欢迎使用新的下载站",
    content: "由于旧下载站属于临时页面，为了使用体验以及增加更多功能，所有下载资源已转至本站。另外本站整体还在测试中，如果在使用体验中有任何问题欢迎反馈。"
  },
  {
    id: "3",
    type: "notice",
    date: "2025/07/21",
    title: "AllsUnlocker上线",
    preview: "实用工具界面新增工具「AllsUnlocker」",
    content: "实用工具界面新增工具「AllsUnlocker」，此工具用于解包ALLS格式的数据包。请至“实用工具”页面进行下载。"
  },
  {
    id: "4",
    type: "notice",
    date: "2025/07/21",
    title: "Segatools Editor上线",
    preview: "实用工具界面新增工具「Segatools Editor」",
    content: "实用工具界面新增工具「Segatools Editor」，此工具用于修改segatools.ini的相关设置。请至“实用工具”页面进行下载。"
  },
  {
    id: "5",
    type: "notice",
    date: "2025/07/14",
    title: "新版ChunithmUnlocker上线",
    preview: "实用工具界面新增工具「Chunlocker」",
    content: "实用工具界面新增工具「Chunlocker」，此工具相比原先的ChunithmUnlocker使用更加便捷，软件支持多语言与在线更新。请至“实用工具”页面进行下载。"
  },
  {
    id: "6",
    type: "upd",
    date: "2025/07/14",
    title: "CHUNITHM VERSE option更新",
    preview: "增加新的opt包",
    content: "新增加 'A163~A191(Verse final)' ,请至下载页面进行下载。"
  },
  {
    id: "7",
    type: "upd",
    date: "2025/07/14",
    title: "maimai DX PRiSM Plus(SDEZ) opt更新",
    preview: "增加新的opt包。",
    content: "option数据包新增K021，请至下载页面进行下载"
  }
];

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
          <span id="warning-detail">OneDrive下载渠道已下线</span>
        </div>
        <p class="mb-4"><strong><span id="latest-update-text">最后更新</span>: 2025/07/15</strong></p>
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
          <span id="download-info-detail">目前本站全部资源仅提供「百度网盘」作为下载方式</span>
        </div>
      </div>
      
      <footer>
        <p>SEGAY FEIWU</p>
        <p>1145141919810</p>
      </footer>
    `,
    
    // Chusan
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
            <p><span id="last-update-label">最后更新</span>: 2025/07/15</p>
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,
    
    // maimai DX
    sdez: `
      <div class="game-detail">
        <h1 class="page-title">maimai DX PRiSM Plus</h1>
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
            <p><span id="last-update-label">最后更新</span>: 2025/07/15</p>
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
                    <th><a href="https://pan.baidu.com/s/1PZ063rVUacNHkA6Z50mAdg" target="_blank">百度网盘</a></th>
                    <td>15</td>
                    <td>sdez</td>
                    <td id="unlimited">无期限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,

    // ongeki
    sddt: `
      <div class="game-detail">
        <h1 class="page-title">O.N.G.E.K.I Re:Fresh</h1>
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
            <p><span id="last-update-label">最后更新</span>: 2025/03/28</p>
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
                    <th><a href="https://pan.baidu.com/s/1zjY3OAwxdtK5K3G2c2QgnQ" target="_blank">百度网盘</a></th>
                    <td>3</td>
                    <td>sddt</td>
                    <td id="unlimited">无期限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,
	
	// CARD MAKER
	sded: `
      <div class="game-detail">
        <h1 class="page-title">CARD MAKER</h1>
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
            <p><span id="last-update-label">最后更新</span>: 2025/03/28</p>
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
                    <th><a href="https://pan.baidu.com/s/1rkKLqWKckMtKbbbrEYN8HA" target="_blank">百度网盘</a></th>
                    <td>3</td>
                    <td>cdmk</td>
                    <td id="unlimited">无期限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,

	// Archive相关页面
	sdbt: `
      <div class="game-detail">
        <h1 class="page-title">CHUNITHM OLD (SDBT)</h1>
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
            <p><span id="last-update-label">最后更新</span>: 2025/03/28</p>
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
                    <th><a href="https://pan.baidu.com/s/17M-tfyYGJ5wRwHAnjsyLRg" target="_blank">百度网盘</a></th>
                    <td>11</td>
                    <td>sdbt</td>
                    <td id="unlimited">无期限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,

    // 其他页面模板
    'sdhd-archive': `<div class="game-detail">准备中...</div>`,
    
    // 其他页面
    'data-center': `<div class="section"><h1>数据中心</h1><p>数据中心内容...</p></div>`,
    settings: `
      <div class="settings-container">
        <h1 class="page-title" id="option-title">设置</h1>
        <button class="back-button" data-page="home">
          <i class="fas fa-arrow-left me-2"></i>
          <span id="back-to-home">返回</span>
        </button>
        
        <div class="setting-card">
          <div class="setting-header">
            <i class="fas fa-language me-2"></i>
            <span id="lang-option">语言设置</span>
          </div>
          <div class="setting-body">
            <div class="setting-item">
              <div>
                <span id="option-item">记住语言偏好</span>
                <div class="setting-description" id="option-text">下次访问时自动使用您选择的语言</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="remember-language">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <button class="save-btn" id="save-settings">
          <i class="fas fa-save me-2"></i>
          <span id="option-save">保存设置</span>
        </button>
      </div>
    `,
	
    // ICF Editor
    icfeditor: `
      <div class="game-detail">
        <div class="d-flex align-items-center">
          <h1 class="page-title me-2">ICF Editor</h1>
          <button id="icf-help-btn" class="btn btn-sm btn-circle btn-outline-secondary">
            <i class="fas fa-question"></i>
          </button>
        </div>
        <button class="back-button" data-page="tools">
          <i class="fas fa-arrow-left me-2"></i>
          <span id="back-to-home">返回</span>
        </button>
        
        <div class="section iframe-container">
          <div class="iframe-loader">
            <div class="spinner-border text-primary"></div>
            <p>正在加载ICF编辑器...</p>
          </div>
          <iframe 
            src="icfemain.html" 
            frameborder="0"
            class="icf-editor-iframe"
            onload="this.previousElementSibling.style.display='none'">
          </iframe>
        </div>
        
        <footer>
          <p>SEGAY FEIWU</p>
          <p>1145141919810</p>
        </footer>
      </div>
    `,

    // tools
    tools: `
      <div class="game-detail">
        <h1 class="page-title">实用工具</h1>
        <button class="back-button" data-page="home">
          <i class="fas fa-arrow-left me-2"></i>
          <span id="back-to-home">返回</span>
        </button>
        
        <div class="section">
          <div class="tool-grid-header">
            <h2 class="section-title">
              <i class="fas fa-tools"></i>
              <span>工具列表</span>
            </h2>
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="搜索...">
            </div>
          </div>

          <div class="tools-container">
            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas fa-file-archive"></i>
              </div>
              <div class="tool-content">
                <h3 class="tool-title">Chunlocker v1.03</h3>
                <p class="tool-description">新版ChunithmUnlocker，使用更加便捷，支持多语言与在线更新。</p>
                <div class="tool-meta">
                  <span><i class="fas fa-history"></i> 最后更新: 2025/07/17</span>
                  <span><i class="fas fa-download"></i> 10.9MB</span>
                </div>
                <a href="https://oss.am-all.com.cn/download/software/chunlocker/Chunlocker.exe" class="tool-link" target="_blank" rel="noopener">下载</a>
              </div>
            </div>

            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas fa-file-archive"></i>
              </div>
              <div class="tool-content">
                <h3 class="tool-title">Segatools Editor v1.01</h3>
                <p class="tool-description">使用此工具可以方便快捷的修改segatools.ini，无需另装各式文本编辑器。</p>
                <div class="tool-meta">
                  <span><i class="fas fa-history"></i> 最后更新: 2025/07/21</span>
                  <span><i class="fas fa-download"></i> 13.6MB</span>
                </div>
                <a href="https://oss.am-all.com.cn/download/software/sgeditor/SegatoolsEditor.exe" class="tool-link" target="_blank" rel="noopener">下载</a>
              </div>
            </div>

            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas fa-file-archive"></i>
              </div>
              <div class="tool-content">
                <h3 class="tool-title">AllsUnlocker v1.00</h3>
                <p class="tool-description">可以解密ALLS格式软件(pack/app/opt)</p>
                <div class="tool-meta">
                  <span><i class="fas fa-history"></i> 最后更新: 2025/07/21</span>
                  <span><i class="fas fa-download"></i> 11.8MB</span>
                </div>
                <a href="https://oss.am-all.com.cn/download/software/allsunpacker/AllsUnpacker.exe" class="tool-link" target="_blank" rel="noopener">下载</a>
              </div>
            </div>

            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas fa-file-archive"></i>
              </div>
              <div class="tool-content">
                <h3 class="tool-title">7zip</h3>
                <p class="tool-description">可提取HDD镜像中的数据</p>
                <div class="tool-meta">
                  <span><i class="fas fa-history"></i> 最后更新: 2025/07/10</span>
                  <span><i class="fas fa-download"></i> 1.54MB</span>
                </div>
                <a href="https://oss.am-all.com.cn/download/files/7-Zip.rar" class="tool-link" target="_blank" rel="noopener">下载</a>
              </div>
            </div>
            
            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas fa-palette"></i>
              </div>
              <div class="tool-content">
                <h3 class="tool-title">Runtime</h3>
                <p class="tool-description">Windows运行时安装包，运行HDD所必要的系统组件。</p>
                <div class="tool-meta">
                  <span><i class="fas fa-browser"></i> 最后更新: 2025/07/10</span>
                  <span><i class="fas fa-download"></i> 180MB</span>
                </div>
                <a href="https://hitiko-my.sharepoint.com/:u:/p/evilleaker/EffD9kk4fiFEnJVcOrSgVI0B3gOx86gw9WBRLqdUIxvvjg" class="tool-link" target="_blank" rel="noopener">下载</a>
              </div>
            </div>
            
            <div class="tool-card">
              <div class="tool-icon">
                <i class="fas fa-database"></i>
              </div>
              <div class="tool-content">
                <h3 class="tool-title">MaiChartManager</h3>
                <p class="tool-description">可以管理某8键游戏Mod与游戏资源</p>
                <div class="tool-meta">
                  <span><i class="fas fa-browser"></i> 最后更新: 2025/07/10</span>
                  <span><i class="fas fa-download"></i> 1.05MB</span>
                </div>
                <a href="https://get.microsoft.com/installer/download/9P1JDKQ60G4G" class="tool-link" target="_blank" rel="noopener">下载</a>
              </div>
            </div>
          </div>

          <footer>
            <p>SEGAY FEIWU</p>
            <p>1145141919810</p>
          </footer>
        </div>
      </div>
    `,

	// 帮助页面
    help: `<div class="section"><h1>帮助</h1><p>准备中...</p></div>`,
    
    // 首页
    home: `
      <div class="section">
        <h1 class="page-title" id="top-page">首页</h1>
        
        <!-- 公告栏 -->
        <div class="announcements-section">
          <h2 class="section-title">
            <i class="fas fa-bullhorn"></i>
            <span id="announcements-title">最新公告</span>
          </h2>
          
          <div class="announcements-container">
            <!-- 前四个公告：卡片样式 -->
            ${announcementsData.slice(0, 4).map(item => `
              <div class="announcement-card" data-id="${item.id}">
                <div class="announcement-header">
                  <span class="badge bg-${item.type === 'dgr' ? 'danger' : item.type === 'upd' ? 'success' : 'info'} announcement-badge" data-type="${item.type}"></span>
                  <span class="announcement-date">${item.date}</span>
                </div>
                <h3 class="announcement-title">${item.title}</h3>
                <div class="announcement-preview">
                  <p>${item.preview}</p>
                </div>
                <div class="announcement-footer">
                  <span class="more-link click-detail">查看详情 <i class="fas fa-chevron-right"></i></span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 剩下的公告：列表样式 -->
          <ul class="announcements-list">
            ${announcementsData.slice(4).map(item => `
              <li class="announcement-item" data-id="${item.id}">
                <div class="announcement-item-header">
                  <span class="badge bg-${item.type === 'dgr' ? 'danger' : item.type === 'upd' ? 'success' : 'info'} announcement-badge" data-type="${item.type}"></span>
                  <span class="announcement-item-date">${item.date}</span>
                  <span class="announcement-item-title">${item.title}</span>
                </div>
                <div class="announcement-item-preview">
                  ${item.preview}
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <!-- 其他内容 -->
        <div class="welcome-section mt-5">
          <h2 class="section-title">
            <i class="fas fa-star"></i>
            <span>哼，哼，啊啊啊啊啊啊。。。</span>
          </h2>
          <p>请从左侧菜单选择功能</p>
        </div>
      </div>
    `,
};

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
        // 处理页面链接
        const pageLink = e.target.closest('a[data-page]');
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