const BASE = 'https://jsonplaceholder.typicode.com';

// ── fetchJSON: обёртка над fetch с проверкой response.ok
// Лекция: fetch() не выбрасывает ошибку при статусах 4xx/5xx —
// нужно проверять res.ok самостоятельно
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  if (options.method === 'DELETE') return null; // DELETE возвращает пустое тело
  return res.json(); // response.json() — декодирует ответ из JSON
}


const RU_THREADS = [
  { title: 'Как справляться с выгоранием? Делитесь опытом', body: 'Последние пару месяцев совсем нет сил даже на любимые дела. Встаю с постели через силу, работа валится из рук. Пробовал брать выходные — не помогает. Кто через это проходил? Что реально помогло вернуться в норму? Интересует всё: спорт, режим, психолог, медитации — любой опыт приветствуется.', tag: 'discuss', tagLabel: 'Обсуждение', votes: 47 },
  { title: 'Стартап без денег: обмен навыками вместо оплаты', body: 'Придумал платформу где люди меняются умениями напрямую. Ты учишь кого-то гитаре — тебя учат английскому. Никаких денег, только бартер времени и знаний. Есть похожие проекты, но они либо мёртвые, либо неудобные. Думаю запустить MVP через месяц. Кто хотел бы попробовать?', tag: 'idea', tagLabel: 'Идея', votes: 31 },
  { title: 'Переехал в новый город — как знакомиться в 27?', body: 'Переехал из Екатеринбурга в Москву три месяца назад. На работе все закрытые, в подъезде никто не здоровается. Чувствую себя невидимкой. Пробовал спортзал и секцию по боксу — там все в своих компаниях. Как вы знакомитесь с людьми когда вам уже не 18?', tag: 'help', tagLabel: 'Помощь', votes: 89 },
  { title: 'Что читаете сейчас? Рекомендации сообщества', body: 'Закончил «Атлант расправил плечи» и не знаю что взять следующим. Нравятся книги где есть и сюжет, и что-то для головы — философия, психология, экономика. Из последнего понравились Талеб, Канеман, Сапольски. Что посоветуете?', tag: 'discuss', tagLabel: 'Обсуждение', votes: 22 },
  { title: 'Нейросети убьют профессию дизайнера — или нет?', body: 'Работаю UX-дизайнером пять лет. Вижу как Midjourney и Figma AI быстро закрывают задачи которые раньше занимали дни. Джуны уже не нужны вообще? Или это просто новый инструмент и паниковать не стоит? Хочу услышать мнения и дизайнеров, и всех остальных.', tag: 'news', tagLabel: 'Дискуссия', votes: 118 },
  { title: 'Три года веду бюджет — честный итог', body: 'В 2021 году залез в минус на 80 тысяч и решил начать считать деньги. Три года таблиц, категорий, отчётов. Расскажу честно — что реально дало результат, а что оказалось бесполезной бюрократией для самого себя. Спойлер: приложения не спасают, важно другое.', tag: 'idea', tagLabel: 'Опыт', votes: 64 },
  { title: 'Четыре года на удалёнке — плюсы и минусы', body: 'Перешёл на удалёнку ещё до всяких пандемий. Продуктивность выросла, но социальные навыки немного просели. Сейчас думаю вернуться в офис хотя бы на пару дней в неделю. Кто работает удалённо — как решаете проблему изоляции?', tag: 'discuss', tagLabel: 'Обсуждение', votes: 55 },
  { title: '10 телеграм-каналов которые реально полезны', body: 'Чищу подписки раз в квартал и оставляю только то что действительно читаю. Составил список из 10 каналов по темам: деньги, психология, технологии, карьера. Без рекламы — только личная рекомендация после полугода чтения каждого.', tag: 'news', tagLabel: 'Подборка', votes: 73 },
  { title: 'Учу испанский с нуля в 35 — реально ли?', body: 'Всегда думал что иностранные языки — это для молодых. В 35 решил доказать себе обратное. Три месяца Duolingo, потом репетитор раз в неделю. Делюсь прогрессом и методами которые работают для взрослых. Спойлер: разговорная практика с первой недели — обязательно.', tag: 'idea', tagLabel: 'Опыт', votes: 38 },
  { title: 'Как объяснить родителям что такое IT?', body: 'Мама до сих пор думает что я "сижу в компьютере" и "пора найти нормальную работу". Каждый звонок домой — допрос. Как вы объясняете своей семье чем занимаетесь? Нужны рабочие скрипты для разговора.', tag: 'help', tagLabel: 'Помощь', votes: 92 },
  { title: 'Ремонт своими руками — итог за год', body: 'Год назад купил убитую однушку и решил сделать всё сам. Ни опыта, ни инструментов — только ютуб и упрямство. Потратил примерно 180 тысяч вместо 600 у бригады. Расскажу что реально можно сделать самому, а где лучше звать профи.', tag: 'discuss', tagLabel: 'История', votes: 141 },
  { title: 'Инвестирую с 2020 года — честный отчёт', body: 'Начал инвестировать в акции в начале пандемии. Прошёл через рост, падение, блокировки иностранных активов. Сейчас портфель в плюсе, но путь был непростой. Расскажу об ошибках и о стратегии которая работает для обычного человека.', tag: 'news', tagLabel: 'Финансы', votes: 87 },
];

const RU_NAMES = [
  'Артём Морозов',  // userId=1
  'Анна Соколова',  // userId=2
  'Дмитрий Кузнецов', // userId=3
  'Елена Новикова', // userId=4
  'Максим Волков',  // userId=5  
  'Мария Лебедева', // userId=6
  'Иван Петров',    // userId=7
  'Ольга Козлова',  // userId=8
  'Никита Смирнов', // userId=9
  'Татьяна Фёдорова' // userId=10
];

const RU_ROLES = [
  'Frontend-разработчик', 'Дизайнер интерфейсов', 'Предприниматель',
  'Продуктовый менеджер', 'Data scientist', 'Копирайтер',
  'Бэкенд-разработчик', 'Маркетолог', 'DevOps-инженер', 'UX-исследователь'
];

const RU_CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Казань',
  'Екатеринбург', 'Воронеж', 'Нижний Новгород', 'Ростов-на-Дону', 'Краснодар', 'Самара'
];

const RU_TODOS = [
  'Дочитать книгу по управлению временем',
  'Написать пост про удалённую работу',
  'Записаться на курс по Python',
  'Разобраться с пенсионными накоплениями',
  'Сделать портфолио на GitHub',
  'Поговорить с руководителем о повышении',
  'Настроить автоплатежи по коммуналке',
  'Купить курс по английскому произношению',
  'Изучить основы инвестирования',
  'Пройти чекап у стоматолога',
  'Обновить резюме на hh.ru',
  'Закончить сайд-проект до конца месяца',
  'Почитать документацию по новому фреймворку',
  'Записаться на йогу',
  'Разобрать завалы в почте',
];

const TIME_AGO = ['2 мин назад','7 мин назад','15 мин назад','32 мин назад',
  '1 час назад','2 часа назад','4 часа назад','вчера','2 дня назад','3 дня назад'];


function setStatus(id, type, msg) {
  const el = document.getElementById(id);
  if (!msg) { el.innerHTML = ''; return; }
  const icon = type === 'loading' ? '<div class="spinner"></div>'
             : type === 'success' ? '✓' : '✕';
  el.innerHTML = `<div class="status-toast ${type}">${icon} ${msg}</div>`;
}

function skeletonThreads(n) {
  return Array.from({ length: n }, () => `
    <div class="sk-thread">
      <div class="sk-votes">
        <div class="skeleton sk-v1"></div>
        <div class="skeleton sk-v2"></div>
      </div>
      <div class="sk-body">
        <div class="skeleton sk-line sk-short"></div>
        <div class="skeleton sk-line sk-title-line"></div>
        <div class="skeleton sk-line sk-medium"></div>
        <div class="skeleton sk-line sk-short"></div>
      </div>
    </div>`).join('');
}

function stats(id, items) {
  document.getElementById(id).innerHTML = items.map(s =>
    `<div class="stat-pill"><span class="si">${s.icon}</span><strong>${s.value}</strong> ${s.label}</div>`
  ).join('');
}

function escQ(s) { return (s || '').replace(/'/g,"&#39;").replace(/\n/g,' '); }


document.getElementById('main-nav').addEventListener('click', e => {
  const btn = e.target.closest('[data-section]');
  if (!btn) return;
  document.querySelectorAll('#main-nav [data-section]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  const sec = btn.dataset.section;
  document.getElementById(sec).classList.add('active');
  if (sec === 'threads' && !allThreads.length) loadThreads();
  if (sec === 'news'    && !allThreads.length) loadThreads();
  if (sec === 'profile' && !myProfile)         loadProfile();
});

let allThreads = [];
let threadPage = 1;
const PER_PAGE = 8;
const threadViews    = {};
const threadComments = {};
let isLoadingThreads = false;

async function loadThreads() {
  if (isLoadingThreads) return;
  isLoadingThreads = true;
  // Блокируем кнопку публикации на время загрузки
  const publishBtn = document.querySelector('.btn-lime[onclick="createThread()"]');
  if (publishBtn) { publishBtn.disabled = true; publishBtn.textContent = '⏳ Загрузка…'; }
  document.getElementById('threads-list').innerHTML = skeletonThreads(5);
  setStatus('threads-status', 'loading', 'Загружаем обсуждения… GET /posts');
  try {
    const raw = await fetchJSON(`${BASE}/posts`);
    allThreads = raw.map((p, i) => {
      const tpl = RU_THREADS[i % RU_THREADS.length];
      threadViews[p.id]    = 0;
      threadComments[p.id] = 0;
      return {
        ...p,
        title:    tpl.title,
        body:     tpl.body,
        tag:      tpl.tag,
        tagLabel: tpl.tagLabel,
        votes:    tpl.votes + Math.floor(i / RU_THREADS.length) * 3,
        author:   RU_NAMES[(p.id * 7 + p.id % 3) % RU_NAMES.length],
      };
    });
    threadPage = 1;
    renderThreads();
    refreshThreadStats();
    renderNews();
    setStatus('threads-status', '', '');
  } catch (e) {
    setStatus('threads-status', 'error', 'Не удалось загрузить. Проверьте соединение.');
    document.getElementById('threads-list').innerHTML = `<div class="empty-state"><span class="empty-icon">⚡</span><div class="empty-title">Сервер не отвечает</div><div class="empty-sub">Попробуйте обновить страницу</div></div>`;
  } finally {
    isLoadingThreads = false;
    const publishBtn = document.querySelector('.btn-lime[onclick="createThread()"]');
    if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = '⚡ Опубликовать'; }
  }
}

function refreshThreadStats() {
  stats('threads-stats', [
    { icon: '💬', value: allThreads.length, label: 'обсуждений' },
    { icon: '👥', value: [...new Set(allThreads.map(t => t.userId))].length, label: 'авторов' },
    { icon: '🔥', value: allThreads.reduce((s, t) => s + t.votes, 0), label: 'голосов' },
  ]);
}

function renderThreads() {
  const filter = document.getElementById('threads-filter').value;
  let list = filter === 'all' ? allThreads : allThreads.filter(t => t.tag === filter);
  const total      = list.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const slice      = list.slice((threadPage - 1) * PER_PAGE, threadPage * PER_PAGE);

  document.getElementById('threads-count').textContent = `${total} тредов`;

  const el = document.getElementById('threads-list');
  if (!slice.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><div class="empty-title">Ничего не нашлось</div><div class="empty-sub">Попробуйте другой фильтр</div></div>`;
  } else {
    el.innerHTML = slice.map(t => `
      <div class="thread-card" id="t-${t.id}">
        <div class="thread-votes">
          <button class="vote-btn" onclick="vote(${t.id},1);event.stopPropagation()">▲</button>
          <div class="vote-count">${t.votes}</div>
          <button class="vote-btn" onclick="vote(${t.id},-1);event.stopPropagation()">▼</button>
        </div>
        <div class="thread-body thread-clickable" onclick="openThread(${t.id})">
          <div class="thread-meta">
            <span class="thread-author">${t.author || 'Аноним'}</span>
            <span class="thread-time">${t.timeLabel || TIME_AGO[t.id % TIME_AGO.length]}</span>
            <span class="thread-tag tag-${t.tag}">${t.tagLabel}</span>
          </div>
          <div class="thread-title">${t.title}</div>
          <div class="thread-preview">${t.body}</div>
          <div class="thread-footer">
            <span class="thread-stat">💬 ${threadComments[t.id] || 0} комментариев</span>
            <span class="thread-stat">👁 ${threadViews[t.id] || 0} просмотров</span>
          </div>
        </div>
        <div class="thread-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditThread(${t.id},'${escQ(t.title)}','${escQ(t.body)}');event.stopPropagation()">✏️ Изменить</button>
          <button class="btn btn-danger btn-sm" onclick="deleteThread(${t.id});event.stopPropagation()">Удалить</button>
        </div>
      </div>`).join('');
  }

  // Пагинация
  const pag = document.getElementById('threads-pagination');
  if (totalPages <= 1) { pag.innerHTML = ''; return; }
  let html = '';
  if (threadPage > 1) html += `<button class="pager-btn" onclick="goPage(${threadPage-1})">←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - threadPage) <= 1)
      html += `<button class="pager-btn ${i===threadPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    else if (Math.abs(i - threadPage) === 2)
      html += `<span style="color:var(--text3);padding:0 4px;line-height:38px;font-size:13px">…</span>`;
  }
  if (threadPage < totalPages) html += `<button class="pager-btn" onclick="goPage(${threadPage+1})">→</button>`;
  pag.innerHTML = html;
}

function goPage(n) { threadPage = n; renderThreads(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function vote(id, delta) {
  const t = allThreads.find(t => t.id === id);
  if (t) { t.votes += delta; renderThreads(); refreshThreadStats(); renderNews(); }
}

async function createThread() {
  if (isLoadingThreads) { setStatus('threads-status', 'error', 'Подождите окончания загрузки'); return; }
  const title = document.getElementById('new-title').value.trim();
  const body  = document.getElementById('new-body').value.trim();
  const tag   = document.getElementById('new-tag').value;
  const tagLabels = { discuss: 'Обсуждение', idea: 'Идея', help: 'Помощь', news: 'Новость' };
  if (!title || !body) { setStatus('threads-status', 'error', 'Заполните заголовок и текст'); return; }
  setStatus('threads-status', 'loading', 'Публикуем тред… POST /posts');
  try {
    const data = await fetchJSON(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId: Math.ceil(Math.random() * 10) }),
    });
    const newId = Date.now();
    threadViews[newId]    = 0;
    threadComments[newId] = 0;
    const authorName = myProfile ? myProfile.name : 'Вы';
    allThreads.unshift({ ...data, id: newId, title, body, tag, tagLabel: tagLabels[tag], votes: 0, author: authorName, timeLabel: 'только что' });
    // Добавляем в myThreads чтобы тред появился в профиле
    myThreads.unshift({ id: newId, title, body, tag, tagLabel: tagLabels[tag], votes: 0, timeLabel: 'только что' });
    document.getElementById('new-title').value = '';
    document.getElementById('new-body').value  = '';
    threadPage = 1; newsPage = 1;
    renderThreads();
    refreshThreadStats(); renderNews();
    setStatus('threads-status', 'success', 'Тред опубликован! 🎉');
    setTimeout(() => setStatus('threads-status', '', ''), 3000);
  } catch (e) { setStatus('threads-status', 'error', 'Ошибка: ' + e.message); }
}

function openEditThread(id, title, body) {
  document.getElementById('edit-id').value    = id;
  document.getElementById('edit-title').value = title;
  document.getElementById('edit-body').value  = body;
  document.getElementById('edit-modal').classList.remove('hidden');
}
function closeEditModal(e) {
  if (!e || e.target.classList.contains('modal-overlay'))
    document.getElementById('edit-modal').classList.add('hidden');
}
async function saveEditThread() {
  const id    = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const body  = document.getElementById('edit-body').value.trim();
  if (!title || !body) return;
  document.getElementById('edit-modal').classList.add('hidden');
  setStatus('threads-status', 'loading', `Обновляем тред… PUT /posts/${id}`);
  try {
    await fetchJSON(`${BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, body, userId: 1 }),
    });
    const t = allThreads.find(t => t.id == id);
    if (t) { t.title = title; t.body = body; }
    renderThreads();
    setStatus('threads-status', 'success', 'Тред обновлён ✓');
    setTimeout(() => setStatus('threads-status', '', ''), 3000);
  } catch (e) { setStatus('threads-status', 'error', 'Ошибка: ' + e.message); }
}

async function deleteThread(id) {
  setStatus('threads-status', 'loading', `Удаляем тред… DELETE /posts/${id}`);
  try {
    await fetchJSON(`${BASE}/posts/${id}`, { method: 'DELETE' });
    allThreads = allThreads.filter(t => t.id !== id);
    renderThreads();
    refreshThreadStats();
    setStatus('threads-status', 'success', 'Тред удалён');
    setTimeout(() => setStatus('threads-status', '', ''), 2500);
  } catch (e) { setStatus('threads-status', 'error', 'Ошибка: ' + e.message); }
}

let allMembers = [];

async function loadMembers() {
  document.getElementById('members-grid').innerHTML = Array.from({ length: 6 }, () => `
    <div class="member-card">
      <div class="skeleton" style="width:52px;height:52px;border-radius:14px;flex-shrink:0"></div>
      <div style="flex:1">
        <div class="skeleton" style="height:14px;width:60%;margin-bottom:8px"></div>
        <div class="skeleton" style="height:11px;width:80%;margin-bottom:10px"></div>
        <div class="skeleton" style="height:22px;width:40%"></div>
      </div>
    </div>`).join('');
  setStatus('members-status', 'loading', 'Загружаем участников… GET /users');
  try {
    const raw = await fetchJSON(`${BASE}/users`);
    allMembers = raw.map((u, i) => ({
      ...u,
      name:  RU_NAMES[i]  || u.name,
      role:  RU_ROLES[i]  || u.company.name,
      city:  RU_CITIES[i] || u.address.city,
      posts: Math.floor(Math.random() * 80) + 5,
    }));
    renderMembers();
    stats('members-stats', [
      { icon: '👥', value: allMembers.length, label: 'участников' },
      { icon: '🏙️', value: [...new Set(allMembers.map(m => m.city))].length, label: 'городов' },
    ]);
    setStatus('members-status', '', '');
  } catch (e) {
    setStatus('members-status', 'error', 'Ошибка загрузки');
  }
}

function renderMembers() {
  document.getElementById('members-grid').innerHTML = allMembers.map((m, i) => `
    <div class="member-card" id="m-${m.id}">
      <div class="avatar av-${i % 10}">${m.name[0]}</div>
      <div class="member-info">
        <div class="member-name">${m.name}</div>
        <div class="member-handle">${m.role} · ${m.city}</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <span class="member-badge">💬 ${m.posts} постов</span>
          <span style="font-size:11px;color:var(--text3)">📧 ${m.email}</span>
        </div>
        <div class="member-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditMember(${m.id})">✏️ Изменить профиль</button>
        </div>
      </div>
    </div>`).join('');
}

// PATCH /users/:id
function openEditMember(id) {
  const m = allMembers.find(m => m.id === id);
  if (!m) return;
  document.getElementById('edit-member-id').value    = id;
  document.getElementById('edit-member-name').value  = m.name;
  document.getElementById('edit-member-email').value = m.email;
  document.getElementById('edit-member-role').value  = m.role;
  document.getElementById('edit-member-city').value  = m.city;
  document.getElementById('edit-member-modal').classList.remove('hidden');
}
function closeEditMemberModal(e) {
  if (!e || e.target.classList.contains('modal-overlay'))
    document.getElementById('edit-member-modal').classList.add('hidden');
}
async function saveEditMember() {
  const id    = document.getElementById('edit-member-id').value;
  const name  = document.getElementById('edit-member-name').value.trim();
  const email = document.getElementById('edit-member-email').value.trim();
  const role  = document.getElementById('edit-member-role').value.trim();
  const city  = document.getElementById('edit-member-city').value.trim();
  document.getElementById('edit-member-modal').classList.add('hidden');
  setStatus('members-status', 'loading', `Обновляем профиль… PATCH /users/${id}`);
  try {
    await fetchJSON(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const m = allMembers.find(m => m.id == id);
    if (m) { m.name = name; m.email = email; m.role = role; m.city = city; }
    renderMembers();
    setStatus('members-status', 'success', 'Профиль обновлён ✓');
    setTimeout(() => setStatus('members-status', '', ''), 3000);
  } catch (e) { setStatus('members-status', 'error', 'Ошибка: ' + e.message); }
}

let newsPage = 1;
const NEWS_PER_PAGE = 8;

function renderNews() {
  const listEl = document.getElementById('news-list');
  const pagEl  = document.getElementById('news-pagination');
  if (!listEl) return;

  // Если треды ещё не загружены — показываем скелетон и ждём
  if (!allThreads.length) {
    listEl.innerHTML = skeletonThreads(4);
    setStatus('news-status', 'loading', 'Загружаем новости…');
    return;
  }

  setStatus('news-status', '', '');

  const newsList   = allThreads.filter(t => t.tag === 'news');
  const total      = newsList.length;
  const totalPages = Math.ceil(total / NEWS_PER_PAGE);
  const slice      = newsList.slice((newsPage - 1) * NEWS_PER_PAGE, newsPage * NEWS_PER_PAGE);

  // Статистика
  stats('news-stats', [
    { icon: '📰', value: total, label: 'новостей' },
    { icon: '🔥', value: newsList.length ? Math.max(...newsList.map(t => t.votes)) : 0, label: 'макс. голосов' },
    { icon: '💬', value: newsList.reduce((s,t) => s + (threadComments[t.id] || 0), 0), label: 'комментариев' },
  ]);

  if (!slice.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><div class="empty-title">Новостей пока нет</div><div class="empty-sub">Публикуй треды с тегом «Новость»</div></div>`;
    if (pagEl) pagEl.innerHTML = '';
    return;
  }

  listEl.innerHTML = slice.map(t => `
    <div class="thread-card tag-${t.tag}" id="nt-${t.id}">
      <div class="thread-votes">
        <button class="vote-btn" onclick="vote(${t.id},1);event.stopPropagation()">▲</button>
        <div class="vote-count">${t.votes}</div>
        <button class="vote-btn" onclick="vote(${t.id},-1);event.stopPropagation()">▼</button>
      </div>
      <div class="thread-body thread-clickable" onclick="openThread(${t.id})">
        <div class="thread-meta">
          <span class="thread-author">${t.author || 'Аноним'}</span>
          <span class="thread-time">${t.timeLabel || TIME_AGO[t.id % TIME_AGO.length]}</span>
          <span class="thread-tag tag-news">Новость</span>
        </div>
        <div class="thread-title">${t.title}</div>
        <div class="thread-preview">${t.body}</div>
        <div class="thread-footer">
          <span class="thread-stat">💬 ${threadComments[t.id] || 0} комментариев</span>
          <span class="thread-stat">👁 ${threadViews[t.id] || 0} просмотров</span>
        </div>
      </div>
    </div>`).join('');

  if (!pagEl) return;
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let html = '';
  if (newsPage > 1) html += `<button class="pager-btn" onclick="goNewsPage(${newsPage-1})">←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - newsPage) <= 1)
      html += `<button class="pager-btn ${i===newsPage?'active':''}" onclick="goNewsPage(${i})">${i}</button>`;
    else if (Math.abs(i - newsPage) === 2)
      html += `<span style="color:var(--muted2);padding:0 4px;line-height:38px;font-size:13px">…</span>`;
  }
  if (newsPage < totalPages) html += `<button class="pager-btn" onclick="goNewsPage(${newsPage+1})">→</button>`;
  pagEl.innerHTML = html;
}

function goNewsPage(n) {
  newsPage = n;
  renderNews();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const MY_USER_ID = 1;
let myProfile = null;
let myThreads = [];

async function loadProfile() {
  setStatus('profile-status', 'loading', 'Загружаем профиль… GET /users/1');
  document.getElementById('profile-card').innerHTML = `
    <div class="profile-loading">
      <div class="skeleton" style="width:80px;height:80px;border-radius:20px;margin-bottom:16px"></div>
      <div class="skeleton" style="width:160px;height:18px;border-radius:6px;margin-bottom:10px"></div>
      <div class="skeleton" style="width:220px;height:13px;border-radius:6px"></div>
    </div>`;
  try {
    const rawUser = await fetchJSON(`${BASE}/users/${MY_USER_ID}`);

    myProfile = { ...rawUser, name: RU_NAMES[0], role: RU_ROLES[0], city: RU_CITIES[0] };
    // myThreads = треды созданные пользователем через форму (уже есть в массиве)
    // + подгружаем из allThreads те что принадлежат userId=1 если пользователь ещё не создавал своих
    if (!myThreads.length && allThreads.length) {
      myThreads = allThreads.filter(t => t.userId === MY_USER_ID);
    }
    renderProfile();
    setStatus('profile-status', '', '');
  } catch (e) {
    setStatus('profile-status', 'error', 'Не удалось загрузить: ' + e.message);
  }
}

function renderProfile() {
  if (!myProfile) return;
  const initials = myProfile.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  document.getElementById('profile-card').innerHTML = `
    <div class="profile-main">
      <div class="profile-ava av-0">${initials}</div>
      <div class="profile-info">
        <div class="profile-name">${myProfile.name}</div>
        <div class="profile-role">${myProfile.role} · ${myProfile.city}</div>
        <div class="profile-email">📧 ${myProfile.email}</div>
        <div class="profile-joined">На форуме с марта 2023</div>
      </div>
      <button class="btn btn-lime profile-edit-btn" onclick="openProfileEdit()">✏️ Редактировать</button>
    </div>`;

  stats('profile-stats', [
    { icon: '💬', value: myThreads.length, label: 'тредов' },
    { icon: '🔥', value: myThreads.reduce((s,t) => s + t.votes, 0), label: 'голосов' },
    { icon: '🏙️', value: myProfile.city, label: '' },
  ]);

  const threadsHeader = document.querySelector('.profile-threads-header');
  const threadsCount  = document.getElementById('profile-threads-count');
  const threadsList   = document.getElementById('profile-threads');
  if (threadsHeader) threadsHeader.style.display = '';
  if (threadsList)   threadsList.style.display   = '';
  if (threadsCount)  threadsCount.textContent     = `${myThreads.length} тредов`;

  if (!myThreads.length) {
    threadsList.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><div class="empty-title">Тредов пока нет</div><div class="empty-sub">Напишите первый!</div></div>`;
    return;
  }
  threadsList.innerHTML = myThreads.map(t => `
    <div class="thread-card tag-${t.tag}">
      <div class="thread-votes">
        <div class="vote-count">${t.votes}</div>
      </div>
      <div class="thread-body thread-clickable" onclick="openThread(${t.id})">
        <div class="thread-meta">
          <span class="thread-tag tag-${t.tag}">${t.tagLabel}</span>
          <span class="thread-time">${t.timeLabel || TIME_AGO[t.id % TIME_AGO.length]}</span>
        </div>
        <div class="thread-title">${t.title}</div>
        <div class="thread-preview">${t.body}</div>
        <div class="thread-footer">
          <span class="thread-stat">💬 ${threadComments[t.id] || 0} комментариев</span>
          <span class="thread-stat">👁 ${threadViews[t.id] || 0} просмотров</span>
        </div>
      </div>
    </div>`).join('');
}

function openProfileEdit() {
  if (!myProfile) return;
  document.getElementById('edit-member-id').value    = myProfile.id;
  document.getElementById('edit-member-name').value  = myProfile.name;
  document.getElementById('edit-member-email').value = myProfile.email;
  document.getElementById('edit-member-role').value  = myProfile.role;
  document.getElementById('edit-member-city').value  = myProfile.city;
  document.getElementById('edit-member-modal').classList.remove('hidden');
}

let isSavingMember = false;

const _origSave = saveEditMember;
saveEditMember = async function() {
  if (isSavingMember) return;
  isSavingMember = true;

  // Блокируем кнопку сохранения
  const saveBtn = document.querySelector('#edit-member-modal .btn-violet');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Сохраняем…'; }

  const id    = document.getElementById('edit-member-id').value;
  const name  = document.getElementById('edit-member-name').value.trim();
  const email = document.getElementById('edit-member-email').value.trim();
  const role  = document.getElementById('edit-member-role').value.trim();
  const city  = document.getElementById('edit-member-city').value.trim();
  document.getElementById('edit-member-modal').classList.add('hidden');

  const isMe = myProfile && String(myProfile.id) === String(id);
  const sid  = isMe ? 'profile-status' : 'members-status';

  setStatus(sid, 'loading', `Сохраняем… PATCH /users/${id}`);
  try {
    await fetchJSON(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const m = allMembers.find(m => m.id == id);
    if (m) { m.name = name; m.email = email; m.role = role; m.city = city; }
    if (allMembers.length) renderMembers();
    if (isMe) {
      myProfile.name = name; myProfile.email = email;
      myProfile.role = role; myProfile.city  = city;
      renderProfile();
    }
    setStatus(sid, 'success', 'Сохранено ✓');
    setTimeout(() => setStatus(sid, '', ''), 3000);
  } catch (e) { setStatus(sid, 'error', 'Ошибка: ' + e.message); }
  finally {
    isSavingMember = false;
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Сохранить'; }
  }
};

loadThreads();

const RU_COMMENTS = [
  'Полностью согласен, сам через такое проходил. Главное не останавливаться.',
  'Интересная точка зрения, но я бы поспорил насчёт последнего пункта.',
  'Спасибо что поделился! Как раз искал что-то похожее.',
  'А можешь рассказать подробнее про второй способ?',
  'Было бы здорово если бы ты написал продолжение.',
  'Сохранил себе, очень полезно. Давно так не думал об этом.',
  'Пробовал — работает. Рекомендую всем кто ещё сомневается.',
  'Хм, у меня был другой опыт. Расскажу в отдельном треде.',
  'Огонь! Именно это мне и было нужно прямо сейчас.',
  'Слушай, а ты не думал написать об этом поподробнее?',
  'Классная идея, но как с этим обстоит дело на практике?',
  'Подписался на тебя, жду новых постов по этой теме!',
];

const RU_COMMENT_NAMES = [
  'Игорь Сидоров', 'Таня Лебедева', 'Паша Кузнецов', 'Оля Попова',
  'Серёжа Захаров', 'Юля Воронова', 'Коля Малинин', 'Женя Тихонова',
];

function openThread(id) {
  const t = allThreads.find(t => t.id === id) || myThreads.find(t => t.id === id);
  if (!t) return;

  document.getElementById('tp-tag').className   = `tp-tag thread-tag tag-${t.tag}`;
  document.getElementById('tp-tag').textContent = t.tagLabel;
  document.getElementById('tp-title').textContent  = t.title;
  document.getElementById('tp-author').textContent = t.author || RU_NAMES[(t.userId - 1) % 10] || 'Аноним';
  document.getElementById('tp-time').textContent   = t.timeLabel || TIME_AGO[t.id % TIME_AGO.length];
  document.getElementById('tp-body').textContent   = t.body;
  document.getElementById('tp-votes').textContent  = t.votes;
  document.getElementById('tp-post-id').value      = t.id;
  document.getElementById('tp-comment-input').value = '';

  // +1 просмотр
  threadViews[t.id] = (threadViews[t.id] || 0) + 1;
  renderThreads();
  renderNews();

  document.getElementById('thread-panel').classList.add('open');
  document.getElementById('tp-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  loadComments(t.id);
}

function closeThread() {
  document.getElementById('thread-panel').classList.remove('open');
  document.getElementById('tp-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('tp-overlay').addEventListener('click', closeThread);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeThread(); });
document.querySelectorAll('#main-nav [data-section]').forEach(btn => {btn.addEventListener('click', () => {closeThread();});});

async function loadComments(postId) {
  const list = document.getElementById('tp-comments-list');
  list.innerHTML = [1,2,3].map(() => `
    <div class="tp-comment-sk">
      <div class="skeleton" style="height:12px;width:40%;margin-bottom:8px;border-radius:4px"></div>
      <div class="skeleton" style="height:10px;width:75%;border-radius:4px"></div>
    </div>`).join('');
  try {
    const data = await fetchJSON(`${BASE}/posts/${postId}/comments`);
    if (!data.length) {
      list.innerHTML = `<div class="tp-no-comments">Комментариев пока нет — будь первым 👇</div>`;
      return;
    }
    list.innerHTML = data.map((c, i) => `
      <div class="tp-comment" id="c-${c.id}">
        <div class="tp-comment-head">
          <div class="tp-comment-ava av-${i % 10}">${RU_COMMENT_NAMES[i % RU_COMMENT_NAMES.length][0]}</div>
          <div>
            <div class="tp-comment-name">${RU_COMMENT_NAMES[i % RU_COMMENT_NAMES.length]}</div>
            <div class="tp-comment-time">${TIME_AGO[(c.id + 3) % 10]}</div>
          </div>
        </div>
        <div class="tp-comment-text">${RU_COMMENTS[i % RU_COMMENTS.length]}</div>
      </div>`).join('');
  } catch (e) {
    list.innerHTML = `<div class="tp-no-comments" style="color:var(--red)">Не удалось загрузить комментарии</div>`;
  }
}

async function postComment() {
  const postId = document.getElementById('tp-post-id').value;
  const text   = document.getElementById('tp-comment-input').value.trim();
  if (!text) return;
  const btn = document.getElementById('tp-send-btn');
  btn.disabled = true; btn.textContent = 'Отправляем…';
  try {
    await fetchJSON(`${BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: Number(postId), name: 'Вы', email: 'me@tolpa.ru', body: text }),
    });
    const list = document.getElementById('tp-comments-list');
    const noMsg = list.querySelector('.tp-no-comments');
    // +1 комментарий
    const postIdNum = Number(postId);
    threadComments[postIdNum] = (threadComments[postIdNum] || 0) + 1;
    renderThreads();
    renderNews();
    if (myThreads.find(t => t.id === postIdNum)) renderProfile();
    if (noMsg) noMsg.remove();
    const div = document.createElement('div');
    div.className = 'tp-comment tp-comment-new';
    div.innerHTML = `
      <div class="tp-comment-head">
        <div class="tp-comment-ava av-0">В</div>
        <div>
          <div class="tp-comment-name">Вы</div>
          <div class="tp-comment-time">только что</div>
        </div>
      </div>
      <div class="tp-comment-text">${text}</div>`;
    list.prepend(div);
    document.getElementById('tp-comment-input').value = '';
  } catch (e) {
    document.getElementById('tp-comment-input').placeholder = 'Ошибка, попробуй ещё раз';
  } finally {
    btn.disabled = false; btn.textContent = 'Отправить';
  }
}