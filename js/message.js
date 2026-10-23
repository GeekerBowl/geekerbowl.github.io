/* Legacy messaging retired 2026-10-24. No polling or API requests. */
(function(w){
 'use strict';
 const noop=function(){};
 function notice(){
  const root=document.getElementById('content-container');if(!root)return;
  const box=document.createElement('section');box.className='section';
  const title=document.createElement('h1');title.textContent='聊天功能已迁移';
  const text=document.createElement('p');text.textContent='旧站聊天与消息中心已停用。聊天记录、好友及黑名单保留，请登录新站使用顶部栏聊天按钮；系统通知请在新站消息中心查看。';
  const link=document.createElement('a');link.href='https://crew.am-all.com.cn/';link.className='btn-primary';link.textContent='前往新站';
  box.append(title,text,link);root.replaceChildren(box);
 }
 w.MessageState={initialized:true};w.initMessageSystem=noop;w.cleanupMessageSystem=noop;
 for(const name of ['checkUnreadMessages','closeChatModal','updateUserOnlineStatus','refreshChatMessages','loadChatHistory','closeMessageDropdown','closeSystemMessage'])w[name]=noop;
 for(const name of ['openChatModal','openChatWithFriend','openMessage','openMessageCenter','renderMessageCenter','sendMessage','selectChatUser','searchUsers','markAllAsRead'])w[name]=notice;
 w.MessageCenter={openMessageCenter:notice,renderMessageCenter:notice,loadMessages:noop,closeMessageDropdown:noop};
 w.MessageSystem={openChat:notice,openMessage:notice,checkUnread:noop};
})(window);
