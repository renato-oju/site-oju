/* Local illustrative workspace. Selection never changes the real Hub or Drive. */
(function () {
  'use strict';
  var tablist = document.querySelector('.hub-app-tabs');
  if (!tablist) return;
  var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute('aria-controls')); });
  var cards = Array.from(document.querySelectorAll('[data-asset]'));
  var search = document.getElementById('hub-search');
  var projectAssets = document.getElementById('hub-project-assets');
  var openProject = document.getElementById('hub-open-project');

  function activate(index, focus) {
    tabs.forEach(function (tab, i) {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activate(index, false); });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(next, true);
    });
  });
  function normalize(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  function filter() {
    var query = normalize(search.value);
    var count = 0;
    cards.forEach(function (card) {
      var match = normalize(card.dataset.title + ' ' + card.dataset.category).includes(query);
      card.hidden = !match;
      if (match) count++;
    });
    document.getElementById('hub-result-count').textContent = count + (count === 1 ? ' arquivo encontrado' : ' arquivos encontrados');
    document.getElementById('hub-empty').hidden = count > 0;
  }
  function syncSelection() {
    var selected = cards.filter(function (card) { return card.querySelector('input').checked; });
    var count = selected.length;
    document.getElementById('hub-selection-count').textContent = count + (count === 1 ? ' selecionado' : ' selecionados');
    document.getElementById('hub-project-count').textContent = count + (count === 1 ? ' arquivo' : ' arquivos');
    document.getElementById('hub-project-empty').hidden = count > 0;
    openProject.disabled = count === 0;
    projectAssets.replaceChildren();
    selected.forEach(function (card) {
      var item = document.createElement('div');
      item.className = 'hub-project-card';
      var img = card.querySelector('.hub-asset__media>img').cloneNode();
      var title = document.createElement('strong');
      title.textContent = card.dataset.title;
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remover ' + card.dataset.title + ' da seleção');
      remove.addEventListener('click', function () {
        card.querySelector('input').checked = false;
        syncSelection();
        var remaining = projectAssets.querySelector('button');
        (remaining || document.querySelector('[data-hub-view="archive"]')).focus();
      });
      item.append(img, title, remove);
      projectAssets.append(item);
    });
  }
  cards.forEach(function (card) { card.querySelector('input').addEventListener('change', syncSelection); });
  search.addEventListener('input', filter);
  openProject.addEventListener('click', function () { activate(1, true); });
  document.querySelectorAll('[data-hub-view="archive"]').forEach(function (button) {
    button.addEventListener('click', function () { activate(0, true); });
  });
  activate(0, false);
  filter();
  syncSelection();
})();
