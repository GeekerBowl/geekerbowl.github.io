// 用户状态管理
const AuthService = {
  // 检查用户是否登录
  isLoggedIn: function() {
    return localStorage.getItem('userToken') !== null;
  },
  
  // 获取当前用户
  getCurrentUser: function() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },
  
  // 登录用户
  login: function(token, userData) {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    this.updateUI();
  },
  
  // 登出用户
  logout: function() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    this.updateUI();
  },
  
  // 更新用户界面
  updateUI: function() {
    const userSection = document.getElementById('user-section');
    const userInfo = document.getElementById('user-info');
    const authButtons = document.getElementById('auth-buttons');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (this.isLoggedIn()) {
      const user = this.getCurrentUser();
      
      // 更新用户信息
      userName.textContent = user.username || '用户';
      
      // 更新头像
      if (user.avatar) {
        userAvatar.innerHTML = `<img src="${user.avatar}" alt="用户头像">`;
      } else {
        // 显示用户名的首字母
        const initials = user.username ? user.username.charAt(0).toUpperCase() : 'U';
        userAvatar.innerHTML = initials;
      }
      
      // 更新按钮
      authButtons.innerHTML = `
        <button class="auth-btn" id="user-settings-btn" data-page="user-settings">
          <i class="fas fa-cog me-1"></i> 用户设置
        </button>
        <button class="auth-btn logout-btn" id="logout-btn">
          <i class="fas fa-sign-out-alt me-1"></i> 退出登录
        </button>
      `;
      
      // 添加登出事件
      document.getElementById('logout-btn').addEventListener('click', () => {
        this.logout();
        loadPage('home');
      });
    } else {
      // 未登录状态
      userName.textContent = '请登录';
      userAvatar.innerHTML = '<i class="fas fa-user"></i>';
      
      // 显示登录/注册按钮
      authButtons.innerHTML = `
        <button class="auth-btn" id="login-btn" data-page="login">登录</button>
        <button class="auth-btn" id="register-btn" data-page="register">注册</button>
      `;
    }
  }
};

// 初始化用户状态
document.addEventListener('DOMContentLoaded', function() {
  AuthService.updateUI();
});

// 登录用户函数
function loginUser(email, password) {
  // 调用API
  fetch('https://api.am-all.com.cn/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      AuthService.login(data.token, data.user);
      loadPage('home');
    } else {
      alert('登录失败: ' + (data.message || '请检查您的邮箱和密码'));
    }
  })
  .catch(error => {
    console.error('登录错误:', error);
    alert('登录过程中发生错误，请稍后再试');
  });
}

// 注册用户函数
function registerUser(username, email, password) {
  // 调用API
  fetch('https://api.am-all.com.cn/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('注册成功！请登录');
      loadPage('login');
    } else {
      alert('注册失败: ' + (data.message || '请稍后再试'));
    }
  })
  .catch(error => {
    console.error('注册错误:', error);
    alert('注册过程中发生错误，请稍后再试');
  });
}

// 添加事件监听器
document.addEventListener('click', function(e) {
  // 处理登录/注册切换
  const toggleAuth = e.target.closest('.toggle-auth');
  if (toggleAuth) {
    e.preventDefault();
    const pageId = toggleAuth.getAttribute('data-page');
    loadPage(pageId);
  }
});

// 登录表单提交
document.addEventListener('submit', function(e) {
  if (e.target && e.target.id === 'login-form') {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // 简单的表单验证
    if (!email || !password) {
      alert('请输入邮箱和密码');
      return;
    }
    
    loginUser(email, password);
  }
  
  // 注册表单提交
  if (e.target && e.target.id === 'register-form') {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // 简单的表单验证
    if (!username || !email || !password || !confirmPassword) {
      alert('请填写所有必填字段');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    
    registerUser(username, email, password);
  }
});