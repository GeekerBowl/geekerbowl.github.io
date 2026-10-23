/* Legacy friends UI retired. Data remains available on the new site. */
(function(w){'use strict';const noop=function(){};
 for(const name of ['initFriendsSystem','cleanupFriendsSystem','loadFriendsData','requestNotificationPermission','updateFriendsOnlineStatus','updateFriendsMessageBadge','checkFriendMessages'])w[name]=noop;
 w.friendsSystemInitialized=true;w.openFriendMessagesCenter=function(){w.renderMessageCenter?.()};
})(window);
