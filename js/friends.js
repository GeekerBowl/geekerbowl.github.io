(function(global) {
  'use strict';

  if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://api.am-all.com.cn';
  }
  const API_BASE_URL = window.API_BASE_URL;

  let friendsList = [];
  let blacklist = [];
  let friendRequests = [];
  let currentSearchResults = [];
  let friendsCheckInterval = null;
  let friendsStatusInterval = null;
  let friendMessageCheckInterval = null;
  let isInitialized = false;
  let isLoadingData = false;
  let lastDataLoadTime = 0;
  let currentView = 'friends';
  let friendMessagesCount = 0;
  let chatStatusCheckInterval = null;

  const DATA_CACHE_DURATION = 60000;

  function initFriendsSystem() {
    if (isInitialized) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    isInitialized = true;
    addFriendsIconToNavbar();
    preloadFriendsData();
    checkFriendMessages();

    if (friendsCheckInterval) {
      clearInterval(friendsCheckInterval);
    }
    friendsCheckInterval = setInterval(checkFriendRequests, 60000);

    if (friendsStatusInterval) {
      clearInterval(friendsStatusInterval);
    }
    friendsStatusInterval = setInterval(updateFriendsOnlineStatus, 120000);

    if (friendMessageCheckInterval) {
      clearInterval(friendMessageCheckInterval);
    }
    friendMessageCheckInterval = setInterval(checkFriendMessages, 30000);

    bindFriendsEvents();
    requestNotificationPermission();
    window.addEventListener('friendMessagesUpdate', handleFriendMessagesUpdate);
  }

  async function logout() {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        await fetch(API_BASE_URL + '/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
      } catch (error) {
        console.error('登出API调用失败:', error);
      }
    }

    cleanupFriendsSystem();
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.dispatchEvent(new Event('userLoggedOut'));
    window.location.href = '/login.html';
  }

  window.addEventListener('beforeunload', function() {
    const token = localStorage.getItem('token');
    if (token) {
      const data = new FormData();
      data.append('token', token);
      navigator.sendBeacon(API_BASE_URL + '/api/logout', data);
    }
  });

  function handleFriendMessagesUpdate(event) {
    const count = event.detail.unreadCount;
    updateFriendsMessageBadge(count);
  }

  async function checkFriendMessages() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      if (friendsList.length === 0) {
        await loadFriendsData();
      }
      
      const response = await fetch(API_BASE_URL + '/api/messages?unread=true', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      
      if (response.ok) {
        const messages = await response.json();

        let friendUnreadCount = 0;
        const friendIds = friendsList.map(function(f) { return f.id; });
        
        messages.forEach(function(msg) {
          if (!msg.is_read && msg.message_type === 'user' && friendIds.includes(msg.sender_id)) {
            friendUnreadCount++;
          }
        });

        if (friendUnreadCount > friendMessagesCount && friendMessagesCount > 0) {
          showNotification('好友新消息', '您有 ' + (friendUnreadCount - friendMessagesCount) + ' 条新的好友消息');
        }
        
        friendMessagesCount = friendUnreadCount;
        updateFriendsMessageBadge(friendUnreadCount);
      }
    } catch (error) {
      console.error('检查好友消息失败:', error);
    }
  }

  function updateFriendsMessageBadge(count) {
    friendMessagesCount = count;

    const badge = document.getElementById('friends-badge');
    const mobileBadge = document.getElementById('friends-badge-mobile');
    const pendingCount = friendRequests.filter(function(r) { return r.status === 'pending'; }).length;
    const totalCount = pendingCount + count;
    
    [badge, mobileBadge].forEach(function(b) {
      if (b) {
        if (totalCount > 0) {
          if (pendingCount > 0 && count > 0) {
            b.textContent = totalCount > 99 ? '99+' : totalCount;
            b.title = pendingCount + '个好友请求, ' + count + '条未读消息';
          } else if (pendingCount > 0) {
            b.textContent = pendingCount > 99 ? '99+' : pendingCount;
            b.title = pendingCount + '个好友请求';
          } else {
            b.textContent = count > 99 ? '99+' : count;
            b.title = count + '条未读消息';
          }
          b.style.display = 'block';
        } else {
          b.style.display = 'none';
        }
      }
    });

    const icon = document.querySelector('.friends-icon');
    const mobileIcon = document.querySelector('.friends-icon-wrapper-mobile .friends-icon');
    
    [icon, mobileIcon].forEach(function(i) {
      if (i) {
        if (totalCount > 0) {
          i.classList.add('has-notifications');
          if (count > 0) {
            i.style.color = '#667eea';
          } else {
            i.style.color = '#dc3545';
          }
        } else {
          i.classList.remove('has-notifications');
          i.style.color = '#6c757d';
        }
      }
    });
  }

  async function updateFriendsOnlineStatus() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(API_BASE_URL + '/api/friends', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const updatedFriends = await response.json();
        friendsList = processFriendsList(updatedFriends);
        const dropdown = document.querySelector('.friends-dropdown.show, .friends-dropdown-mobile.show');
        if (dropdown) {
          updateFriendsListDisplay();
        }
      }
    } catch (error) {
      console.error('更新好友在线状态失败:', error);
    }
  }

  function updateFriendsListDisplay() {
    const friendItems = document.querySelectorAll('.friend-item');
    friendItems.forEach(function(item) {
      const friendId = parseInt(item.dataset.friendId);
      const friend = friendsList.find(function(f) { return f.id === friendId; });
      if (friend) {
        const statusElement = item.querySelector('.friend-status span:first-child');
        if (statusElement) {
          statusElement.textContent = friend.online ? '在线' : '离线';
        }
        item.dataset.online = friend.online;
      }
    });
  }

  function startChatOnlineStatusCheck(userId) {
    if (chatStatusCheckInterval) {
      clearInterval(chatStatusCheckInterval);
    }

    chatStatusCheckInterval = setInterval(async function() {
      const token = localStorage.getItem('token');
      if (!token) {
        clearInterval(chatStatusCheckInterval);
        return;
      }
      
      try {
        const response = await fetch(API_BASE_URL + '/api/users/' + userId + '/online-status', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          updateChatOnlineStatus(data.online);
        }
      } catch (error) {
        console.error('获取在线状态失败:', error);
      }
    }, 60000);
  }

  function updateChatOnlineStatus(isOnline) {
    const statusElement = document.querySelector('.chat-user-status, .chat-modal-status');
    if (statusElement) {
      statusElement.textContent = isOnline ? '在线' : '离线';
      statusElement.className = statusElement.className.replace(/online|offline/, '') + 
                             ' ' + (isOnline ? 'online' : 'offline');
    }
  }

  async function preloadFriendsData() {
    const now = Date.now();
    if (now - lastDataLoadTime < DATA_CACHE_DURATION) {
      return;
    }
    
    if (!isLoadingData) {
      isLoadingData = true;
      try {
        await loadFriendsData();
        lastDataLoadTime = now;
      } finally {
        isLoadingData = false;
      }
    }
  }

  function addFriendsIconToNavbar() {
    if (document.getElementById('friends-icon-wrapper')) return;

    const pcMessageWrapper = document.getElementById('message-icon-wrapper');
    if (pcMessageWrapper) {
      const pcFriendsIconHTML = '<div class="friends-icon-wrapper" id="friends-icon-wrapper">' +
        '<i class="fas fa-user-friends friends-icon"></i>' +
        '<span class="friends-badge" id="friends-badge" style="display: none;">0</span>' +
        '<div class="friends-dropdown" id="friends-dropdown"></div>' +
      '</div>';
      pcMessageWrapper.insertAdjacentHTML('beforebegin', pcFriendsIconHTML);
    }

    const mobileMessageWrapper = document.getElementById('message-icon-wrapper-mobile');
    if (mobileMessageWrapper) {
      const mobileFriendsIconHTML = '<div class="friends-icon-wrapper-mobile" id="friends-icon-wrapper-mobile">' +
        '<i class="fas fa-user-friends friends-icon"></i>' +
        '<span class="friends-badge" id="friends-badge-mobile" style="display: none;">0</span>' +
        '<div class="friends-dropdown-mobile" id="friends-dropdown-mobile"></div>' +
      '</div>';
      mobileMessageWrapper.insertAdjacentHTML('beforebegin', mobileFriendsIconHTML);
    }
  }

  async function loadFriendsData(forceUpdate) {
    if (forceUpdate === undefined) forceUpdate = false;
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!forceUpdate && Date.now() - lastDataLoadTime < DATA_CACHE_DURATION) {
      return;
    }
    
    try {
      const responses = await Promise.all([
        fetch(API_BASE_URL + '/api/friends', {
          method: 'GET',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }),
        fetch(API_BASE_URL + '/api/friends/blacklist', {
          method: 'GET',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }),
        fetch(API_BASE_URL + '/api/friends/requests', {
          method: 'GET',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      ]);

      var friendsRes = responses[0];
      var blacklistRes = responses[1];
      var requestsRes = responses[2];

      if (friendsRes.ok) {
        const rawFriendsList = await friendsRes.json();
        friendsList = processFriendsList(rawFriendsList);
      } else {
        console.warn('加载好友列表失败:', friendsRes.status);
        friendsList = [];
      }
      
      if (blacklistRes.ok) {
        blacklist = await blacklistRes.json();
      } else {
        console.warn('加载黑名单失败:', blacklistRes.status);
        blacklist = [];
      }
      
      if (requestsRes.ok) {
        friendRequests = await requestsRes.json();
      } else {
        console.warn('加载好友请求失败:', requestsRes.status);
        friendRequests = [];
      }
      
      updateFriendsBadge();
      lastDataLoadTime = Date.now();
      
    } catch (error) {
      console.error('加载好友数据失败:', error);
      friendsList = [];
      blacklist = [];
      friendRequests = [];
      updateFriendsBadge();
    }
  }

  function processFriendsList(rawFriendsList) {
    var rankBackgrounds = {
      0: 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_normal.png',
      1: 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_bronze.png',
      2: 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_silver.png',
      3: 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_gold.png',
      4: 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_platinum.png',
      5: 'https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_rainbow.png'
    };
    
    return rawFriendsList.map(function(friend) {
      var hasRainbowEffect = friend.rank_sp === 1 || friend.rankSp === 1 || friend.user_rank === 5;
      
      return Object.assign({}, friend, {
        userRank: friend.user_rank || 0,
        rankBackground: rankBackgrounds[friend.user_rank || 0],
        rankSp: hasRainbowEffect ? 1 : 0,
        banState: friend.ban_state || 0,
        avatar: friend.avatar || 'https://api.am-all.com.cn/avatars/default_avatar.png',
        online: friend.online === true
      });
    });
  }

  async function checkFriendRequests() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch(API_BASE_URL + '/api/friends/requests', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const newRequests = await response.json();
        const oldPendingCount = friendRequests.filter(function(r) { return r.status === 'pending'; }).length;
        const newPendingCount = newRequests.filter(function(r) { return r.status === 'pending'; }).length;
        
        if (newPendingCount > oldPendingCount) {
          showNotification('新的好友请求', '您有新的好友请求待处理');
        }
        
        friendRequests = newRequests;
        updateFriendsBadge();
      }
    } catch (error) {
      console.error('检查好友请求失败:', error);
    }
  }

  function updateFriendsBadge() {
    var pendingCount = friendRequests.filter(function(r) { return r.status === 'pending'; }).length;
    var totalCount = pendingCount + friendMessagesCount;
    
    var badge = document.getElementById('friends-badge');
    var mobileBadge = document.getElementById('friends-badge-mobile');
    
    [badge, mobileBadge].forEach(function(b) {
      if (b) {
        if (totalCount > 0) {
          b.textContent = totalCount > 99 ? '99+' : totalCount;
          b.style.display = 'block';
        } else {
          b.style.display = 'none';
        }
      }
    });

    var icon = document.querySelector('.friends-icon');
    var mobileIcon = document.querySelector('.friends-icon-wrapper-mobile .friends-icon');
    
    [icon, mobileIcon].forEach(function(i) {
      if (i) {
        if (totalCount > 0) {
          i.classList.add('has-requests');
        } else {
          i.classList.remove('has-requests');
        }
      }
    });
  }

  function bindFriendsEvents() {
    document.addEventListener('click', function(e) {
      var wrapper = e.target.closest('.friends-icon-wrapper');
      if (wrapper) {
        e.stopPropagation();
        e.preventDefault();
        toggleFriendsDropdown('desktop');
        return;
      }

      var mobileWrapper = e.target.closest('.friends-icon-wrapper-mobile');
      if (mobileWrapper) {
        e.stopPropagation();
        e.preventDefault();
        toggleFriendsDropdown('mobile');
        return;
      }

      var dropdown = e.target.closest('.friends-dropdown, .friends-dropdown-mobile');
      if (dropdown) {
        var clickableElements = [
          '.friends-toolbar-btn',
          '.request-btn',
          '.friend-item',
          '.blacklist-item',
          '.search-result-item',
          '.search-action-btn',
          '.unblock-btn',
          '.friends-search-input',
          '.friends-group-header',
          '.friend-message-item'
        ];
        
        for (var i = 0; i < clickableElements.length; i++) {
          if (e.target.closest(clickableElements[i])) {
            e.stopPropagation();
            return;
          }
        }
        return;
      }

      closeFriendsDropdown();
    });
  }

  function toggleFriendsDropdown(type) {
    if (type === undefined) type = 'desktop';
    var dropdownId = type === 'mobile' ? 'friends-dropdown-mobile' : 'friends-dropdown';
    var dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;
    
    if (dropdown.classList.contains('show')) {
      closeFriendsDropdown();
    } else {
      openFriendsDropdown(type);
    }
  }

  async function openFriendsDropdown(type) {
    if (type === undefined) type = 'desktop';
    var dropdownId = type === 'mobile' ? 'friends-dropdown-mobile' : 'friends-dropdown';
    var dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;

    dropdown.classList.add('show');
    renderLoadingState(dropdown);

    await loadFriendsData(true);
    await checkFriendMessages();
    renderFriendsDropdown(type);
  }

  function renderLoadingState(dropdown) {
    dropdown.innerHTML = '<div class="friends-dropdown-header">' +
      '<div class="friends-dropdown-title">' +
        '<i class="fas fa-user-friends"></i>' +
        '<span>好友</span>' +
      '</div>' +
    '</div>' +
    '<div class="friends-loading" style="padding: 60px 20px; text-align: center;">' +
      '<i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #667eea;"></i>' +
      '<p style="margin-top: 10px; color: #6c757d;">加载中...</p>' +
    '</div>';
  }

  function closeFriendsDropdown() {
    var dropdowns = document.querySelectorAll('.friends-dropdown, .friends-dropdown-mobile');
    dropdowns.forEach(function(dropdown) {
      dropdown.classList.remove('show');
      var searchBox = dropdown.querySelector('.friends-search-box');
      if (searchBox) {
        searchBox.classList.remove('show');
      }
    });
    currentView = 'friends';
  }

  function renderFriendsDropdown(type) {
    if (type === undefined) type = 'desktop';
    var dropdownId = type === 'mobile' ? 'friends-dropdown-mobile' : 'friends-dropdown';
    var dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) return;
    
    var pendingRequests = friendRequests.filter(function(r) { return r.status === 'pending'; });
    
    var html = '<div class="friends-dropdown-header">' +
      '<div class="friends-dropdown-title">' +
        '<i class="fas fa-user-friends"></i>' +
        '<span>好友</span>' +
        (friendMessagesCount > 0 ? '<span class="friends-message-count" style="background: #667eea; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px; margin-left: 8px;">' + friendMessagesCount + '</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="friends-toolbar">' +
      '<button class="friends-toolbar-btn ' + (currentView === 'friends' ? 'active' : '') + '" data-action="show-friends">' +
        '<i class="fas fa-users"></i>' +
        '<span>好友列表</span>' +
      '</button>' +
      '<button class="friends-toolbar-btn" data-action="toggle-search">' +
        '<i class="fas fa-user-plus"></i>' +
        '<span>添加好友</span>' +
      '</button>' +
      '<button class="friends-toolbar-btn ' + (currentView === 'blacklist' ? 'active' : '') + '" data-action="show-blacklist">' +
        '<i class="fas fa-user-slash"></i>' +
        '<span>黑名单</span>' +
      '</button>' +
    '</div>' +
    '<div class="friends-search-box" id="friends-search-box">' +
      '<input type="text" class="friends-search-input" id="friends-search-input" placeholder="搜索UID、用户名或昵称...">' +
      '<i class="fas fa-search friends-search-icon"></i>' +
      '<div class="friends-search-results" id="friends-search-results"></div>' +
    '</div>' +
    '<div class="friends-list-container">';

    if (currentView === 'friends') {
      if (friendMessagesCount > 0) {
        html += '<div class="friends-messages-notification" style="background: #f0f2ff; padding: 12px; margin: 0 10px 10px 10px; border-radius: 8px; cursor: pointer;" onclick="openFriendMessagesCenter()">' +
          '<div style="display: flex; align-items: center; justify-content: space-between;">' +
            '<div style="display: flex; align-items: center;">' +
              '<i class="fas fa-envelope" style="color: #667eea; margin-right: 10px;"></i>' +
              '<span style="color: #333;">您有 ' + friendMessagesCount + ' 条好友未读消息</span>' +
            '</div>' +
            '<i class="fas fa-chevron-right" style="color: #667eea;"></i>' +
          '</div>' +
        '</div>';
      }

      if (pendingRequests.length > 0) {
        html += '<div class="friends-group" id="requests-group">' +
          '<div class="friends-group-header" data-group="requests">' +
            '<div class="friends-group-title">' +
              '<i class="fas fa-user-clock"></i>' +
              '<span>好友请求</span>' +
              '<span class="friends-group-count">' + pendingRequests.length + '</span>' +
            '</div>' +
            '<i class="fas fa-chevron-down friends-group-arrow"></i>' +
          '</div>' +
          '<div class="friends-group-content">';
        
        pendingRequests.forEach(function(request) {
          html += renderFriendRequest(request);
        });
        
        html += '</div></div>';
      }

      html += '<div class="friends-group" id="friends-group">' +
        '<div class="friends-group-header" data-group="friends">' +
          '<div class="friends-group-title">' +
            '<i class="fas fa-users"></i>' +
            '<span>我的好友</span>' +
            '<span class="friends-group-count">' + friendsList.length + '</span>' +
          '</div>' +
          '<i class="fas fa-chevron-down friends-group-arrow"></i>' +
        '</div>' +
        '<div class="friends-group-content">';
      
      if (friendsList.length > 0) {
        friendsList.forEach(function(friend) {
          html += renderFriendItem(friend);
        });
      } else {
        html += '<div class="friends-empty">' +
          '<i class="fas fa-user-friends"></i>' +
          '<p>暂无好友</p>' +
        '</div>';
      }
      
      html += '</div></div>';
    } else if (currentView === 'blacklist') {
      html += '<div class="friends-group" id="blacklist-group">' +
        '<div class="friends-group-header" data-group="blacklist">' +
          '<div class="friends-group-title">' +
            '<i class="fas fa-ban"></i>' +
            '<span>黑名单</span>' +
            '<span class="friends-group-count">' + blacklist.length + '</span>' +
          '</div>' +
          '<i class="fas fa-chevron-down friends-group-arrow"></i>' +
        '</div>' +
        '<div class="friends-group-content">';
      
      if (blacklist.length > 0) {
        blacklist.forEach(function(user) {
          html += renderBlacklistItem(user);
        });
      } else {
        html += '<div class="friends-empty">' +
          '<i class="fas fa-ban"></i>' +
          '<p>黑名单为空</p>' +
        '</div>';
      }
      
      html += '</div></div>';
    }
    
    html += '</div>';
    
    dropdown.innerHTML = html;
    bindDropdownEvents(dropdown, type);
  }

  function bindDropdownEvents(dropdown, type) {
    dropdown.querySelectorAll('.friends-toolbar-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.dataset.action;
        dropdown.querySelectorAll('.friends-toolbar-btn').forEach(function(b) { b.classList.remove('active'); });
        
        if (action === 'toggle-search') {
          toggleFriendsSearch();
        } else if (action === 'show-blacklist') {
          currentView = 'blacklist';
          this.classList.add('active');
          renderFriendsDropdown(type);
        } else if (action === 'show-friends') {
          currentView = 'friends';
          this.classList.add('active');
          renderFriendsDropdown(type);
        }
      });
    });

    var searchInput = dropdown.querySelector('.friends-search-input');
    if (searchInput) {
      searchInput.addEventListener('keyup', function(e) {
        e.stopPropagation();
        searchFriends(this.value);
      });
    }

    dropdown.querySelectorAll('.friends-group-header').forEach(function(header) {
      header.addEventListener('click', function(e) {
        e.stopPropagation();
        var groupName = this.dataset.group;
        toggleGroup(groupName);
      });
    });

    dropdown.querySelectorAll('.request-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var requestId = this.closest('.request-item').dataset.requestId;
        if (this.classList.contains('accept')) {
          acceptFriendRequest(requestId);
        } else if (this.classList.contains('reject')) {
          rejectFriendRequest(requestId);
        }
      });
    });

    dropdown.querySelectorAll('.friend-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var self = this;
        dropdown.querySelectorAll('.friend-actions-menu').forEach(function(menu) {
          if (menu !== self.querySelector('.friend-actions-menu')) {
            menu.style.display = 'none';
          }
        });

        var menu = this.querySelector('.friend-actions-menu');
        if (menu) {
          menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    dropdown.querySelectorAll('.chat-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var friendId = this.dataset.friendId;
        if (friendId) {
          openChatWithFriend(friendId);
          closeFriendsDropdown();
        }
      });
    });

    dropdown.querySelectorAll('.delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var friendId = this.dataset.friendId;
        if (friendId && confirm('确定要删除该好友吗？')) {
          deleteFriend(friendId);
        }
      });
    });

    dropdown.querySelectorAll('.unblock-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var userId = this.dataset.userId;
        if (userId) {
          unblockUser(userId);
        }
      });
    });
  }

  async function deleteFriend(friendId) {
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/' + friendId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSuccessMessage('已删除好友');
        await loadFriendsData(true);
        var dropdown = document.querySelector('.friends-dropdown-mobile.show') ? 'mobile' : 'desktop';
        renderFriendsDropdown(dropdown);
      }
    } catch (error) {
      console.error('删除好友失败:', error);
      showErrorMessage('操作失败');
    }
  }

  function renderFriendRequest(request) {
    return '<div class="request-item" data-request-id="' + request.id + '">' +
      '<div class="request-info">' +
        '<img src="' + (request.sender_avatar || '/avatars/default_avatar.png') + '" alt="" class="request-avatar">' +
        '<div class="request-details">' +
          '<div class="request-name">' + escapeHtml(request.sender_name) + '</div>' +
          '<div class="request-time">' + formatTime(request.created_at) + '</div>' +
        '</div>' +
      '</div>' +
      (request.message ? '<div class="request-message">' + escapeHtml(request.message) + '</div>' : '') +
      '<div class="request-actions">' +
        '<button class="request-btn accept">' +
          '<i class="fas fa-check"></i> 接受' +
        '</button>' +
        '<button class="request-btn reject">' +
          '<i class="fas fa-times"></i> 拒绝' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  function renderFriendItem(friend) {
    var onlineClass = friend.online ? 'online' : 'offline';
    var onlineStatusText = friend.online ? '在线' : '离线';
    
    return '<div class="friend-item ' + onlineClass + '" ' +
           'data-friend-id="' + friend.id + '" ' +
           'data-friend-uid="' + friend.uid + '" ' +
           'data-friend-username="' + friend.username + '" ' +
           'data-friend-nickname="' + (friend.nickname || friend.username) + '" ' +
           'data-user-id="' + friend.id + '" ' +
           'data-user-uid="' + friend.uid + '" ' +
           'data-online="' + friend.online + '">' +
        '<div class="friend-user-info" style="--user-rank-bg: url(' + (friend.rankBackground || '') + ')">' +
            '<div class="friend-avatar-container">' +
                (friend.rankSp === 1 ? '<div class="friend-avatar-rainbow"></div>' : '') +
                '<img src="' + (friend.avatar || 'https://api.am-all.com.cn/avatars/default_avatar.png') + '" alt="" class="friend-avatar">' +
                (friend.banState ? '<img src="https://oss.am-all.com.cn/asset/img/other/dc/banState/bs' + friend.banState + '.png" class="friend-state-icon">' : '') +
                '<div class="online-indicator ' + onlineClass + '"></div>' +
            '</div>' +
            '<div class="friend-info">' +
                '<div class="friend-name">' + (friend.nickname || friend.username) + '</div>' +
                '<div class="friend-status">' +
                    '<span class="online-status">' + onlineStatusText + '</span>' +
                    '<span>UID: ' + friend.uid + '</span>' +
                '</div>' +
            '</div>' +
            (friend.userRank ? '<img src="https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_' + (friend.userRank + 1) + '.png" class="friend-rank-icon">' : '') +
        '</div>' +
        '<div class="friend-actions-menu" style="display: none;">' +
            '<button class="friend-action-btn chat-btn" data-friend-id="' + friend.id + '">' +
                '<i class="fas fa-comment"></i> 聊天' +
            '</button>' +
            '<button class="friend-action-btn delete-btn" data-friend-id="' + friend.id + '">' +
                '<i class="fas fa-user-minus"></i> 删除好友' +
            '</button>' +
        '</div>' +
    '</div>';
  }

  function renderBlacklistItem(user) {
    var userRankBg = getUserRankBackground(user.user_rank);
    
    return '<div class="friend-item blacklist-item">' +
      '<div class="friend-user-info" style="--user-rank-bg: ' + userRankBg + ';">' +
        '<div class="friend-avatar-container">' +
          '<img src="' + (user.avatar || '/avatars/default_avatar.png') + '" alt="" class="friend-avatar">' +
        '</div>' +
        '<div class="friend-info">' +
          '<div class="friend-name">' + escapeHtml(user.nickname || user.username) + '</div>' +
          '<div class="friend-status">' +
            '<span>UID: ' + user.uid + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="blacklist-actions">' +
          '<button class="unblock-btn" data-user-id="' + user.id + '">' +
            '解除黑名单' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function toggleFriendsSearch() {
    var searchBox = document.getElementById('friends-search-box');
    if (searchBox) {
      searchBox.classList.toggle('show');
      if (searchBox.classList.contains('show')) {
        var input = searchBox.querySelector('.friends-search-input');
        if (input) input.focus();
      }
    }
  }

  function toggleGroup(groupId) {
    var group = document.getElementById(groupId + '-group');
    if (group) {
      group.classList.toggle('collapsed');
    }
  }

  async function searchFriends(query) {
    var resultsDiv = document.getElementById('friends-search-results');
    
    if (query.length < 2) {
      resultsDiv.classList.remove('show');
      return;
    }
    
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/search?q=' + encodeURIComponent(query), {
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        var users = await response.json();
        renderSearchResults(users);
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
    }
  }

  function renderSearchResults(users) {
    var resultsDiv = document.getElementById('friends-search-results');
    
    if (users.length === 0) {
      resultsDiv.innerHTML = '<div style="padding: 15px; text-align: center; color: #6c757d;">未找到用户</div>';
    } else {
      var html = '';
      users.forEach(function(user) {
        var isFriend = friendsList.some(function(f) { return f.id === user.id; });
        var isBlocked = blacklist.some(function(b) { return b.id === user.id; });
        
        html += '<div class="search-result-item" data-user-id="' + user.id + '">' +
          '<img src="' + (user.avatar || '/avatars/default_avatar.png') + '" alt="" class="search-result-avatar">' +
          '<div class="search-result-info">' +
            '<div class="search-result-name">' + escapeHtml(user.nickname || user.username) + '</div>' +
            '<div class="search-result-uid">UID: ' + user.uid + '</div>' +
          '</div>' +
          '<div class="search-result-actions">' +
            (!isFriend && !isBlocked ? '<button class="search-action-btn add-friend" data-user-id="' + user.id + '">' +
              '<i class="fas fa-user-plus"></i> 添加好友' +
            '</button>' : '') +
            (!isBlocked ? '<button class="search-action-btn blacklist" data-user-id="' + user.id + '">' +
              '<i class="fas fa-ban"></i> 加入黑名单' +
            '</button>' : '') +
          '</div>' +
        '</div>';
      });
      resultsDiv.innerHTML = html;
      resultsDiv.querySelectorAll('.search-action-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var userId = this.dataset.userId;
          if (this.classList.contains('add-friend')) {
            sendFriendRequest(userId);
          } else if (this.classList.contains('blacklist')) {
            addToBlacklist(userId);
          }
        });
      });
    }
    
    resultsDiv.classList.add('show');
  }

  async function sendFriendRequest(userId) {
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/request', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          receiver_id: parseInt(userId, 10),
          message: ''
        })
      });
      
      if (response.ok) {
        showSuccessMessage('好友请求已发送');
        var searchBox = document.getElementById('friends-search-box');
        if (searchBox) searchBox.classList.remove('show');
      } else {
        var error = await response.json();
        showErrorMessage(error.error || '发送失败');
      }
    } catch (error) {
      console.error('发送好友请求失败:', error);
      showErrorMessage('发送失败');
    }
  }

  async function acceptFriendRequest(requestId) {
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/request/' + requestId + '/accept', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSuccessMessage('已添加好友');
        await loadFriendsData(true);
        var dropdown = document.querySelector('.friends-dropdown-mobile.show') ? 'mobile' : 'desktop';
        renderFriendsDropdown(dropdown);
      }
    } catch (error) {
      console.error('接受好友请求失败:', error);
      showErrorMessage('操作失败');
    }
  }

  async function rejectFriendRequest(requestId) {
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/request/' + requestId + '/reject', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSuccessMessage('已拒绝请求');
        await loadFriendsData(true);
        var dropdown = document.querySelector('.friends-dropdown-mobile.show') ? 'mobile' : 'desktop';
        renderFriendsDropdown(dropdown);
      }
    } catch (error) {
      console.error('拒绝好友请求失败:', error);
      showErrorMessage('操作失败');
    }
  }

  async function addToBlacklist(userId) {
    if (!confirm('确定要将此用户加入黑名单吗？')) return;
    
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/blacklist', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ blocked_user_id: parseInt(userId) })
      });
      
      if (response.ok) {
        showSuccessMessage('已加入黑名单');
        await loadFriendsData(true);
        var dropdown = document.querySelector('.friends-dropdown-mobile.show') ? 'mobile' : 'desktop';
        renderFriendsDropdown(dropdown);
      }
    } catch (error) {
      console.error('加入黑名单失败:', error);
      showErrorMessage('操作失败');
    }
  }

  async function unblockUser(userId) {
    if (!confirm('确定要解除黑名单吗？')) return;
    
    var token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      var response = await fetch(API_BASE_URL + '/api/friends/blacklist/' + userId, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        showSuccessMessage('已解除黑名单');
        await loadFriendsData(true);
        var dropdown = document.querySelector('.friends-dropdown-mobile.show') ? 'mobile' : 'desktop';
        renderFriendsDropdown(dropdown);
      }
    } catch (error) {
      console.error('解除黑名单失败:', error);
      showErrorMessage('操作失败');
    }
  }

  function openChatWithFriend(friendId) {
    if (typeof window.openChatModal === 'function') {
      window.openChatModal(friendId);
      startChatOnlineStatusCheck(friendId);
    } else {
      console.error('聊天功能未初始化');
      showErrorMessage('聊天功能暂时不可用');
    }
  }

  function openFriendMessagesCenter() {
    closeFriendsDropdown();

    if (typeof window.loadPage === 'function') {
      window.loadPage('message-center', { filter: 'friends' });
    } else {
      window.location.hash = '#/message-center?filter=friends';
    }
  }

  function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }

    if (typeof window.showSuccessMessage === 'function') {
      window.showSuccessMessage(message);
    }
  }

  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function cleanupFriendsSystem() {
    if (friendsCheckInterval) {
      clearInterval(friendsCheckInterval);
      friendsCheckInterval = null;
    }
    
    if (friendsStatusInterval) {
      clearInterval(friendsStatusInterval);
      friendsStatusInterval = null;
    }
    
    if (friendMessageCheckInterval) {
      clearInterval(friendMessageCheckInterval);
      friendMessageCheckInterval = null;
    }

    if (chatStatusCheckInterval) {
      clearInterval(chatStatusCheckInterval);
      chatStatusCheckInterval = null;
    }

    window.removeEventListener('friendMessagesUpdate', handleFriendMessagesUpdate);

    var pcWrapper = document.getElementById('friends-icon-wrapper');
    var mobileWrapper = document.getElementById('friends-icon-wrapper-mobile');
    
    if (pcWrapper) pcWrapper.remove();
    if (mobileWrapper) mobileWrapper.remove();

    friendsList = [];
    blacklist = [];
    friendRequests = [];
    friendMessagesCount = 0;
    currentView = 'friends';
    isInitialized = false;
    isLoadingData = false;
    lastDataLoadTime = 0;
  }

  function getUserRankBackground(rank) {
    var backgrounds = {
      0: "url('https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_normal.png')",
      1: "url('https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_bronze.png')",
      2: "url('https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_silver.png')",
      3: "url('https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_gold.png')",
      4: "url('https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_platinum.png')",
      5: "url('https://oss.am-all.com.cn/asset/img/main/dc/UserRank/UserRank_rainbow.png')"
    };
    return backgrounds[rank] || backgrounds[0];
  }

  function formatTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date();
    var diff = (now - date) / 1000;
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
    
    return date.toLocaleDateString();
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showSuccessMessage(message) {
    if (typeof window.showSuccessMessage === 'function') {
      window.showSuccessMessage(message);
    } else {
      alert(message);
    }
  }

  function showErrorMessage(message) {
    if (typeof window.showErrorMessage === 'function') {
      window.showErrorMessage(message);
    } else {
      alert(message);
    }
  }

  // 导出全局函数
  global.initFriendsSystem = initFriendsSystem;
  global.cleanupFriendsSystem = cleanupFriendsSystem;
  global.loadFriendsData = loadFriendsData;
  global.openChatWithFriend = openChatWithFriend;
  global.openFriendMessagesCenter = openFriendMessagesCenter;
  global.requestNotificationPermission = requestNotificationPermission;
  global.updateFriendsOnlineStatus = updateFriendsOnlineStatus;
  global.updateFriendsMessageBadge = updateFriendsMessageBadge;
  global.checkFriendMessages = checkFriendMessages;
  global.logout = logout;

  if (!window.friendsSystemInitialized) {
    window.friendsSystemInitialized = false;
    window.addEventListener('storage', function(e) {
      if (e.key === 'token' && e.newValue && !window.friendsSystemInitialized) {
        window.friendsSystemInitialized = true;
        setTimeout(initFriendsSystem, 100);
      }
    });

    document.addEventListener('DOMContentLoaded', function() {
      requestNotificationPermission();
      
      setTimeout(function() {
        var token = localStorage.getItem('token');
        if (token && !window.friendsSystemInitialized) {
          window.friendsSystemInitialized = true;
          initFriendsSystem();
        }
      }, 300);
    });

    window.addEventListener('userLoggedIn', function() {
      if (!window.friendsSystemInitialized) {
        window.friendsSystemInitialized = true;
        setTimeout(initFriendsSystem, 100);
      }
    });

    window.addEventListener('userLoggedOut', function() {
      window.friendsSystemInitialized = false;
      cleanupFriendsSystem();
    });
  }

  console.log('Friends system loaded (heartbeat removed, optimized polling)');

})(window);
