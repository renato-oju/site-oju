// demo-ui.js — moldura visual da demonstração do OJU Hub: selo fixo
// "modo demonstração" + link de volta ao site, e um toast simples usado
// pelas ações que não têm como ser reais na demo (download, streaming).

(function () {
  'use strict';

  function isSubfolderPage() {
    return String(window.location.pathname || '').indexOf('/demo-hub/') !== -1;
  }

  function siteHubUrl() {
    return isSubfolderPage() ? '../hub.html' : 'hub.html';
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.demo-hub-badge{position:fixed;right:16px;bottom:16px;z-index:999;display:flex;align-items:center;gap:10px;' +
      'background:#111827;color:#fff;padding:9px 14px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.25);' +
      'font-family:Inter,sans-serif;font-size:12.5px;line-height:1;}' +
      '.demo-hub-badge__dot{width:7px;height:7px;border-radius:999px;background:#fbbf24;flex-shrink:0;}' +
      '.demo-hub-badge a{color:#fff;text-decoration:underline;text-underline-offset:2px;font-weight:600;}' +
      '.demo-hub-badge a:hover{color:#fbbf24;}' +
      '.demo-hub-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,12px);z-index:1000;' +
      'background:#111827;color:#fff;padding:10px 18px;border-radius:10px;font-family:Inter,sans-serif;font-size:13px;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transition:opacity .2s ease, transform .2s ease;pointer-events:none;max-width:88vw;text-align:center;}' +
      '.demo-hub-toast.is-visible{opacity:1;transform:translate(-50%,0);}';
    document.head.appendChild(style);
  }

  function injectBadge() {
    var badge = document.createElement('div');
    badge.className = 'demo-hub-badge';
    badge.innerHTML =
      '<span class="demo-hub-badge__dot" aria-hidden="true"></span>' +
      '<span>Modo demonstração — dados fictícios</span>' +
      '<a href="' + siteHubUrl() + '">voltar ao site</a>';
    document.body.appendChild(badge);
  }

  var toastEl = null;
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'demo-hub-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    injectBadge();
  });

  window.demoUi = { toast: toast };
})();
