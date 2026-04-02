import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { Thread, ThreadTag } from '../types';
import { PER_PAGE } from '../utils/constants';

import { StatusToast } from '../components/ui/StatusToast';
import { StatPill } from '../components/ui/StatPill';
import { Pagination } from '../components/ui/Pagination';
import { ThreadSkeletonList } from '../components/ui/ThreadSkeleton';
import { ThreadCard } from '../components/threads/ThreadCard';
import { ComposeForm } from '../components/threads/ComposeForm';
import { EditThreadModal } from '../components/threads/EditThreadModal';
import { ThreadPanel } from '../components/threads/ThreadPanel';

export function ThreadsPage() {
  const {
    threads, threadsStatus, isLoadingThreads,
    threadPage, threadFilter,
    loadThreads, createThread, updateThread, deleteThread, voteThread,
    setThreadPage, setThreadFilter,
    panelOpen, panelThreadId, panelComments, panelCommentsStatus, isSendingComment,
    openPanel, closePanel, postComment,
  } = useStore();

  const [editingThread, setEditingThread] = useState<Thread | null>(null);

  useEffect(() => {
    if (!threads.length) loadThreads();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closePanel]);

  const filtered = threadFilter === 'all'
    ? threads
    : threads.filter((t) => t.tag === threadFilter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice((threadPage - 1) * PER_PAGE, threadPage * PER_PAGE);

  const panelThread = panelThreadId != null
    ? threads.find((t) => t.id === panelThreadId) ?? null
    : null;


  return (
    <div className="section-enter">
      <div className="section-hero">
        <div className="section-hero-left">
          <div className="section-title">
            Горячие <span className="hl">треды</span>
          </div>
          <div className="section-sub">
            Обсуждайте, спрашивайте, делитесь опытом — здесь всегда кто-то онлайн
          </div>
        </div>
        <div className="section-hero-right">
          <button className="btn btn-ghost" onClick={loadThreads} disabled={isLoadingThreads}>
            ↻ Обновить
          </button>
        </div>
      </div>

      <StatusToast status={threadsStatus} />

      {threads.length > 0 && (
        <div className="stats-strip">
          <StatPill icon="💬" value={threads.length} label="обсуждений" />
          <StatPill icon="👥" value={new Set(threads.map((t) => t.userId)).size} label="авторов" />
          <StatPill icon="🔥" value={threads.reduce((s, t) => s + t.votes, 0)} label="голосов" />
        </div>
      )}

      <ComposeForm
        onSubmit={createThread}
        onRefresh={loadThreads}
        disabled={isLoadingThreads}
      />

      <div className="toolbar">
        <select
          className="filter-select"
          value={threadFilter}
          onChange={(e) => setThreadFilter(e.target.value as ThreadTag | 'all')}
        >
          <option value="all">Все категории</option>
          <option value="discuss">💬 Обсуждение</option>
          <option value="idea">💡 Идея / Опыт</option>
          <option value="help">🙋 Помощь</option>
          <option value="news">📰 Новости</option>
        </select>
        <div className="toolbar-label">{filtered.length} тредов</div>
      </div>

      <div className="threads-list">
        {isLoadingThreads && !threads.length ? (
          <ThreadSkeletonList count={5} />
        ) : slice.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <div className="empty-title">Ничего не нашлось</div>
            <div className="empty-sub">Попробуйте другой фильтр</div>
          </div>
        ) : (
          slice.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              showActions
              onVote={voteThread}
              onEdit={setEditingThread}
              onDelete={deleteThread}
              onClick={openPanel}
            />
          ))
        )}
      </div>

      <Pagination
        page={threadPage}
        totalPages={totalPages}
        onPage={(n) => { setThreadPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      {editingThread && (
        <EditThreadModal
          thread={editingThread}
          onClose={() => setEditingThread(null)}
          onSave={updateThread}
        />
      )}

      <ThreadPanel
        state={{
          open: panelOpen,
          panelThreadId,
          comments: panelComments,
          commentsStatus: panelCommentsStatus,
          isSendingComment,
        }}
        thread={panelThread}
        onClose={closePanel}
        onPostComment={postComment}
      />
    </div>
  );
}