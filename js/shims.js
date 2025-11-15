(function (global) {
  'use strict';

  function tryCall(fnName, args) {
    try {
      var fn = global[fnName];
      if (typeof fn === 'function') {
        return fn.apply(global, args || []);
      }
      console.warn('[shims] 函数未定义：' + fnName);
    } catch (err) {
      console.error('[shims] 调用 ' + fnName + ' 出错：', err);
    }
    return undefined;
  }

  if (typeof global.renderCCBUserPage !== 'function') {
    global.renderCCBUserPage = function () {
      return tryCall('initCCBPage', arguments);
    };
  }

  if (typeof global.renderSiteAdminHome !== 'function') {
    global.renderSiteAdminHome = function () {
      return tryCall('initSiteAdminPage', arguments);
    };
  }

  if (typeof global.renderCCBServersPage !== 'function') {
    global.renderCCBServersPage = function () {
      return tryCall('initSiteAdminPage', arguments);
    };
  }

  if (typeof global.renderCCBGamesPage !== 'function') {
    global.renderCCBGamesPage = function () {
      return tryCall('initSiteAdminPage', arguments);
    };
  }

  if (!global.__SHIMS_DIAG_PRINTED__) {
    global.__SHIMS_DIAG_PRINTED__ = true;
    var map = {
      renderCCBUserPage: '→ initCCBPage',
      renderSiteAdminHome: '→ initSiteAdminPage',
      renderCCBServersPage: '→ initSiteAdminPage',
      renderCCBGamesPage: '→ initSiteAdminPage'
    };
    try {
    } catch (_) {}
  }
})(typeof window !== 'undefined' ? window : globalThis);
