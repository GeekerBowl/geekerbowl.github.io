// 用户设置相关功能

// 更新用户信息函数
function updateUserInfo(username, email, password) {
  const token = localStorage.getItem('userToken');
  if (!token) {
    alert('请先登录');
    loadPage('login');
    return;
  }

  const updateData = {
    username: username,
    email: email
  };

  if (password) {
    updateData.password = password;
  }

  // 调用API
  fetch('https://api.am-all.com.cn/update-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(updateData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('用户信息更新成功！');
      // 更新本地存储的用户数据
      AuthService.login(token, data.user);
    } else {
      alert('更新失败: ' + (data.message || '请稍后再试'));
    }
  })
  .catch(error => {
    console.error('更新错误:', error);
    alert('更新过程中发生错误，请稍后再试');
  });
}

// 用户设置表单提交
document.addEventListener('submit', function(e) {
  if (e.target && e.target.id === 'settings-form') {
    e.preventDefault();
    const username = document.getElementById('settings-username').value;
    const email = document.getElementById('settings-email').value;
    const password = document.getElementById('settings-password').value;
    const confirmPassword = document.getElementById('settings-confirm-password').value;
    
    // 简单的表单验证
    if (!username || !email) {
      alert('用户名和邮箱不能为空');
      return;
    }
    
    if (password && password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    
    updateUserInfo(username, email, password);
  }
});

// 头像上传功能
document.addEventListener('DOMContentLoaded', function() {
  const avatarInput = document.getElementById('avatar-input');
  if (avatarInput) {
    avatarInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // 验证文件类型
      if (!file.type.match('image.*')) {
        alert('请选择图片文件');
        return;
      }
      
      // 验证文件大小 (限制为2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const avatarPreview = document.getElementById('avatar-preview');
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="用户头像">`;
        
        // 上传头像到服务器
        uploadAvatar(file);
      };
      reader.readAsDataURL(file);
    });
  }
});

// 上传头像函数
function uploadAvatar(file) {
  const token = localStorage.getItem('userToken');
  if (!token) {
    alert('请先登录');
    loadPage('login');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  fetch('https://api.am-all.com.cn/upload-avatar', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // 更新本地存储的用户数据
      const user = AuthService.getCurrentUser();
      user.avatar = data.avatarUrl;
      localStorage.setItem('userData', JSON.stringify(user));
      AuthService.updateUI();
    } else {
      alert('头像上传失败: ' + (data.message || '请稍后再试'));
    }
  })
  .catch(error => {
    console.error('上传错误:', error);
    alert('上传过程中发生错误，请稍后再试');
  });
}