var currentTab = 'character';
var selectedCardId = null;
var editMode = false;
var editingCardId = null;

var decks = {
  character: [],
  weapon: [],
  tome: [],
  item: []
};

var TABS = [
  { id: 'character', label: 'ПЕРСОНАЖИ' },
  { id: 'weapon',    label: 'ОРУЖИЕ' },
  { id: 'tome',      label: 'ФОЛИАНТЫ' },
  { id: 'item',      label: 'ПРЕДМЕТЫ' }
];

var RARITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

var STORAGE_KEY = 'megabonk_deck';
var VERSION_KEY  = 'megabonk_ver';


function saveData() {
  var data = {};
  for (var cat in decks) {
    data[cat] = decks[cat].map(function(c) { return c.toJSON(); });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  try {
    var savedVer = Number(localStorage.getItem(VERSION_KEY) || 0);
    if (savedVer !== PRESET_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(PRESET_VERSION));
      return false;
    }
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var data = JSON.parse(raw);
    for (var cat in decks) {
      if (Array.isArray(data[cat])) {
        decks[cat] = data[cat].map(cardFromJSON).filter(Boolean);
      }
    }
    return true;
  } catch(e) {
    console.log('ошибка localStorage:', e);
    return false;
  }
}

function makeId() {
  return 'card_' + Date.now();
}

function buildSite() {
  // 1. Загружаем данные
  var loaded = loadData();
  if (!loaded) {
    for (var cat in PRESET_DATA) {
      decks[cat] = PRESET_DATA[cat].slice();
    }
  }

  // выбираем первую карточку сразу
  if (decks[currentTab].length > 0) {
    selectedCardId = decks[currentTab][0].id;
  }

  // 2. Строим главное окно
  var win = document.createElement('div');
  win.id = 'window';

  ['tl','tr','bl','br'].forEach(function(pos) {
    var c = document.createElement('div');
    c.className = 'win-corner ' + pos;
    win.appendChild(c);
  });

  win.appendChild(buildHeader());
  win.appendChild(buildTabsEl());

  var bodyArea = document.createElement('div');
  bodyArea.id = 'body-area';
  bodyArea.appendChild(buildGridPanel());
  bodyArea.appendChild(buildStatsPanel());
  win.appendChild(bodyArea);
  win.appendChild(buildBottomPanel());

  // 3. Добавляем в body
  document.body.appendChild(win);

  var notif = document.createElement('div');
  notif.id = 'notif';
  document.body.appendChild(notif);

  document.body.appendChild(buildModal());
  document.body.appendChild(buildConfirmModal());

  // 4. Навешиваем события
  addEvents();

  // 5. Первичный рендер
  renderGrid();
  renderDetail();
}

function buildHeader() {
  var header = document.createElement('div');
  header.id = 'titlebar';
  header.innerHTML =
    '<div id="titlebar-left">' +
      '<span id="win-title">Бестиарий - Megabonk</span>' +
      '<button class="edit-toggle-btn" id="btn-edit">&#9999; РЕДАКТИРОВАТЬ</button>' +
    '</div>';
  return header;
}

function buildTabsEl() {
  var tabsEl = document.createElement('div');
  tabsEl.id = 'tabs';
  for (var i = 0; i < TABS.length; i++) {
    var t = TABS[i];
    var btn = document.createElement('button');
    btn.className = 'tab-btn' + (t.id === currentTab ? ' active' : '');
    btn.setAttribute('data-tab', t.id);
    btn.textContent = t.label;
    tabsEl.appendChild(btn);
  }
  return tabsEl;
}

function buildGridPanel() {
  var panel = document.createElement('div');
  panel.id = 'grid-panel';

  var wrap = document.createElement('div');
  wrap.id = 'grid-wrap';

  ['tl','tr','bl'].forEach(function(pos) {
    var b = document.createElement('div');
    b.className = 'grid-bracket ' + pos;
    wrap.appendChild(b);
  });

  var grid = document.createElement('div');
  grid.id = 'cards-grid';
  wrap.appendChild(grid);
  panel.appendChild(wrap);
  return panel;
}

function buildStatsPanel() {
  var panel = document.createElement('div');
  panel.id = 'stats-panel';

  var box = document.createElement('div');
  box.id = 'stats-box';
  box.innerHTML =
    '<div class="win-corner tl"></div>' +
    '<div class="win-corner tr"></div>' +
    '<div class="win-corner bl"></div>' +
    '<div class="win-corner br"></div>' +
    '<div class="stats-title" id="stats-title">Характеристики</div>' +
    '<div id="stats-rows"><div id="stats-empty">Выберите карточку</div></div>';

  panel.appendChild(box);
  return panel;
}

function buildBottomPanel() {
  var panel = document.createElement('div');
  panel.id = 'bottom-panel';
  panel.innerHTML =
    '<div id="bottom-icon">&#10067;</div>' +
    '<div id="bottom-text">' +
      '<div id="bottom-empty" style="font-size:7px;color:var(--text-dim)">Выберите карточку...</div>' +
    '</div>';
  return panel;
}

function buildConfirmModal() {
  var bg = document.createElement('div');
  bg.id = 'confirm-bg';
  bg.innerHTML =
    '<div id="confirm-box">' +
      '<div class="win-corner tl"></div><div class="win-corner tr"></div>' +
      '<div class="win-corner bl"></div><div class="win-corner br"></div>' +
      '<div class="modal-title" style="color:var(--text-red)">&#10006; УДАЛИТЬ КАРТОЧКУ?</div>' +
      '<div id="confirm-msg" style="font-size:7px;color:var(--text-light);line-height:2;margin-bottom:14px;"></div>' +
      '<div class="modal-actions">' +
        '<button class="mbtn" id="confirm-no">ОТМЕНА</button>' +
        '<button class="mbtn del" id="confirm-yes">&#10006; УДАЛИТЬ</button>' +
      '</div>' +
    '</div>';
  return bg;
}

// ── ОСНОВНАЯ МОДАЛКА ──
function buildModal() {
  var bg = document.createElement('div');
  bg.id = 'modal-bg';
  bg.innerHTML =
    '<div id="modal">' +
      '<div class="win-corner tl"></div><div class="win-corner tr"></div>' +
      '<div class="win-corner bl"></div><div class="win-corner br"></div>' +
      '<div class="modal-title" id="modal-title">ДОБАВИТЬ КАРТОЧКУ</div>' +
      '<div class="form-row">' +
        '<label class="form-lbl">КАТЕГОРИЯ</label>' +
        '<select class="form-sel" id="mf-category">' +
          '<option value="character">ПЕРСОНАЖ</option>' +
          '<option value="weapon">ОРУЖИЕ</option>' +
          '<option value="tome">ФОЛИАНТ</option>' +
          '<option value="item">ПРЕДМЕТ</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-row">' +
        '<label class="form-lbl">РЕДКОСТЬ</label>' +
        '<select class="form-sel" id="mf-rarity">' +
          '<option value="common">COMMON</option>' +
          '<option value="uncommon">UNCOMMON</option>' +
          '<option value="rare">RARE</option>' +
          '<option value="legendary">LEGENDARY</option>' +
        '</select>' +
      '</div>' +
      '<div class="form-row">' +
        '<label class="form-lbl">НАЗВАНИЕ</label>' +
        '<input class="form-inp" id="mf-name" maxlength="50" placeholder="Название..."/>' +
      '</div>' +
      '<div class="form-row">' +
        '<label class="form-lbl">ОПИСАНИЕ</label>' +
        '<textarea class="form-ta" id="mf-desc" maxlength="200" placeholder="Описание..."></textarea>' +
      '</div>' +
      '<div class="form-row">' +
        '<label class="form-lbl">ИЗОБРАЖЕНИЕ</label>' +
        '<div class="img-preview-wrap">' +
          '<div class="img-preview" id="mf-img-preview"></div>' +
          '<div style="display:flex;flex-direction:column;gap:6px;">' +
            '<button class="mbtn" type="button" id="mf-img-btn" style="font-size:7px;padding:6px 10px;">&#128193; ВЫБРАТЬ ФАЙЛ</button>' +
            '<button class="mbtn" type="button" id="mf-img-clear" style="font-size:7px;padding:6px 10px;color:var(--text-red);border-color:var(--text-red);">&#10006; УБРАТЬ ФОТО</button>' +
          '</div>' +
        '</div>' +
        '<input type="file" id="mf-file-input" accept="image/*" style="display:none"/>' +
        '<input type="hidden" id="mf-image" value=""/>' +
        '<div class="img-hint">Загрузи PNG/JPG/GIF с компьютера. Макс. 2 МБ.</div>' +
      '</div>' +
      '<div id="mf-extra"></div>' +
      '<div class="modal-actions">' +
        '<button class="mbtn" id="mf-cancel">ОТМЕНА</button>' +
        '<button class="mbtn ok" id="mf-confirm">&#10004; СОХРАНИТЬ</button>' +
      '</div>' +
    '</div>';
  return bg;
}

function renderGrid() {
  var grid = document.getElementById('cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  var cards = decks[currentTab] ? decks[currentTab].slice() : [];

  // предметы сортируем по редкости
  if (currentTab === 'item') {
    cards.sort(function(a, b) {
      var ra = RARITY_ORDER[a.rarity] !== undefined ? RARITY_ORDER[a.rarity] : 0;
      var rb = RARITY_ORDER[b.rarity] !== undefined ? RARITY_ORDER[b.rarity] : 0;
      if (ra !== rb) return ra - rb;
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return 0;
    });
  }

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var tmp = document.createElement('div');
    tmp.innerHTML = card.toHTML(); // полиморфный метод
    var cell = tmp.firstElementChild;
    if (card.id === selectedCardId) {
      cell.classList.add('selected');
    }
    grid.appendChild(cell);
  }

  // кнопка добавить — только в режиме редактирования
  if (editMode) {
    var addBtn = document.createElement('div');
    addBtn.className = 'cell add-cell';
    addBtn.id = 'btn-add-cell';
    addBtn.innerHTML = '<div class="add-plus">+</div><div class="add-lbl">ДОБАВИТЬ</div>';
    grid.appendChild(addBtn);
  }
}

function renderDetail() {
  var card = findCard(selectedCardId);

  var iconEl  = document.getElementById('bottom-icon');
  var textEl  = document.getElementById('bottom-text');
  var titleEl = document.getElementById('stats-title');
  var rowsEl  = document.getElementById('stats-rows');

  if (!card) {
    if (iconEl)  iconEl.textContent = '?';
    if (textEl)  textEl.innerHTML = '<div id="bottom-empty" style="font-size:7px;color:var(--text-dim)">Выберите карточку...</div>';
    if (rowsEl)  rowsEl.innerHTML = '<div id="stats-empty">Выберите карточку</div>';
    return;
  }

  if (iconEl) {
    if (card.image) {
      iconEl.innerHTML = '<img src="' + card.image + '" alt="' + card.name + '" onerror="this.style.display=\'none\'">';
    } else {
      iconEl.textContent = '';
    }
  }

  if (textEl) {
    textEl.innerHTML = '<div id="bottom-name">' + card.name + '</div><div id="bottom-desc">' + card.description + '</div>';
  }

  var category = card.getCategory();
  var stats = card.getStats();

  if (category === 'weapon') {
    var useful = card.getUsefulStats ? card.getUsefulStats() : [];
    if (titleEl) titleEl.textContent = 'Полезные статы';
    if (rowsEl) {
      if (useful.length === 0) {
        rowsEl.innerHTML = '<div style="opacity:0.4;font-size:7px">Нет данных</div>';
      } else {
        var html = '';
        for (var i = 0; i < useful.length; i++) {
          html += '<div class="stat-row useful-stat"><span class="stat-dash">&#8212;</span><span class="stat-useful">' + useful[i] + '</span></div>';
        }
        rowsEl.innerHTML = html;
      }
    }
  } else if (stats.length > 0) {
    if (titleEl) titleEl.textContent = 'Характеристики';
    if (rowsEl) {
      var html = '';
      for (var i = 0; i < stats.length; i++) {
        var s = stats[i];
        html += '<div class="stat-row"><span class="stat-label">' + s.label + '</span><span class="stat-val ' + (s.style || '') + '">' + s.value + '</span></div>';
      }
      rowsEl.innerHTML = html;
    }
  } else {
    if (titleEl) titleEl.textContent = '';
    if (rowsEl)  rowsEl.innerHTML = '';
  }
}

function openAddModal() {
  editingCardId = null;
  document.getElementById('modal-title').textContent = 'ДОБАВИТЬ КАРТОЧКУ';
  document.getElementById('mf-category').value = currentTab;
  document.getElementById('mf-category').disabled = false;
  document.getElementById('mf-name').value = '';
  document.getElementById('mf-desc').value = '';
  document.getElementById('mf-rarity').value = 'common';
  document.getElementById('mf-image').value = '';
  document.getElementById('mf-file-input').value = '';
  document.getElementById('mf-img-preview').innerHTML = '';
  buildExtraFields(currentTab, null);
  document.getElementById('modal-bg').classList.add('open');
  document.getElementById('mf-name').focus();
}

function openEditModal(id) {
  var card = findCard(id);
  if (!card) return;
  editingCardId = id;
  document.getElementById('modal-title').textContent = 'ИЗМЕНИТЬ КАРТОЧКУ';
  document.getElementById('mf-category').value = card.getCategory();
  document.getElementById('mf-category').disabled = true;
  document.getElementById('mf-name').value = card.name;
  document.getElementById('mf-desc').value = card.description;
  document.getElementById('mf-rarity').value = card.rarity;
  document.getElementById('mf-image').value = card.image || '';
  document.getElementById('mf-file-input').value = '';

  var prev = document.getElementById('mf-img-preview');
  if (card.image) {
    prev.innerHTML = '<img src="' + card.image + '" alt="preview">';
  } else {
    prev.innerHTML = '';
  }

  buildExtraFields(card.getCategory(), card);
  document.getElementById('modal-bg').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  document.getElementById('mf-category').disabled = false;
}

function buildExtraFields(category, card) {
  var extra = document.getElementById('mf-extra');

  function val(key, def) {
    if (def === undefined) def = '';
    return (card && card[key] !== undefined) ? card[key] : def;
  }

  var html = '';

  if (category === 'character') {
    html += '<div style="font-size:6px;color:var(--text-cyan);margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--border-inner);">── ФИКСИРОВАННЫЕ СТАТЫ ──</div>';
    html += '<div class="form-2col">';
    html += '<div class="form-row"><label class="form-lbl">МАКС. ХП</label><input class="form-inp" id="ef-maxHp" type="number" min="1" value="' + val('maxHp', 100) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">СКОРОСТЬ (x)</label><input class="form-inp" id="ef-speed" type="number" step="0.01" value="' + val('speed', 1.0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ПРЫЖОК</label><input class="form-inp" id="ef-jumpHeight" type="number" value="' + val('jumpHeight', 8) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">Р.ПОДБОРА</label><input class="form-inp" id="ef-pickupRadius" type="number" value="' + val('pickupRadius', 5) + '"/></div>';
    html += '</div>';
    html += '<div class="form-row"><label class="form-lbl">СТАРТОВОЕ ОРУЖИЕ</label><input class="form-inp" id="ef-startWeapon" value="' + val('startWeapon', 'Кулак') + '"/></div>';
    html += '<div style="font-size:6px;color:var(--text-dim);margin:8px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border-inner);">── СИТУАТИВНЫЕ (0 = не показывать) ──</div>';
    html += '<div class="form-2col">';
    html += '<div class="form-row"><label class="form-lbl">УКЛОНЕНИЕ %</label><input class="form-inp" id="ef-evasion" type="number" min="0" value="' + val('evasion', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">УДАЧА %</label><input class="form-inp" id="ef-luck" type="number" min="0" value="' + val('luck', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">БРОНЯ %</label><input class="form-inp" id="ef-armor" type="number" min="0" value="' + val('armor', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ВАМПИРИЗМ %</label><input class="form-inp" id="ef-lifesteal" type="number" min="0" value="' + val('lifesteal', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">БОН.УРОНА %</label><input class="form-inp" id="ef-damageBonus" type="number" min="0" value="' + val('damageBonus', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ДОП.ПРЫЖКИ</label><input class="form-inp" id="ef-extraJumps" type="number" min="0" value="' + val('extraJumps', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ЩИТ</label><input class="form-inp" id="ef-shield" type="number" min="0" value="' + val('shield', 0) + '"/></div>';
    html += '</div>';

  } else if (category === 'weapon') {
    var usefulVal = (card && Array.isArray(card.usefulStats)) ? card.usefulStats.join(', ') : '';
    html += '<div class="form-2col">';
    html += '<div class="form-row"><label class="form-lbl">УРОН</label><input class="form-inp" id="ef-damage" type="number" value="' + val('damage', 10) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">СК.АТАКИ (x)</label><input class="form-inp" id="ef-fireRate" type="number" step="0.1" value="' + val('fireRate', 1.0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">СНАРЯДОВ</label><input class="form-inp" id="ef-projectiles" type="number" min="1" value="' + val('projectiles', 1) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">РАЗМЕР (x)</label><input class="form-inp" id="ef-size" type="number" step="0.1" value="' + val('size', 1.0) + '"/></div>';
    html += '</div>';
    html += '<div class="form-row"><label class="form-lbl">ДАЛЬНОСТЬ</label><input class="form-inp" id="ef-range" value="' + val('range', 'средняя') + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ПОЛЕЗНЫЕ СТАТЫ</label>';
    html += '<textarea class="form-ta" id="ef-usefulStats" placeholder="Урон, Размер, Скорость атаки">' + usefulVal + '</textarea>';
    html += '<div class="img-hint">Перечисли через запятую</div></div>';

  } else if (category === 'tome') {
    html += '<div class="form-2col">';
    html += '<div class="form-row"><label class="form-lbl">СКОРОСТЬ %</label><input class="form-inp" id="ef-speedBonus" type="number" value="' + val('speedBonus', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ПРЫЖОК</label><input class="form-inp" id="ef-jumpBonus" type="number" value="' + val('jumpBonus', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">УРОН %</label><input class="form-inp" id="ef-damageBonus" type="number" value="' + val('damageBonus', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">-ОТКАТ %</label><input class="form-inp" id="ef-cooldownReduction" type="number" value="' + val('cooldownReduction', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">РАДИУС %</label><input class="form-inp" id="ef-areaBonus" type="number" value="' + val('areaBonus', 0) + '"/></div>';
    html += '</div>';

  } else if (category === 'item') {
    html += '<div class="form-row"><label class="form-lbl">ЭФФЕКТ</label><input class="form-inp" id="ef-effect" value="' + val('effect', '') + '"/></div>';
    html += '<div class="form-2col">';
    html += '<div class="form-row"><label class="form-lbl">+ХП</label><input class="form-inp" id="ef-hpBonus" type="number" value="' + val('hpBonus', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">БРОНЯ</label><input class="form-inp" id="ef-armorBonus" type="number" value="' + val('armorBonus', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">РЕГЕН/СЕК</label><input class="form-inp" id="ef-regenPerSec" type="number" step="0.1" value="' + val('regenPerSec', 0) + '"/></div>';
    html += '<div class="form-row"><label class="form-lbl">ШАН.ВЫПАД%</label><input class="form-inp" id="ef-dropChance" type="number" value="' + val('dropChance', 0) + '"/></div>';
    html += '</div>';
  }

  extra.innerHTML = html;
}

function saveModal() {
  var cat    = document.getElementById('mf-category').value;
  var name   = document.getElementById('mf-name').value.trim() || 'Новая карта';
  var desc   = document.getElementById('mf-desc').value.trim() || '';
  var rarity = document.getElementById('mf-rarity').value;
  var image  = document.getElementById('mf-image').value.trim();

  function getNum(id, def) {
    var el = document.getElementById(id);
    return el ? Number(el.value) : (def || 0);
  }
  function getStr(id, def) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : (def || '');
  }

  var data = { name: name, description: desc, rarity: rarity, unlocked: true, image: image };

  if (cat === 'character') {
    data.maxHp        = getNum('ef-maxHp', 100);
    data.speed        = getNum('ef-speed', 1);
    data.jumpHeight   = getNum('ef-jumpHeight', 8);
    data.pickupRadius = getNum('ef-pickupRadius', 5);
    data.startWeapon  = getStr('ef-startWeapon', 'Кулак');
    data.evasion      = getNum('ef-evasion', 0);
    data.luck         = getNum('ef-luck', 0);
    data.armor        = getNum('ef-armor', 0);
    data.lifesteal    = getNum('ef-lifesteal', 0);
    data.damageBonus  = getNum('ef-damageBonus', 0);
    data.extraJumps   = getNum('ef-extraJumps', 0);
    data.shield       = getNum('ef-shield', 0);

  } else if (cat === 'weapon') {
    data.damage      = getNum('ef-damage', 10);
    data.fireRate    = getNum('ef-fireRate', 1);
    data.projectiles = getNum('ef-projectiles', 1);
    data.range       = getStr('ef-range', 'средняя');
    data.size        = getNum('ef-size', 1);
    var usefulEl     = document.getElementById('ef-usefulStats');
    data.usefulStats = usefulEl
      ? usefulEl.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; })
      : [];

  } else if (cat === 'tome') {
    data.speedBonus        = getNum('ef-speedBonus', 0);
    data.jumpBonus         = getNum('ef-jumpBonus', 0);
    data.damageBonus       = getNum('ef-damageBonus', 0);
    data.cooldownReduction = getNum('ef-cooldownReduction', 0);
    data.areaBonus         = getNum('ef-areaBonus', 0);

  } else if (cat === 'item') {
    data.effect      = getStr('ef-effect', '');
    data.hpBonus     = getNum('ef-hpBonus', 0);
    data.armorBonus  = getNum('ef-armorBonus', 0);
    data.regenPerSec = getNum('ef-regenPerSec', 0);
    data.dropChance  = getNum('ef-dropChance', 0);
  }

  if (editingCardId) {
    data.id = editingCardId;
    var deck = decks[cat];
    for (var i = 0; i < deck.length; i++) {
      if (deck[i].id === editingCardId) {
        data.category = cat;
        deck[i] = cardFromJSON(data);
        break;
      }
    }
    showNotif('Сохранено');
  } else {
    data.id = makeId();
    data.category = cat;
    var newCard = cardFromJSON(data);
    decks[cat].push(newCard);
    currentTab = cat;
    selectedCardId = newCard.id;
    updateTabs();
    showNotif('Карточка добавлена');
  }

  closeModal();
  saveData();
  renderGrid();
  renderDetail();
}

var pendingDeleteId = null;

function askDelete(id) {
  var card = findCard(id);
  if (!card) return;
  pendingDeleteId = id;
  document.getElementById('confirm-msg').textContent = 'Удалить "' + card.name + '"?';
  document.getElementById('confirm-bg').classList.add('open');
}

function doDelete() {
  var id = pendingDeleteId;
  if (!id) return;
  pendingDeleteId = null;
  document.getElementById('confirm-bg').classList.remove('open');

  var foundCat = null;
  for (var cat in decks) {
    for (var i = 0; i < decks[cat].length; i++) {
      if (decks[cat][i].id === id) { foundCat = cat; break; }
    }
    if (foundCat) break;
  }
  if (!foundCat) return;

  decks[foundCat] = decks[foundCat].filter(function(c) { return c.id !== id; });

  if (selectedCardId === id) {
    selectedCardId = decks[foundCat].length > 0 ? decks[foundCat][0].id : null;
  }

  saveData();
  renderGrid();
  renderDetail();
  showNotif('Удалено');
}

function toggleEdit() {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  var btn = document.getElementById('btn-edit');
  if (editMode) {
    btn.textContent = 'X ВЫЙТИ';
    btn.classList.add('active');
  } else {
    btn.textContent = '✏ РЕДАКТИРОВАТЬ';
    btn.classList.remove('active');
  }
  renderGrid();
}

function findCard(id) {
  for (var cat in decks) {
    for (var i = 0; i < decks[cat].length; i++) {
      if (decks[cat][i].id === id) return decks[cat][i];
    }
  }
  return null;
}

function updateTabs() {
  var btns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle('active', btns[i].getAttribute('data-tab') === currentTab);
  }
}

var notifTimeout = null;
function showNotif(msg) {
  var el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(function() { el.classList.remove('show'); }, 2000);
}


// ══════════════════════════════════════════
// СОБЫТИЯ
// ══════════════════════════════════════════
function addEvents() {
  // вкладки
  document.getElementById('tabs').addEventListener('click', function(e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    currentTab = btn.getAttribute('data-tab');
    selectedCardId = decks[currentTab].length > 0 ? decks[currentTab][0].id : null;
    updateTabs();
    renderGrid();
    renderDetail();
  });

  // клики по сетке
  document.getElementById('cards-grid').addEventListener('click', function(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      var id = actionBtn.getAttribute('data-id');
      if (actionBtn.getAttribute('data-action') === 'edit')   openEditModal(id);
      if (actionBtn.getAttribute('data-action') === 'delete') askDelete(id);
      return;
    }
    if (e.target.closest('#btn-add-cell')) { openAddModal(); return; }
    var cell = e.target.closest('.cell[data-id]');
    if (cell && !cell.classList.contains('locked')) {
      selectedCardId = cell.getAttribute('data-id');
      var allCells = document.querySelectorAll('.cell');
      for (var i = 0; i < allCells.length; i++) {
        allCells[i].classList.remove('selected');
      }
      cell.classList.add('selected');
      renderDetail();
    }
  });

  document.getElementById('btn-edit').addEventListener('click', toggleEdit);

  document.getElementById('mf-cancel').addEventListener('click', closeModal);
  document.getElementById('mf-confirm').addEventListener('click', saveModal);
  document.getElementById('modal-bg').addEventListener('click', function(e) {
    if (e.target.id === 'modal-bg') closeModal();
  });

  document.getElementById('mf-img-btn').addEventListener('click', function() {
    document.getElementById('mf-file-input').click();
  });

  document.getElementById('mf-file-input').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;

    // проверка формата
    var allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowed.indexOf(file.type) === -1) {
      showNotif('Только PNG, JPG, GIF, WEBP');
      e.target.value = '';
      return;
    }

    // проверка размера — не больше 2 МБ
    var maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotif('Файл слишком большой (макс. 2 МБ)');
      e.target.value = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function(ev) {
      var base64 = ev.target.result;
      document.getElementById('mf-image').value = base64;
      document.getElementById('mf-img-preview').innerHTML = '<img src="' + base64 + '" alt="preview">';
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  document.getElementById('mf-img-clear').addEventListener('click', function() {
    document.getElementById('mf-image').value = '';
    document.getElementById('mf-img-preview').innerHTML = '';
  });

  document.getElementById('mf-category').addEventListener('change', function(e) {
    buildExtraFields(e.target.value, null);
  });

  document.getElementById('mf-name').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') saveModal();
  });

  document.getElementById('confirm-yes').addEventListener('click', doDelete);
  document.getElementById('confirm-no').addEventListener('click', function() {
    pendingDeleteId = null;
    document.getElementById('confirm-bg').classList.remove('open');
  });
  document.getElementById('confirm-bg').addEventListener('click', function(e) {
    if (e.target.id === 'confirm-bg') {
      pendingDeleteId = null;
      document.getElementById('confirm-bg').classList.remove('open');
    }
  });
}

document.addEventListener('DOMContentLoaded', buildSite);