import { create } from 'zustand';
import type {
  Thread, UserProfile, Comment,
  StatusState, ThreadTag,
} from '../types';
import { api } from '../utils/api';
import { mapPost, mapUser, mapComment } from '../utils/mappers';
import { MY_USER_ID, TAG_LABELS } from '../utils/constants';

// ── Threads slice ─────────────────────────────────────────────────────────────

interface ThreadsSlice {
  threads: Thread[];
  threadsStatus: StatusState;
  isLoadingThreads: boolean;
  isCreatingThread: boolean;
  threadPage: number;
  threadFilter: ThreadTag | 'all';

  loadThreads: () => Promise<void>;
  createThread: (title: string, body: string, tag: ThreadTag) => Promise<void>;
  updateThread: (id: number, title: string, body: string) => Promise<void>;
  deleteThread: (id: number) => Promise<void>;
  voteThread: (id: number, delta: number) => void;
  incrementViews: (id: number) => void;
  incrementComments: (id: number) => void;
  setThreadPage: (page: number) => void;
  setThreadFilter: (filter: ThreadTag | 'all') => void;
  setThreadsStatus: (status: StatusState) => void;
}

// ── Profile slice ─────────────────────────────────────────────────────────────

interface ProfileSlice {
  profile: UserProfile | null;
  profileStatus: StatusState;
  isSavingProfile: boolean;
  myThreads: Thread[];

  loadProfile: () => Promise<void>;
  saveProfile: (data: Omit<UserProfile, 'id'>) => Promise<void>;
  setProfileStatus: (status: StatusState) => void;
}

// ── Thread panel slice ────────────────────────────────────────────────────────

interface ThreadPanelSlice {
  panelOpen: boolean;
  panelThreadId: number | null;
  panelComments: Comment[];
  panelCommentsStatus: StatusState;
  isSendingComment: boolean;

  openPanel: (threadId: number) => void;
  closePanel: () => void;
  loadComments: (postId: number) => Promise<void>;
  postComment: (postId: number, text: string) => Promise<void>;
}

// ── Combined store ────────────────────────────────────────────────────────────

type Store = ThreadsSlice & ProfileSlice & ThreadPanelSlice;

const idle: StatusState = { type: 'idle', message: '' };

export const useStore = create<Store>((set, get) => ({
  // ── Threads ────────────────────────────────────────────────────────────────
  threads: [],
  threadsStatus: idle,
  isLoadingThreads: false,
  isCreatingThread: false,
  threadPage: 1,
  threadFilter: 'all',

  setThreadsStatus: (status) => set({ threadsStatus: status }),
  setThreadPage: (page) => set({ threadPage: page }),
  setThreadFilter: (filter) => set({ threadFilter: filter, threadPage: 1 }),

  loadThreads: async () => {
    if (get().isLoadingThreads) return;
    set({ isLoadingThreads: true, threadsStatus: { type: 'loading', message: 'Загружаем обсуждения… GET /posts' } });
    try {
      const raw = await api.getPosts();
      const threads = raw.map((p, i) => mapPost(p, i));
      // После загрузки тредов обновляем myThreads (треды userId=1)
      const existingMyThreads = get().myThreads.filter((t) => t.userId === 0); // только созданные в сессии
      const serverMyThreads = threads.filter((t) => t.userId === MY_USER_ID);
      set({
        threads,
        threadPage: 1,
        threadsStatus: idle,
        myThreads: [...existingMyThreads, ...serverMyThreads],
      });
    } catch {
      set({ threadsStatus: { type: 'error', message: 'Не удалось загрузить. Проверьте соединение.' } });
    } finally {
      set({ isLoadingThreads: false });
    }
  },

  createThread: async (title, body, tag) => {
  if (get().isLoadingThreads || get().isCreatingThread) return;

  set({ 
    isCreatingThread: true, 
    threadsStatus: { type: 'loading', message: 'Публикуем тред…' } 
  });

  try {
    await api.createPost({ title, body, userId: MY_USER_ID });

    const profile = get().profile;
    const authorName = profile ? profile.name : 'Вы';

    const newThread: Thread = {
      id: Date.now(),
      userId: 0,                    // обозначаем как "мой" тред
      title,
      body,
      tag,
      tagLabel: TAG_LABELS[tag] ?? tag,
      votes: 0,
      author: authorName,
      views: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),   // ← только что создан
      timeLabel: 'только что',
    };

    set((s) => ({
      threads: [newThread, ...s.threads],     // новый тред сверху
      threadPage: 1,
      threadsStatus: { type: 'success', message: 'Тред опубликован! 🎉' },
      myThreads: [newThread, ...s.myThreads],
    }));

    setTimeout(() => set({ threadsStatus: idle }), 3000);
  } catch (e) {
    set({ threadsStatus: { type: 'error', message: `Ошибка: ${String(e)}` } });
  } finally {
    set({ isCreatingThread: false });
  }
},

  updateThread: async (id, title, body) => {
    set({ threadsStatus: { type: 'loading', message: `Обновляем тред… PUT /posts/${id}` } });
    try {
      await api.updatePost(id, { title, body, userId: 1 });
      set((s) => ({
        threads: s.threads.map((t) => t.id === id ? { ...t, title, body } : t),
        myThreads: s.myThreads.map((t) => t.id === id ? { ...t, title, body } : t),
        threadsStatus: { type: 'success', message: 'Тред обновлён ✓' },
      }));
      setTimeout(() => set({ threadsStatus: idle }), 3000);
    } catch (e) {
      set({ threadsStatus: { type: 'error', message: `Ошибка: ${String(e)}` } });
    }
  },

  deleteThread: async (id) => {
    set({ threadsStatus: { type: 'loading', message: `Удаляем тред… DELETE /posts/${id}` } });
    try {
      await api.deletePost(id);
      set((s) => ({
        threads: s.threads.filter((t) => t.id !== id),
        myThreads: s.myThreads.filter((t) => t.id !== id),
        threadsStatus: { type: 'success', message: 'Тред удалён' },
      }));
      setTimeout(() => set({ threadsStatus: idle }), 2500);
    } catch (e) {
      set({ threadsStatus: { type: 'error', message: `Ошибка: ${String(e)}` } });
    }
  },

  voteThread: (id, delta) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === id ? { ...t, votes: t.votes + delta } : t),
      myThreads: s.myThreads.map((t) => t.id === id ? { ...t, votes: t.votes + delta } : t),
    }));
  },

  // ++ +1 просмотр при открытии панели
  incrementViews: (id) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === id ? { ...t, views: t.views + 1 } : t),
      myThreads: s.myThreads.map((t) => t.id === id ? { ...t, views: t.views + 1 } : t),
    }));
  },

  // ++ +1 комментарий при отправке
  incrementComments: (id) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === id ? { ...t, commentCount: t.commentCount + 1 } : t),
      myThreads: s.myThreads.map((t) => t.id === id ? { ...t, commentCount: t.commentCount + 1 } : t),
    }));
  },

  // ── Profile ────────────────────────────────────────────────────────────────
  profile: null,
  profileStatus: idle,
  isSavingProfile: false,
  myThreads: [],

  setProfileStatus: (status) => set({ profileStatus: status }),

  loadProfile: async () => {
    set({ profileStatus: { type: 'loading', message: 'Загружаем профиль… GET /users/1' } });
    try {
      const raw = await api.getUser(MY_USER_ID);
      const profile = mapUser(raw, 0);
      // Если треды уже загружены — заполняем myThreads тредами userId=1
      const threads = get().threads;
      const existingMyThreads = get().myThreads.filter((t) => t.userId === 0);
      const serverMyThreads = threads.filter((t) => t.userId === MY_USER_ID);
      set({
        profile,
        profileStatus: idle,
        myThreads: [...existingMyThreads, ...serverMyThreads],
      });
    } catch (e) {
      set({ profileStatus: { type: 'error', message: `Не удалось загрузить: ${String(e)}` } });
    }
  },

  saveProfile: async (data) => {
    if (get().isSavingProfile) return;
    const profile = get().profile;
    if (!profile) return;
    set({ isSavingProfile: true, profileStatus: { type: 'loading', message: `Сохраняем… PATCH /users/${profile.id}` } });
    try {
      await api.patchUser(profile.id, { name: data.name, email: data.email });
      set({
        profile: { ...profile, ...data },
        profileStatus: { type: 'success', message: 'Сохранено ✓' },
      });
      setTimeout(() => set({ profileStatus: idle }), 3000);
    } catch (e) {
      set({ profileStatus: { type: 'error', message: `Ошибка: ${String(e)}` } });
    } finally {
      set({ isSavingProfile: false });
    }
  },

  // ── Thread panel ───────────────────────────────────────────────────────────
  panelOpen: false,
  panelThreadId: null,
  panelComments: [],
  panelCommentsStatus: idle,
  isSendingComment: false,

  openPanel: (threadId) => {
    set({ panelOpen: true, panelThreadId: threadId, panelComments: [] });
    // ++ +1 просмотр при открытии
    get().incrementViews(threadId);
    get().loadComments(threadId);
  },

  closePanel: () => {
    set({ panelOpen: false, panelThreadId: null });
  },

  loadComments: async (postId) => {
    set({ panelCommentsStatus: { type: 'loading', message: '' } });
    try {
      const raw = await api.getComments(postId);
      set({
        panelComments: raw.map((c, i) => mapComment(c, i)),
        panelCommentsStatus: idle,
      });
    } catch {
      set({ panelCommentsStatus: { type: 'error', message: 'Не удалось загрузить комментарии' } });
    }
  },

  postComment: async (postId, text) => {
    if (get().isSendingComment) return;
    set({ isSendingComment: true });
    try {
      await api.createComment({ postId, name: 'Вы', email: 'me@puls.rf', body: text });
      const newComment: Comment = {
        id: Date.now(),
        postId,
        authorName: 'Вы',
        body: text,
        timeAgo: 'только что',
        avatarIndex: 0,
      };
      // ++ +1 к счётчику комментариев треда
      get().incrementComments(postId);
      set((s) => ({ panelComments: [newComment, ...s.panelComments] }));
    } catch {
      // silently fail — caller handles UI
    } finally {
      set({ isSendingComment: false });
    }
  },
}));