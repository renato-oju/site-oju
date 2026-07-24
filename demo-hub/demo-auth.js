// demo-auth.js — substitui portal-auth.js na demonstracao do OJU Hub.
// Mesmo formato de window.portalAuth que as paginas reais esperam, mas:
//  - nunca exige login (bootstrapAuth sempre "loga" um usuario ficticio fixo);
//  - apiFetch() nao sai pra rede nenhuma — responde localmente lendo/gravando
//    em window.demoData, simulando as mesmas rotas que o backend real usaria.

(function () {
  'use strict';

  var FAKE_USER = {
    id: 'demo-user',
    name: 'Usuário Demonstração',
    email: 'demo@oju.com.br',
    status: 'ACTIVE',
    profile: { name: 'master' },
  };

  function isSubfolderPage() {
    return String(window.location.pathname || '').indexOf('/demo-hub/') !== -1;
  }

  function siteHubUrl() {
    return isSubfolderPage() ? '../hub.html' : 'hub.html';
  }

  // ---------------------------------------------------------------------
  // Menu de conta (mesmo visual do portal real — reaproveita as classes
  // .portal-account-menu / .portal-profile-trigger de portal-base.css).
  // ---------------------------------------------------------------------
  var profileMenuElement = null;
  var profileMenuAnchor = null;
  var profileMenuBound = false;

  function hideProfileMenu() {
    if (!profileMenuElement) return;
    profileMenuElement.classList.add('hidden');
    if (profileMenuAnchor) profileMenuAnchor.setAttribute('aria-expanded', 'false');
    profileMenuAnchor = null;
  }

  function positionProfileMenu(anchor) {
    if (!profileMenuElement || !anchor) return;
    profileMenuElement.classList.remove('hidden');
    var anchorRect = anchor.getBoundingClientRect();
    var menuRect = profileMenuElement.getBoundingClientRect();
    var left = anchorRect.right - menuRect.width;
    if (left < 8) left = 8;
    if (left + menuRect.width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - menuRect.width - 8);
    var top = anchorRect.bottom + 8;
    if (top + menuRect.height > window.innerHeight - 8) top = Math.max(8, anchorRect.top - menuRect.height - 8);
    profileMenuElement.style.left = Math.round(left) + 'px';
    profileMenuElement.style.top = Math.round(top) + 'px';
  }

  function ensureProfileMenu() {
    if (!profileMenuElement) {
      profileMenuElement = document.createElement('div');
      profileMenuElement.className = 'portal-account-menu hidden';
      profileMenuElement.setAttribute('role', 'menu');
      profileMenuElement.innerHTML =
        '<button type="button" class="portal-account-menu__action" data-portal-action="logout" role="menuitem">Sair da demonstração</button>';
      document.body.appendChild(profileMenuElement);
      var logoutButton = profileMenuElement.querySelector('[data-portal-action="logout"]');
      if (logoutButton) {
        logoutButton.addEventListener('click', function () {
          hideProfileMenu();
          logout();
        });
      }
    }
    if (!profileMenuBound) {
      profileMenuBound = true;
      document.addEventListener('click', function (event) {
        var target = event.target;
        if (!profileMenuElement || profileMenuElement.classList.contains('hidden')) return;
        if (profileMenuElement.contains(target)) return;
        if (target && target.closest && target.closest('[data-perfil-label]')) return;
        hideProfileMenu();
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') hideProfileMenu();
      });
      window.addEventListener('resize', hideProfileMenu);
      window.addEventListener('scroll', hideProfileMenu, true);
    }
  }

  function toggleProfileMenu(anchor) {
    if (!anchor) return;
    ensureProfileMenu();
    var isSameAnchor = profileMenuAnchor === anchor;
    var isOpen = profileMenuElement && !profileMenuElement.classList.contains('hidden');
    if (isSameAnchor && isOpen) {
      hideProfileMenu();
      return;
    }
    profileMenuAnchor = anchor;
    profileMenuAnchor.setAttribute('aria-expanded', 'true');
    positionProfileMenu(anchor);
  }

  function bindProfileLabel(label) {
    if (!label || label.dataset.portalProfileBound === '1') return;
    label.dataset.portalProfileBound = '1';
    label.classList.add('portal-profile-trigger');
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    label.setAttribute('aria-haspopup', 'menu');
    label.setAttribute('aria-expanded', 'false');
    label.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleProfileMenu(label);
    });
    label.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleProfileMenu(label);
      }
    });
  }

  function updateProfileLabels(user) {
    var role = String((user && user.profile && user.profile.name) || '').trim();
    var name = String((user && user.name) || '').trim();
    if (!name || !role) return;
    document.querySelectorAll('[data-perfil-label]').forEach(function (label) {
      label.textContent = name + ' (' + role + ')';
      label.setAttribute('title', 'Abrir menu da conta');
      bindProfileLabel(label);
    });
  }

  function logout() {
    window.location.href = siteHubUrl();
  }

  function redirectToLogin() {
    // Nunca deveria disparar na demo (bootstrapAuth nunca redireciona) —
    // mantido só por segurança, caso algum trecho de código ainda chame.
    console.warn('[demo] redirectToLogin ignorado — não há tela de login na demonstração.');
  }

  function redirectTo(path) {
    window.location.href = String(path || siteHubUrl());
  }

  async function bootstrapAuth() {
    updateProfileLabels(FAKE_USER);
    return FAKE_USER;
  }

  // ---------------------------------------------------------------------
  // Roteador falso de API — responde no lugar do backend real, lendo e
  // gravando em window.demoData.state. Sempre com um pequeno atraso
  // artificial pra loading/spinner aparecerem de verdade.
  // ---------------------------------------------------------------------
  function delay() {
    var ms = 150 + Math.random() * 200;
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function fakeResponse(status, payload) {
    return {
      ok: status >= 200 && status < 300,
      status: status,
      json: async function () { return payload; },
      blob: async function () { return new Blob(); },
    };
  }

  function stripQuery(path) {
    var qIndex = path.indexOf('?');
    return qIndex === -1 ? path : path.slice(0, qIndex);
  }

  function parseBody(options) {
    if (!options || !options.body) return {};
    try { return JSON.parse(options.body); } catch (error) { return {}; }
  }

  function newId(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
  }

  function withUsageCount(list, field, id) {
    var data = window.demoData.state;
    return list.map(function (item) {
      var count = data.files.filter(function (file) {
        return file[field] && file[field].id === item.id;
      }).length;
      return Object.assign({}, item, { usageCount: count });
    });
  }

  function findFile(id) {
    return window.demoData.state.files.find(function (file) { return file.id === id; });
  }

  var CAPTION_TEMPLATES = [
    'Cena institucional — {categoria}',
    'Still de bastidores — {produtora}',
    'Registro de campanha — {categoria}',
    'Momento de making-of — {produtora}',
    'Cobertura de evento — {categoria}',
  ];

  function generateCaption(file) {
    var template = CAPTION_TEMPLATES[Math.floor(Math.random() * CAPTION_TEMPLATES.length)];
    var categoria = (file.category && file.category.name) || 'Geral';
    var produtora = (file.producer && file.producer.name) || 'Produtora';
    return template.replace('{categoria}', categoria).replace('{produtora}', produtora);
  }

  var ROUTES = [
    { method: 'GET', pattern: /^\/api\/files$/, handler: function () {
      return fakeResponse(200, window.demoData.state.files);
    } },
    { method: 'GET', pattern: /^\/api\/categories$/, handler: function () {
      return fakeResponse(200, withUsageCount(window.demoData.state.categories, 'category'));
    } },
    { method: 'GET', pattern: /^\/api\/tags$/, handler: function () {
      var data = window.demoData.state;
      var withCount = data.tags.map(function (tag) {
        var count = data.files.filter(function (file) {
          return (file.tags || []).some(function (t) { return t.id === tag.id; });
        }).length;
        return Object.assign({}, tag, { usageCount: count });
      });
      return fakeResponse(200, withCount);
    } },
    { method: 'GET', pattern: /^\/api\/producers$/, handler: function () {
      return fakeResponse(200, window.demoData.state.producers);
    } },
    { method: 'GET', pattern: /^\/api\/users$/, handler: function () {
      return fakeResponse(200, window.demoData.state.users);
    } },
    { method: 'GET', pattern: /^\/api\/profiles$/, handler: function () {
      return fakeResponse(200, window.demoData.state.profiles);
    } },
    { method: 'GET', pattern: /^\/api\/integrations$/, handler: function () {
      return fakeResponse(200, window.demoData.state.integrations);
    } },

    { method: 'POST', pattern: /^\/api\/categories$/, handler: function (match, options) {
      var body = parseBody(options);
      var name = String(body.name || '').trim();
      if (!name) return fakeResponse(400, { error: 'Informe o nome da categoria.' });
      var created = { id: newId('cat'), name: name };
      window.demoData.state.categories.push(created);
      return fakeResponse(201, created);
    } },
    { method: 'PATCH', pattern: /^\/api\/categories\/([^/]+)$/, handler: function (match, options) {
      var body = parseBody(options);
      var category = window.demoData.state.categories.find(function (c) { return c.id === match[1]; });
      if (!category) return fakeResponse(404, { error: 'Categoria não encontrada.' });
      if (body.name) category.name = String(body.name).trim();
      window.demoData.state.files.forEach(function (file) {
        if (file.category && file.category.id === category.id) file.category = Object.assign({}, category);
      });
      return fakeResponse(200, category);
    } },
    { method: 'DELETE', pattern: /^\/api\/categories\/([^/]+)$/, handler: function (match) {
      var data = window.demoData.state;
      data.categories = data.categories.filter(function (c) { return c.id !== match[1]; });
      data.files.forEach(function (file) {
        if (file.category && file.category.id === match[1]) file.category = null;
      });
      return fakeResponse(200, { ok: true });
    } },

    { method: 'POST', pattern: /^\/api\/tags$/, handler: function (match, options) {
      var body = parseBody(options);
      var name = String(body.name || '').trim();
      if (!name) return fakeResponse(400, { error: 'Informe o nome da tag.' });
      var created = { id: newId('tag'), name: name };
      window.demoData.state.tags.push(created);
      return fakeResponse(201, created);
    } },
    { method: 'PATCH', pattern: /^\/api\/tags\/([^/]+)$/, handler: function (match, options) {
      var body = parseBody(options);
      var tag = window.demoData.state.tags.find(function (t) { return t.id === match[1]; });
      if (!tag) return fakeResponse(404, { error: 'Tag não encontrada.' });
      if (body.name) tag.name = String(body.name).trim();
      window.demoData.state.files.forEach(function (file) {
        file.tags = (file.tags || []).map(function (t) { return t.id === tag.id ? Object.assign({}, tag) : t; });
      });
      return fakeResponse(200, tag);
    } },
    { method: 'DELETE', pattern: /^\/api\/tags\/([^/]+)$/, handler: function (match) {
      var data = window.demoData.state;
      data.tags = data.tags.filter(function (t) { return t.id !== match[1]; });
      data.files.forEach(function (file) {
        file.tags = (file.tags || []).filter(function (t) { return t.id !== match[1]; });
      });
      return fakeResponse(200, { ok: true });
    } },

    { method: 'POST', pattern: /^\/api\/producers$/, handler: function (match, options) {
      var body = parseBody(options);
      var name = String(body.name || '').trim();
      if (!name) return fakeResponse(400, { error: 'Informe o nome da produtora.' });
      var created = { id: newId('prod'), name: name };
      window.demoData.state.producers.push(created);
      return fakeResponse(201, created);
    } },
    { method: 'DELETE', pattern: /^\/api\/producers\/([^/]+)$/, handler: function (match) {
      var data = window.demoData.state;
      data.producers = data.producers.filter(function (p) { return p.id !== match[1]; });
      data.files.forEach(function (file) {
        if (file.producer && file.producer.id === match[1]) file.producer = null;
      });
      return fakeResponse(200, { ok: true });
    } },

    { method: 'POST', pattern: /^\/api\/users$/, handler: function (match, options) {
      var body = parseBody(options);
      var name = String(body.name || '').trim();
      var email = String(body.email || '').trim();
      if (!name || !email) return fakeResponse(400, { error: 'Informe nome e e-mail.' });
      var created = {
        id: newId('usr'),
        name: name,
        email: email,
        profile: { name: String(body.profileName || 'acervo').toLowerCase() },
        status: String(body.status || 'ACTIVE').toUpperCase(),
        lastAccessAt: null,
      };
      window.demoData.state.users.push(created);
      return fakeResponse(201, created);
    } },
    { method: 'PATCH', pattern: /^\/api\/users\/([^/]+)$/, handler: function (match, options) {
      var body = parseBody(options);
      var user = window.demoData.state.users.find(function (u) { return u.id === match[1]; });
      if (!user) return fakeResponse(404, { error: 'Usuário não encontrado.' });
      if (body.name) user.name = String(body.name).trim();
      if (body.email) user.email = String(body.email).trim();
      if (body.profileName) user.profile = { name: String(body.profileName).toLowerCase() };
      if (body.status) user.status = String(body.status).toUpperCase();
      return fakeResponse(200, user);
    } },
    { method: 'DELETE', pattern: /^\/api\/users\/([^/]+)$/, handler: function (match) {
      window.demoData.state.users = window.demoData.state.users.filter(function (u) { return u.id !== match[1]; });
      return fakeResponse(200, { ok: true });
    } },

    { method: 'PUT', pattern: /^\/api\/files\/([^/]+)\/favorite$/, handler: function (match) {
      var file = findFile(match[1]);
      if (!file) return fakeResponse(404, { error: 'Arquivo não encontrado.' });
      file.isFavorite = true;
      return fakeResponse(200, { isFavorite: true });
    } },
    { method: 'DELETE', pattern: /^\/api\/files\/([^/]+)\/favorite$/, handler: function (match) {
      var file = findFile(match[1]);
      if (!file) return fakeResponse(404, { error: 'Arquivo não encontrado.' });
      file.isFavorite = false;
      return fakeResponse(200, { isFavorite: false });
    } },

    { method: 'PATCH', pattern: /^\/api\/files\/([^/]+)\/tags$/, handler: function (match, options) {
      var file = findFile(match[1]);
      if (!file) return fakeResponse(404, { error: 'Arquivo não encontrado.' });
      var body = parseBody(options);
      var tagIds = Array.isArray(body.tagIds) ? body.tagIds : [];
      var catalog = window.demoData.state.tags;
      file.tags = tagIds
        .map(function (tagId) { return catalog.find(function (t) { return t.id === tagId; }); })
        .filter(Boolean)
        .map(function (t) { return { id: t.id, name: t.name }; });
      return fakeResponse(200, file);
    } },

    { method: 'PATCH', pattern: /^\/api\/files\/([^/]+)$/, handler: function (match, options) {
      var file = findFile(match[1]);
      if (!file) return fakeResponse(404, { error: 'Arquivo não encontrado.' });
      var body = parseBody(options);
      if (Object.prototype.hasOwnProperty.call(body, 'displayName')) {
        file.displayName = body.displayName || '';
      }
      if (body.categoryId) {
        var category = window.demoData.state.categories.find(function (c) { return c.id === body.categoryId; });
        if (category) file.category = Object.assign({}, category);
      }
      if (body.producerId) {
        var producer = window.demoData.state.producers.find(function (p) { return p.id === body.producerId; });
        if (producer) file.producer = Object.assign({}, producer);
      }
      if (body.date) {
        file.date = body.date;
      }
      return fakeResponse(200, file);
    } },

    { method: 'DELETE', pattern: /^\/api\/files\/([^/]+)$/, handler: function (match) {
      var data = window.demoData.state;
      data.files = data.files.filter(function (f) { return f.id !== match[1]; });
      return fakeResponse(200, { ok: true });
    } },

    { method: 'GET', pattern: /^\/api\/files\/([^/]+)\/thumbnail$/, handler: function (match) {
      var override = window.demoData.thumbnailOverrides[match[1]];
      if (override) {
        return fetch(override).then(function (response) { return response; }).catch(function () {
          return fakeResponse(404, null);
        });
      }
      return fakeResponse(404, null);
    } },

    { method: 'POST', pattern: /^\/api\/files\/auto-caption$/, handler: async function (match, options) {
      var body = parseBody(options);
      var fileIds = Array.isArray(body.fileIds) ? body.fileIds : [];
      var results = fileIds.map(function (fileId) {
        var file = findFile(fileId);
        if (!file) return { fileId: fileId, displayName: null };
        var displayName = generateCaption(file);
        file.displayName = displayName;
        return { fileId: fileId, displayName: displayName };
      });
      // Atraso proporcional à quantidade, igual ao comportamento real (sem chegar
      // nem perto do timeout de 45s/arquivo que a tela já tolera).
      await new Promise(function (resolve) { setTimeout(resolve, Math.min(900 * fileIds.length, 2500)); });
      return fakeResponse(200, { results: results });
    } },

    { method: 'POST', pattern: /^\/api\/integrations\/google-drive\/folders$/, handler: function () {
      // A árvore de pastas já é construída a partir dos próprios arquivos fictícios —
      // uma lista vazia aqui é suficiente e não remove nada do que já está montado.
      return fakeResponse(200, { folders: [] });
    } },

    { method: 'POST', pattern: /^\/api\/integrations\/google-drive\/sync$/, handler: async function () {
      await new Promise(function (resolve) { setTimeout(resolve, 1100); });
      return fakeResponse(200, { created: 2, updated: 5, markedMissing: 0, reviewFlagged: 1, errors: 0 });
    } },

    { method: 'POST', pattern: /^\/api\/integrations\/acervo\/reset$/, handler: async function () {
      var data = window.demoData.state;
      var deletedDriveScopedRecords = data.files.filter(function (f) { return f.driveFolderId; }).length;
      await new Promise(function (resolve) { setTimeout(resolve, 700); });
      window.demoData.resetToSeed();
      return fakeResponse(200, {
        countsAfter: {
          deletedDriveScopedRecords: deletedDriveScopedRecords,
          sanitizedResidualMetadataRecords: 2,
        },
      });
    } },
  ];

  async function apiFetch(input, options) {
    var fullPath = String(input || '');
    var path = stripQuery(fullPath);
    var method = String((options && options.method) || 'GET').toUpperCase();

    await delay();

    for (var i = 0; i < ROUTES.length; i += 1) {
      var route = ROUTES[i];
      if (route.method !== method) continue;
      var match = path.match(route.pattern);
      if (match) {
        return route.handler(match, options);
      }
    }

    console.warn('[demo] rota não simulada:', method, path);
    return fakeResponse(404, { error: 'Rota não disponível na demonstração.' });
  }

  window.portalAuth = {
    API_BASE_URL: '',
    setToken: function () {},
    getToken: function () { return ''; },
    clearToken: function () {},
    logout: logout,
    getStoredUser: function () { return FAKE_USER; },
    getUserRole: function () { return 'master'; },
    canAccessPage: function () { return true; },
    getDefaultPageForRole: function () { return siteHubUrl(); },
    updateProfileLabels: updateProfileLabels,
    applyProfileVisibility: function () {
      // No-op intencional: o menu lateral de cada página da demo já vem
      // enxuto na própria HTML (só as 4 telas do escopo), e o usuário
      // fictício é sempre "master" (acesso total) — não há nada a esconder.
    },
    redirectToLogin: redirectToLogin,
    redirectTo: redirectTo,
    bootstrapAuth: bootstrapAuth,
    apiFetch: apiFetch,
    loadCurrentUser: async function () { return FAKE_USER; },
    login: async function () { return { token: 'demo', user: FAKE_USER }; },
  };
})();
