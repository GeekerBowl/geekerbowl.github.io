if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://api.am-all.com.cn';
}

const SPECIAL_GROUP_MAP = {
  'maimoller': 1,
  'coadmin': 2,
};

function compareBySortOrderAndDate(a, b) {
  const sa = Number(a && a.sort_order || 0);
  const sb = Number(b && b.sort_order || 0);
  if (sa !== sb) return sa - sb;
  const ta = (a && a.created_at) ? new Date(a.created_at).getTime() : 0;
  const tb = (b && b.created_at) ? new Date(b.created_at).getTime() : 0;
  return (isFinite(tb) ? tb : 0) - (isFinite(ta) ? ta : 0);
}

function initDownloadPage() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (typeof showLoginRequired==='function') { showLoginRequired('download'); }
    else { console.warn('[download] login required'); }
    return;
  }
  (async () => {
    try {
      const base = (window.API_BASE_URL || window.API_ORIGIN || '').replace(/\/+$/,'') || '';
      const resp = await fetch(base + '/api/check-permission?page=download', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!resp.ok) { 
        console.warn('[download] check-permission HTTP', resp.status); 
        showPermissionDenied && showPermissionDenied(); 
        return; 
      }
      const data = await resp.json();
      if (!data || !data.hasAccess) { 
        showPermissionDenied && showPermissionDenied(); 
        return; 
      }
      if (typeof loadDownloadContent === 'function') loadDownloadContent();
      else if (typeof renderDownloadPage === 'function') renderDownloadPage();
    } catch (e) {
      console.warn('[download] check-permission error', e);
      showPermissionDenied && showPermissionDenied();
    }
  })();
}

function showPermissionDenied() {
  const contentContainer = document.getElementById('content-container');
  if (!contentContainer) return;
  
  contentContainer.innerHTML = `
    <div class="section">
      <div class="login-required-container">
        <div class="login-required-icon">
          <i class="fas fa-ban"></i>
        </div>
        <h2>权限不足</h2>
        <p>您的用户组级别无法访问下载页面</p>
        <button class="login-btn" data-page="home">
          <i class="fas fa-home me-2"></i>
          返回首页
        </button>
      </div>
    </div>
  `;
  
  const backBtn = contentContainer.querySelector('.login-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadPage('home');
    });
  }
}

async function loadDownloadContent() {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${window.API_BASE_URL}/api/downloads?t=${Date.now()}`, {
      headers: headers,
      cache: 'no-cache'
    });
    
    console.log('📡 下载内容响应状态:', response.status);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      showLoginRequired('download');
      return;
    }
    
    if (!response.ok) {
      throw new Error(`获取下载内容失败: ${response.status} ${response.statusText}`);
    }
    
    const downloads = await response.json();

    downloads.sort(compareBySortOrderAndDate);

    renderDownloadContent(downloads);
  } catch (error) {
    console.error('❌ 加载下载内容错误:', error);
    showErrorMessage('加载下载内容失败: ' + error.message);
    renderDownloadContent([]);
  }
}

function renderDownloadContent(downloads) {

  const gameDownloads = downloads.filter(d => d.category === 'game');
  const archiveDownloads = downloads.filter(d => d.category === 'archive');
  const otherDownloads = downloads.filter(d => d.category === 'other');

  renderDownloadSection('game-downloads', gameDownloads, 'game-last-update');
  renderDownloadSection('archive-downloads', archiveDownloads, 'archive-last-update');
  renderDownloadSection('other-downloads', otherDownloads, 'other-last-update');
}

function renderDownloadSection(containerId, downloads, lastUpdateId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ 容器不存在:', containerId);
    return;
  }
  
  container.innerHTML = '';
  
  if (downloads.length === 0) {
    container.innerHTML = '<p>暂无内容</p>';
    console.log('ℹ️ 没有内容用于:', containerId);
    return;
  }

  const lastUpdate = downloads.reduce((latest, download) => {
    if (!download.last_update) return latest;
    const updateDate = new Date(download.last_update);
    return updateDate > latest ? updateDate : latest;
  }, new Date(0));

  if (lastUpdate > new Date(0)) {
    const lastUpdateElement = document.getElementById(lastUpdateId);
    if (lastUpdateElement) {
      lastUpdateElement.textContent = lastUpdate.toLocaleDateString('zh-CN');
    }
  }

  const table = document.createElement('table');
  table.className = 'download-table';

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRank = userInfo.user_rank || 0;
  const userSpecialGroup = userInfo.rankSp || 0;
  
  table.innerHTML = `
    <thead>
      <tr>
        <th>游戏名称</th>
        <th>版本</th>
        <th>文件数</th>
        <th>访问权限</th>
        <th>特殊访问权限</th>
        <th>所需积分</th>
      </tr>
    </thead>
    <tbody>
      ${downloads.map(download => {
        let hasAccess = true;

        if (download.access_level !== undefined && download.access_level !== null && download.access_level >= 0) {
          hasAccess = userRank >= download.access_level;
        }

        if (download.special_group && download.special_group !== '') {
          const requiredSpecialGroup = SPECIAL_GROUP_MAP[download.special_group] || 0;
          hasAccess = hasAccess && (userSpecialGroup === requiredSpecialGroup);

          console.log('特殊用户组权限检查:', {
            title: download.title,
            userRank,
            accessLevel: download.access_level,
            userSpecialGroup,
            downloadSpecialGroup: download.special_group,
            requiredSpecialGroup,
            hasAccess
          });
        }
        
        const accessLevelNames = {
          '-1': '不限',
          '0': '普通用户',
          '1': '初级用户',
          '2': '中级用户',
          '3': '高级用户',
          '4': '贵宾用户',
          '5': '系统管理员'
        };
        
        const specialGroupNames = {
          'maimoller': 'maimoller',
          'coadmin': '协同管理员'
        };
        
        return `
          <tr>
            <td data-label="游戏名称">
              ${hasAccess ? 
                `<a href="#" class="download-detail-link" data-download-id="${download.id}">
                  <i class="fas fa-link me-2"></i> ${download.title}
                </a>` : 
                `<span class="text-muted">
                  <i class="fas fa-lock me-2"></i> ${download.title}
                </span>`
              }
            </td>
            <td data-label="版本">${download.version || '-'}</td>
            <td data-label="文件数">${download.file_count || '0'}</td>
            <td data-label="访问权限">
              <span class="access-badge rank-${download.access_level === -1 ? 'unlimited' : (download.access_level || 0)}">
                ${accessLevelNames[download.access_level] || accessLevelNames['0']}
              </span>
            </td>
            <td data-label="特殊访问权限">
              ${download.special_group ? 
                `<span class="special-access-badge special-${download.special_group}">
                  ${specialGroupNames[download.special_group] || download.special_group}
                </span>` : 
                '<span class="text-muted">无</span>'
              }
            </td>
            <td data-label="所需积分">
              ${download.required_points > 0 ? 
                `<span class="points-cost">${download.required_points}</span>` : 
                '<span class="text-muted">免费</span>'
              }
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
  
  container.appendChild(table);
  container.querySelectorAll('a.download-detail-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const downloadId = e.currentTarget.getAttribute('data-download-id');
      const download = downloads.find(d => d.id == downloadId);
      if (download && download.required_points > 0) {
        if (!confirm(`访问此资源需要 ${download.required_points} 积分，确定要继续吗？`)) {
          return;
        }
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${window.API_BASE_URL}/api/downloads/${downloadId}/access`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '访问资源失败');
          }
          
          const result = await response.json();
          
          if (result.success) {
            if (currentUser) {
              currentUser.points = result.new_points;
              updateUserInfo(currentUser);
            }
            
            showSuccessMessage(`已扣除 ${download.required_points} 积分`);
            setTimeout(() => {
              loadDownloadDetail(downloadId);
            }, 1500);
          } else {
            showErrorMessage(result.error || '访问资源失败');
          }
        } catch (error) {
          console.error('访问资源错误:', error);
          showErrorMessage('访问资源失败: ' + error.message);
        }
      } else {
        loadDownloadDetail(downloadId);
      }
    });
  });
}

function getSpecialGroupDisplayName(specialGroup) {
  const specialGroupMap = {
    '1': 'maimoller',
    '2': '协同管理员',
  };
  
  return specialGroupMap[specialGroup] || specialGroup;
}

async function loadDownloadDetail(downloadId) {
  try {
    console.log('📄 加载下载详情:', downloadId);
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${window.API_BASE_URL}/api/downloads/${downloadId}`, {
      headers: headers
    });
    
    console.log('下载详情响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error('获取下载详情失败');
    }
    
    const download = await response.json();
    loadPage('download-detail');

    setTimeout(() => {
      renderDownloadDetail(download);

      const backButton = document.querySelector('.back-button[data-page="download"]');
      if (backButton) {
        backButton.replaceWith(backButton.cloneNode(true));
        document.querySelector('.back-button[data-page="download"]').addEventListener('click', function(e) {
          e.preventDefault();
          loadPage('download');
        });
      }
    }, 100);
  } catch (error) {
    console.error('❌ 加载下载详情错误:', error);
    showErrorMessage('加载下载详情失败: ' + error.message);
  }
}

function renderDownloadDetail(download, retryCount = 0) {
  console.log('🎨 渲染下载详情:', download.title);

  const detailTitle = document.getElementById('detail-title');
  const detailLastUpdate = document.getElementById('detail-last-update');
  const container = document.getElementById('detail-download-info');

  if (!detailTitle || !detailLastUpdate || !container) {
    
    if (retryCount < 5) {
      setTimeout(() => {
        renderDownloadDetail(download, retryCount + 1);
      }, 100 * (retryCount + 1));
    } else {
      console.error('❌ 无法找到必要的DOM元素，请检查页面结构');
    }
    return;
  }

  detailTitle.textContent = download.title;

  if (download.last_update) {
    const date = new Date(download.last_update);
    detailLastUpdate.textContent = date.toLocaleDateString('zh-CN');
  }

  let downloadLinks = [];
  try {
    if (download.download_links) {
      downloadLinks = typeof download.download_links === 'string' 
        ? JSON.parse(download.download_links)
        : download.download_links;
    }
  } catch (e) {
    console.error('❌ 解析下载链接失败:', e);
  }
  
  console.log('📦 下载链接数量:', downloadLinks.length);

  container.innerHTML = '';
  
  if (downloadLinks.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">暂无下载链接</td>
      </tr>
    `;
  } else {
    downloadLinks.forEach((link, index) => {
      const tr = document.createElement('tr');

      const methodNames = {
        'baidu': '百度网盘',
        '123pan': '123网盘',
        'onedrive': 'One Drive',
        'direct': '直链下载',
        'other': '其他下载'
      };
      
      const methodName = methodNames[link.method] || link.name || '下载链接' + (index + 1);

      if (link.method === 'direct') {
        const fileId = link.file_id || '';
        console.log('🔗 直链下载，文件ID:', fileId);
        tr.innerHTML = `
          <td data-label="下载方式">
            <a href="#" class="direct-download-link" data-file-id="${fileId}">
              <i class="fas fa-download me-2"></i>${methodName}
            </a>
          </td>
          <td data-label="文件数">${download.file_count || '-'}</td>
          <td data-label="提取码/访问密码">无需密码</td>
          <td data-label="资源有效期">无期限</td>
        `;
      } else {
        tr.innerHTML = `
          <td data-label="下载方式">
            <a href="${link.url}" target="_blank" class="external-link">
              <i class="fas fa-external-link-alt me-2"></i>${methodName}
            </a>
          </td>
          <td data-label="文件数">${download.file_count || '-'}</td>
          <td data-label="提取码/访问密码">${link.password || '无'}</td>
          <td data-label="资源有效期">无期限</td>
        `;
      }
      container.appendChild(tr);
    });

    container.querySelectorAll('.direct-download-link').forEach(link => {
      link.addEventListener('click', handleDirectDownload);
    });
  }
  delete window.handleExternalLink;
}

async function handleDirectDownload(e) {
  e.preventDefault();
  
  const button = e.currentTarget;
  const fileId = button.getAttribute('data-file-id');
  
  console.log('🎯 开始直接下载，文件ID:', fileId);
  
  if (!fileId) {
    console.error('❌ 无效的文件ID');
    showErrorMessage('无效的文件ID');
    return;
  }

  if (button.classList.contains('downloading')) {
    console.log('⚠️ 正在下载中，忽略重复点击');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ 用户未登录');
      showErrorMessage('请先登录');
      setTimeout(() => {
        showLoginRequired('download');
      }, 1500);
      return;
    }

    const originalHTML = button.innerHTML;
    button.classList.add('downloading');
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>准备下载...';
    button.style.pointerEvents = 'none';
    
    console.log('📥 步骤1: 请求下载令牌，文件ID:', fileId);

    const tokenResponse = await fetch(`${window.API_BASE_URL}/api/download-files/${fileId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(errorData.error || '获取下载令牌失败');
    }
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.success || !tokenData.downloadUrl) {
      throw new Error('下载令牌无效');
    }

    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>下载中...';

    let cleanDownloadUrl = tokenData.downloadUrl;
    try {
      const url = new URL(cleanDownloadUrl);
      let downloadToken = url.searchParams.get('token');
      
      if (downloadToken) {
        if (downloadToken.includes(':')) {
          console.log('⚠️ 检测到Token包含冒号，正在清理...');
          downloadToken = downloadToken.split(':')[0].trim();
          console.log('✅ 清理后Token:', downloadToken.substring(0, 16) + '...', '长度:', downloadToken.length);
        }

        if (downloadToken.length !== 64) {
          console.warn('⚠️ Token长度异常:', downloadToken.length, '(正常应该是64位)');
        }

        url.searchParams.set('token', downloadToken);
        cleanDownloadUrl = url.toString();
        console.log('✅ 最终下载URL已清理');
      }
    } catch (error) {
      console.error('❌ URL解析错误:', error);
      console.log('⚠️ 使用原始URL继续');
    }

    const downloadResponse = await fetch(cleanDownloadUrl);
    
    if (!downloadResponse.ok) {
      let errorMessage = '文件下载失败';
      try {
        const errorData = await downloadResponse.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${downloadResponse.status}: ${downloadResponse.statusText}`;
      }
      console.error('❌ 下载失败:', errorMessage);
      throw new Error(errorMessage);
    }

    const contentDisposition = downloadResponse.headers.get('Content-Disposition');
    let filename = 'download';
    
    console.log('📋 Content-Disposition:', contentDisposition);
    
    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;,\s]+)/i);
      if (utf8Match && utf8Match[1]) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
          console.log('✅ 提取UTF-8文件名:', filename);
        } catch (e) {
          console.warn('⚠️ UTF-8解码失败:', e);
        }
      }

      if (filename === 'download') {
        const asciiMatch = contentDisposition.match(/filename=["']?([^"';,\s]+)["']?/i);
        if (asciiMatch && asciiMatch[1]) {
          filename = asciiMatch[1];
          console.log('✅ 提取ASCII文件名:', filename);
        }
      }

      filename = filename.replace(/[<>:"|?*]/g, '_').trim();
      
      console.log('📦 最终文件名:', filename);
    } else {
      console.warn('⚠️ 响应头中没有Content-Disposition');
    }

    if (filename === 'download' || !filename) {
      try {
        const url = new URL(cleanDownloadUrl);
        const pathParts = url.pathname.split('/');
        const urlFilename = pathParts[pathParts.length - 1];
        if (urlFilename && urlFilename !== 'download') {
          filename = decodeURIComponent(urlFilename);
          console.log('✅ 从URL提取文件名:', filename);
        }
      } catch (e) {
        console.warn('⚠️ 从URL提取文件名失败:', e);
      }
    }

    const blob = await downloadResponse.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);

    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('downloading');
      button.style.pointerEvents = '';
    }, 1000);
    
    showSuccessMessage('下载已开始，请查看浏览器下载');
    
  } catch (error) {
    console.error('❌ 下载错误:', error);
    console.error('❌ 错误信息:', error.message);
    showErrorMessage('下载失败: ' + error.message);

    const originalHTML = button.getAttribute('data-original-html') || '<i class="fas fa-download me-2"></i>直链下载';
    button.innerHTML = originalHTML;
    button.classList.remove('downloading');
    button.style.pointerEvents = '';
  }
}

window.initDownloadPage = initDownloadPage;
window.loadDownloadContent = loadDownloadContent;
window.renderDownloadContent = renderDownloadContent;
window.loadDownloadDetail = loadDownloadDetail;
window.handleDirectDownload = handleDirectDownload;