// базовый класс для всех карточек
class Card {
  constructor(id, name, description, icon, rarity, unlocked, image) {
    // нельзя создать просто Card, только наследников
    if (this.constructor === Card) {
      throw new Error('Card это абстрактный класс!');
    }
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon || '❓';
    this.rarity = rarity || 'common';
    this.unlocked = unlocked !== undefined ? unlocked : true;
    this.image = image || '';
  }

  // геттеры и сеттеры для инкапсуляции
  getName() { return this.name }
  setName(val) {
    if (val && val.length > 0) {
      this.name = val;
    }
  }

  getDesc() { return this.description }
  setDesc(val) { this.description = val }

  getRarity() { return this.rarity }
  setRarity(val) {
    // проверяем что редкость из допустимых значений
    var allowed = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    if (allowed.includes(val)) {
      this.rarity = val;
    }
  }

  getImage() { return this.image }
  setImage(val) { this.image = val || '' }

  // этот метод переопределяется в каждом подклассе (полиморфизм)
  getCategory() {
    throw new Error('getCategory() надо переопределить');
  }

  getCategoryName() {
    throw new Error('getCategoryName() надо переопределить');
  }

  // возвращает массив статов для отображения
  getStats() {
    throw new Error('getStats() надо переопределить');
  }

  // возвращает html для ячейки в сетке
  // каждый класс может переопределить если надо
  toHTML() {
    var lockedClass = this.unlocked ? '' : ' locked';
    var typeClass = ' type-' + this.getCategory();
    // цветная рамка только у предметов
    var rarityClass = this.getCategory() === 'item' ? ' rarity-' + this.rarity : '';

    // если есть картинка показываем её, иначе эмодзи
    var imgHtml = '';
    var hasImgClass = '';
    if (this.image) {
      imgHtml = '<img class="cell-img" src="' + this.image + '" alt="' + this.name + '" onerror="this.style.display=\'none\'">';
      hasImgClass = ' has-img';
    }

    var html = '<div class="cell' + lockedClass + typeClass + rarityClass + hasImgClass + '" data-id="' + this.id + '">';
    html += imgHtml;
    html += '<span class="cell-icon">' + this.icon + '</span>';
    // угловые скобки для анимации выбора
    html += '<div class="sel-corner c-tl"></div>';
    html += '<div class="sel-corner c-tr"></div>';
    html += '<div class="sel-corner c-bl"></div>';
    html += '<div class="sel-corner c-br"></div>';
    html += '<div class="cell-edit-overlay">';
    html += '<button class="eo-btn" data-action="edit" data-id="' + this.id + '">✏ ИЗМЕНИТЬ</button>';
    html += '<button class="eo-btn del" data-action="delete" data-id="' + this.id + '">✖ УДАЛИТЬ</button>';
    html += '</div>';
    html += '</div>';

    return html;
  }

  // для сохранения в localStorage
  toJSON() {
    return {
      category: this.getCategory(),
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      rarity: this.rarity,
      unlocked: this.unlocked,
      image: this.image
    }
  }
}


// класс персонажа - наследует от Card
class CharacterCard extends Card {
  constructor(data) {
    super(data.id, data.name, data.description, data.icon, data.rarity, data.unlocked, data.image);

    // основные статы персонажа
    this.maxHp = data.maxHp || 100;
    this.speed = data.speed || 1.0;
    this.jumpHeight = data.jumpHeight || 8;
    this.pickupRadius = data.pickupRadius || 5;
    this.startWeapon = data.startWeapon || 'Кулак';

    // дополнительные статы - показываются только если больше 0
    this.evasion = data.evasion || 0;
    this.luck = data.luck || 0;
    this.armor = data.armor || 0;
    this.lifesteal = data.lifesteal || 0;
    this.damageBonus = data.damageBonus || 0;
    this.extraJumps = data.extraJumps || 0;
    this.shield = data.shield || 0;
  }

  // сеттеры с простой проверкой
  setMaxHp(val) {
    if (!isNaN(val) && val > 0) this.maxHp = Number(val)
  }
  setSpeed(val) {
    if (!isNaN(val) && val > 0) this.speed = Number(val)
  }
  setJumpHeight(val) {
    if (!isNaN(val)) this.jumpHeight = Number(val)
  }
  setPickupRadius(val) {
    if (!isNaN(val) && val >= 0) this.pickupRadius = Number(val)
  }
  setStartWeapon(val) {
    if (val) this.startWeapon = val
  }
  setEvasion(val) { if (!isNaN(val)) this.evasion = Number(val) }
  setLuck(val) { if (!isNaN(val)) this.luck = Number(val) }
  setArmor(val) { if (!isNaN(val)) this.armor = Number(val) }
  setLifesteal(val) { if (!isNaN(val)) this.lifesteal = Number(val) }
  setDamageBonus(val) { if (!isNaN(val)) this.damageBonus = Number(val) }
  setExtraJumps(val) { if (!isNaN(val)) this.extraJumps = Number(val) }
  setShield(val) { if (!isNaN(val)) this.shield = Number(val) }

  getCategory() { return 'character' }
  getCategoryName() { return 'Персонаж' }

  // полиморфизм - у каждого типа свои статы
  getStats() {
    // эти 4 всегда показываются
    var stats = [
      { label: 'Макс. ХП:', value: String(this.maxHp), style: 'neu' },
      { label: 'Скорость:', value: this.speed.toFixed(2) + 'x', style: this.speed > 1 ? 'pos' : 'neu' },
      { label: 'Высота прыжка:', value: String(this.jumpHeight), style: this.jumpHeight > 8 ? 'pos' : 'neu' },
      { label: 'Радиус подбора:', value: String(this.pickupRadius), style: this.pickupRadius > 5 ? 'pos' : 'neu' },
    ]

    // остальные только если не 0
    if (this.evasion > 0) stats.push({ label: 'Уклонение:', value: this.evasion + '%', style: 'pos' })
    if (this.luck > 0) stats.push({ label: 'Удача:', value: this.luck + '%', style: 'pos' })
    if (this.armor > 0) stats.push({ label: 'Броня:', value: this.armor + '%', style: 'pos' })
    if (this.lifesteal > 0) stats.push({ label: 'Похищение жизней:', value: this.lifesteal + '%', style: 'pos' })
    if (this.damageBonus > 0) stats.push({ label: 'Бонус урона:', value: '+' + this.damageBonus + '%', style: 'pos' })
    if (this.extraJumps > 0) stats.push({ label: 'Доп. прыжки:', value: '+' + this.extraJumps, style: 'pos' })
    if (this.shield > 0) stats.push({ label: 'Щит:', value: String(this.shield), style: 'pos' })

    // оружие всегда в конце
    stats.push({ label: 'Стартовое оружие:', value: this.startWeapon, style: 'neu' });

    return stats;
  }

  toJSON() {
    var base = super.toJSON();
    base.maxHp = this.maxHp;
    base.speed = this.speed;
    base.jumpHeight = this.jumpHeight;
    base.pickupRadius = this.pickupRadius;
    base.startWeapon = this.startWeapon;
    base.evasion = this.evasion;
    base.luck = this.luck;
    base.armor = this.armor;
    base.lifesteal = this.lifesteal;
    base.damageBonus = this.damageBonus;
    base.extraJumps = this.extraJumps;
    base.shield = this.shield;
    return base;
  }
}


// класс оружия
class WeaponCard extends Card {
  constructor(data) {
    super(data.id, data.name, data.description, data.icon, data.rarity, data.unlocked, data.image);
    this.damage = data.damage || 10;
    this.fireRate = data.fireRate || 1.0;
    this.projectiles = data.projectiles || 1;
    this.range = data.range || 'средняя';
    this.size = data.size || 1.0;
    // с какими статами сочетается это оружие
    this.usefulStats = data.usefulStats || [];
  }

  setDamage(val) { if (!isNaN(val) && val > 0) this.damage = Number(val) }
  setFireRate(val) { if (!isNaN(val) && val > 0) this.fireRate = Number(val) }
  setProjectiles(val) { if (!isNaN(val) && val > 0) this.projectiles = Number(val) }
  setRange(val) { if (val) this.range = val }
  setSize(val) { if (!isNaN(val) && val > 0) this.size = Number(val) }
  setUsefulStats(val) { if (Array.isArray(val)) this.usefulStats = val }

  getCategory() { return 'weapon' }
  getCategoryName() { return 'Оружие' }

  // у оружия статы не числовые а список того с чем сочетается
  getStats() {
    return [];
  }

  getUsefulStats() {
    return this.usefulStats;
  }

  toJSON() {
    var base = super.toJSON();
    base.damage = this.damage;
    base.fireRate = this.fireRate;
    base.projectiles = this.projectiles;
    base.range = this.range;
    base.size = this.size;
    base.usefulStats = this.usefulStats;
    return base;
  }
}


// класс фолианта (книги с бонусами)
class TomeCard extends Card {
  constructor(data) {
    super(data.id, data.name, data.description, data.icon, data.rarity, data.unlocked, data.image);
    this.speedBonus = data.speedBonus || 0;
    this.jumpBonus = data.jumpBonus || 0;
    this.damageBonus = data.damageBonus || 0;
    this.cooldownReduction = data.cooldownReduction || 0;
    this.areaBonus = data.areaBonus || 0;
  }

  setSpeedBonus(val) { if (!isNaN(val)) this.speedBonus = Number(val) }
  setJumpBonus(val) { if (!isNaN(val)) this.jumpBonus = Number(val) }
  setDamageBonus(val) { if (!isNaN(val)) this.damageBonus = Number(val) }
  setCooldownReduction(val) { if (!isNaN(val)) this.cooldownReduction = Number(val) }
  setAreaBonus(val) { if (!isNaN(val)) this.areaBonus = Number(val) }

  getCategory() { return 'tome' }
  getCategoryName() { return 'Фолиант' }

  // фолианты - правая панель пустая, всё написано в описании
  getStats() {
    return [];
  }

  toJSON() {
    var base = super.toJSON();
    base.speedBonus = this.speedBonus;
    base.jumpBonus = this.jumpBonus;
    base.damageBonus = this.damageBonus;
    base.cooldownReduction = this.cooldownReduction;
    base.areaBonus = this.areaBonus;
    return base;
  }
}


// класс предмета (пассивный бафф)
class ItemCard extends Card {
  constructor(data) {
    super(data.id, data.name, data.description, data.icon, data.rarity, data.unlocked, data.image);
    this.effect = data.effect || '';
    this.hpBonus = data.hpBonus || 0;
    this.armorBonus = data.armorBonus || 0;
    this.regenPerSec = data.regenPerSec || 0;
    this.dropChance = data.dropChance || 0;
  }

  setEffect(val) { this.effect = String(val) }
  setHpBonus(val) { if (!isNaN(val)) this.hpBonus = Number(val) }
  setArmorBonus(val) { if (!isNaN(val)) this.armorBonus = Number(val) }
  setRegenPerSec(val) { if (!isNaN(val)) this.regenPerSec = Number(val) }
  setDropChance(val) { if (!isNaN(val)) this.dropChance = Number(val) }

  getCategory() { return 'item' }
  getCategoryName() { return 'Предмет' }

  // предметы тоже без правой панели
  getStats() {
    return [];
  }

  toJSON() {
    var base = super.toJSON();
    base.effect = this.effect;
    base.hpBonus = this.hpBonus;
    base.armorBonus = this.armorBonus;
    base.regenPerSec = this.regenPerSec;
    base.dropChance = this.dropChance;
    return base;
  }
}


// функция для восстановления карточки из json (нужна для localStorage)
function cardFromJSON(data) {
  if (data.category === 'character') return new CharacterCard(data)
  if (data.category === 'weapon') return new WeaponCard(data)
  if (data.category === 'tome') return new TomeCard(data)
  if (data.category === 'item') return new ItemCard(data)
  console.log('неизвестная категория: ' + data.category);
  return null;
}


// данные всех карточек
// PRESET_VERSION увеличивай когда меняешь данные тут
// тогда localStorage сбросится и подтянутся новые данные
var PRESET_VERSION = 1;

const PRESET_DATA = {
  character: [
    new CharacterCard({ id:'ch-01', name:'Лис', icon:'🦊',
      image: './img/fox.png',
      description:'Быстро бегает и чертовски везучий.',
      unlocked:true,
      maxHp:100, speed:1.04, jumpHeight:8, pickupRadius:9,
      evasion:6, luck:15,
      startWeapon:'Пистолет' }),

    new CharacterCard({ id:'ch-02', name:'Рыцарь', icon:'⚔️',
      image: './img/knight.png',
      description:'Бронированный воин с высоким запасом здоровья.',
      unlocked:true,
      maxHp:150, speed:0.98, jumpHeight:7, pickupRadius:5,
      armor:15,
      startWeapon:'Меч' }),

    new CharacterCard({ id:'ch-03', name:'Скелет', icon:'💀',
      image: './img/calciy.png',
      description:'Нежить. Не боится смерти, обожает кости.',
      unlocked:true,
      maxHp:80, speed:1.10, jumpHeight:10, pickupRadius:5,
      evasion:10,
      startWeapon:'Кость' }),

    new CharacterCard({ id:'ch-04', name:'Мегачад', icon:'😤',
      image: './img/megachad.png',
      description:'У него идеальная и мощная челюсть.',
      unlocked:true,
      maxHp:120, speed:1.05, jumpHeight:9, pickupRadius:6,
      damageBonus:10,
      startWeapon:'Аура' }),

    new CharacterCard({ id:'ch-05', name:'Обезьян', icon:'🐒',
      image: './img/monkey.png',
      description:'Никто не знает откуда у него эти очки, никто и не спрашивает.',
      unlocked:true,
      maxHp:90, speed:1.08, jumpHeight:11, pickupRadius:7,
      extraJumps:1, luck:5,
      startWeapon:'Банан' }),

    new CharacterCard({ id:'ch-06', name:'Ноэль', icon:'❄️',
      image: './img/noel.png',
      description:'В дискорде мегабонка меня вынудили создать этого персонажа.',
      unlocked:true,
      maxHp:85, speed:1.06, jumpHeight:9, pickupRadius:5,
      armor:5, evasion:8,
      startWeapon:'Ледяной Странник' }),

    new CharacterCard({ id:'ch-07', name:'Влад', icon:'🧛',
      image: './img/vlad.png',
      description:'Выглядит злым, но на самом деле отличный парень. Всегда здоровается в магазине.',
      unlocked:true,
      maxHp:95, speed:1.02, jumpHeight:8, pickupRadius:5,
      lifesteal:8, damageBonus:5,
      startWeapon:'Кровавая магия' }),
  ],

  weapon: [
    new WeaponCard({ id:'wp-01', name:'Огненный Странник', icon:'🔥',
      image: './img/fireboot.png',
      description:'Оставляет за собой огненный след.',
      unlocked:true,
      damage:18, fireRate:0.8, projectiles:1, range:'средняя', size:1.5,
      usefulStats:['Длительность', 'Размер', 'Скорость передвижения', 'Урон'] }),

    new WeaponCard({ id:'wp-02', name:'Меч', icon:'🗡️',
      image: './img/sword.png',
      description:'Классический меч. Надёжный и смертоносный.',
      unlocked:true,
      damage:12, fireRate:1.2, projectiles:1, range:'ближняя', size:1.0,
      usefulStats:['Урон', 'Скорость атаки', 'Размер'] }),

    new WeaponCard({ id:'wp-03', name:'Электрический посох', icon:'⚡',
      image: './img/electro_stick.png',
      description:'Вызывает молнию, чтобы поразить ближайших врагов.',
      unlocked:true,
      damage:22, fireRate:0.6, projectiles:1, range:'дальняя', size:1.2,
      usefulStats:['Урон', 'Количество снарядов', 'Размер'] }),

    new WeaponCard({ id:'wp-04', name:'Огненный посох', icon:'🔮',
      image: './img/fire_stick.png',
      description:'Стреляет огненными шарами, которые взрываются при ударе.',
      unlocked:true,
      damage:20, fireRate:0.7, projectiles:1, range:'дальняя', size:1.3,
      usefulStats:['Урон', 'Размер', 'Скорость атаки'] }),

    new WeaponCard({ id:'wp-05', name:'Аура', icon:'✨',
      image: './img/aura.png',
      description:'Наносит урон врагам вокруг.',
      unlocked:true,
      damage:8, fireRate:1.5, projectiles:1, range:'ближняя', size:1.0,
      usefulStats:['Размер', 'Урон', 'Скорость атаки'] }),

    new WeaponCard({ id:'wp-06', name:'Банан', icon:'🍌',
      image: './img/banan.png',
      description:'Бросает бананы, которые возвращаются к владельцу.',
      unlocked:true,
      damage:14, fireRate:0.9, projectiles:1, range:'средняя', size:1.1,
      usefulStats:['Скорость снарядов', 'Количество снарядов', 'Урон'] }),

    new WeaponCard({ id:'wp-07', name:'Лук', icon:'🏹',
      image: './img/bow.png',
      description:'Стреляет стрелами, которые пронзают врагов.',
      unlocked:true,
      damage:20, fireRate:0.7, projectiles:1, range:'дальняя', size:1.0,
      usefulStats:['Урон', 'Количество снарядов', 'Скорость снарядов'] }),

    new WeaponCard({ id:'wp-08', name:'Пистолет', icon:'🔫',
      image: './img/pistol.png',
      description:'Стреляет несколькими пулями по врагам.',
      unlocked:true,
      damage:10, fireRate:1.8, projectiles:3, range:'средняя', size:0.8,
      usefulStats:['Количество снарядов', 'Скорость атаки', 'Урон'] }),

    new WeaponCard({ id:'wp-09', name:'Чанкеры', icon:'🪨',
      image: './img/chankers.png',
      description:'Призывает массивные камни, летающие вокруг тебя.',
      unlocked:true,
      damage:25, fireRate:0.5, projectiles:2, range:'ближняя', size:1.5,
      usefulStats:['Размер', 'Количество снарядов', 'Урон'] }),

    new WeaponCard({ id:'wp-10', name:'Кость', icon:'🦴',
      image: './img/bone.png',
      description:'Бросает кости, которые отскакивают от врагов.',
      unlocked:true,
      damage:15, fireRate:1.0, projectiles:1, range:'средняя', size:1.0,
      usefulStats:['Скорость снарядов', 'Количество снарядов', 'Урон'] }),
  ],

  tome: [
    new TomeCard({ id:'tm-01', name:'Том Ловкости', icon:'📘',
      image: './img/tom_ability.png',
      description:'+Скорость передвижения — Насколько быстро ты двигаешься.',
      unlocked:true,
      speedBonus:15 }),

    new TomeCard({ id:'tm-02', name:'Том Силы', icon:'📕',
      image: './img/tom_damage.png',
      description:'Увеличивает наносимый урон всех видов оружия.',
      unlocked:true,
      damageBonus:20 }),

    new TomeCard({ id:'tm-03', name:'Том Размера', icon:'📗',
      image: './img/tom_size.png',
      description:'+Размер — размер твоих атак, снарядов, взрывов и прочего.',
      unlocked:true,
      areaBonus:25 }),

    new TomeCard({ id:'tm-04', name:'Том Скорости Снарядов', icon:'📓',
      image: './img/tom_speed.png',
      description:'+Скорость снарядов — Скорость твоих снарядов.',
      unlocked:true }),

    new TomeCard({ id:'tm-05', name:'Том Здоровья', icon:'📗',
      image: './img/tom_hp.png',
      description:'+Макс ХП — Макс ХП.',
      unlocked:true }),

    new TomeCard({ id:'tm-06', name:'Том Регенерации', icon:'📓',
      image: './img/tom_regen.png',
      description:'+Реген ХП — Реген ХП увеличивает кол-во ХП которое ты восстанавливаешь в минуту.',
      unlocked:true }),

    new TomeCard({ id:'tm-07', name:'Том Отбрасывания', icon:'📗',
      image: './img/tom_otbras.png',
      description:'+Отдача — расстояние на которое ты отбрасываешь врагов при ударе.',
      unlocked:true }),

    new TomeCard({ id:'tm-08', name:'Том Уворота', icon:'📓',
      image: './img/tom_uvarota.png',
      description:'+Уклонение — Уклонение это шанс избежать атаки и не получить урон.',
      unlocked:true }),

    new TomeCard({ id:'tm-09', name:'Том Перезарядки', icon:'📗',
      image: './img/tom_perezaryadka.png',
      description:'+Скорость атаки — как быстро ты стреляешь и наносишь атаки.',
      unlocked:true }),
  ],

  item: [
    // common
    new ItemCard({ id:'it-01', name:'Бургер', icon:'🍔',
      image: './img/burger.png',
      description:'+2% шанс получить Бургер за убийство врага.',
      rarity:'common', unlocked:true,
      effect:'+2% дроп бургера', dropChance:2 }),

    new ItemCard({ id:'it-02', name:'Заплесневелый Сыр', icon:'🧀',
      image: './img/cheese.png',
      description:'+40% шанс отравить. Обожаю плесень ♥',
      rarity:'common', unlocked:true,
      effect:'+40% шанс отравления', dropChance:5 }),

    new ItemCard({ id:'it-03', name:'Клевер', icon:'🍀',
      image: './img/clever.png',
      description:'Увеличивает Удачу на 10%.',
      rarity:'common', unlocked:true,
      effect:'Удача +10%', dropChance:3 }),

    new ItemCard({ id:'it-04', name:'Часы', icon:'⌚',
      image: './img/watch.png',
      description:'+8% Увеличение опыта. Точно не обычные часы.',
      rarity:'common', unlocked:true,
      effect:'+8% опыта', dropChance:4 }),

    // rare
    new ItemCard({ id:'it-05', name:'Перо', icon:'🪶',
      image: './img/pero.png',
      description:'Прыгай выше и дальше. Получай +1 дополнительный прыжок.',
      rarity:'rare', unlocked:true,
      effect:'+1 доп. прыжок', dropChance:3 }),

    new ItemCard({ id:'it-06', name:'Пиво', icon:'🍺',
      image: './img/beer.png',
      description:'+20% Урон за счёт -5% Макс.ХП.',
      rarity:'rare', unlocked:true,
      effect:'+20% Урона и -5% Макс.ХП', dropChance:3 }),
    new ItemCard({ id:'it-07', name:'Плащ труса', icon:'🍺',
      image: './img/snich_coat.png',
      description:'Увеличивает скорость передвижения при получании урона.Так же получает +5% к скорости передвижения.',
      rarity:'rare', unlocked:true,
      effect:'+5% к скорости передвижения', dropChance:3 }),
    

    new ItemCard({ id:'it-08', name:'Кредитка (Зелёная)', icon:'💳',
      image: './img/green_card.png',
      description:'При открытии сундука удача +2%. Цена сундука +10%.',
      rarity:'epic', unlocked:true,
      effect:'+2% удача за сундук', dropChance:2 }),

    new ItemCard({ id:'it-09', name:'Кольцо мускулов', icon:'💍',
      image: './img/muscls_ring.png',
      description:'Увеличивает Урон на +20% за каждые 100 Макс.ХП.',
      rarity:'epic', unlocked:true,
      effect:'+20% урона за 100 Макс.ХП', dropChance:2 }),

    // legendary
    new ItemCard({ id:'it-10', name:'Большой БОНК', icon:'🔨',
      image: './img/big_BONK.png',
      description:'2% шанс БОНКнуть врага, нанеся 20x урон.',
      rarity:'legendary', unlocked:true,
      effect:'2% шанс x20 урона', dropChance:1 }),

    new ItemCard({ id:'it-11', name:'Острая Фрикаделька', icon:'🍖',
      image: './img/fricadel.png',
      description:'Атаки имеют 25% шанс взорваться и нанести 65% урон ближайшим врагам.',
      rarity:'legendary', unlocked:true,
      effect:'25% шанс взрыва', dropChance:2 }),

    new ItemCard({ id:'it-12', name:'Ледяной Куб', icon:'🧊',
      image: './img/ice_cube.png',
      description:'20% шанс нанести ледяной урон при атаке. Может заморозить врагов.',
      rarity:'legendary', unlocked:true,
      effect:'20% шанс заморозки', dropChance:1 }),
  ],
};