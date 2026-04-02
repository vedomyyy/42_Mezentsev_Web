import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { NEWS_PER_PAGE } from '../utils/constants';

import { StatusToast } from '../components/ui/StatusToast';
import { StatPill } from '../components/ui/StatPill';
import { Pagination } from '../components/ui/Pagination';
import { ThreadSkeletonList } from '../components/ui/ThreadSkeleton';
import { ThreadCard } from '../components/threads/ThreadCard';
import { ThreadPanel } from '../components/threads/ThreadPanel';

export function NewsPage() {
  const {
    threads, isLoadingThreads, loadThreads, voteThread,
    panelOpen, panelThreadId, panelComments, panelCommentsStatus, isSendingComment,
    openPanel, closePanel, postComment,
  } = useStore();

  const [newsPage, setNewsPage] = useState(1);

  useEffect(() => {
    if (!threads.some((t) => t.tag === 'news')) loadThreads();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closePanel]);

  const newsList = threads.filter((t) => t.tag === 'news');
  const totalPages = Math.ceil(newsList.length / NEWS_PER_PAGE);
  const slice = newsList.slice((newsPage - 1) * NEWS_PER_PAGE, newsPage * NEWS_PER_PAGE);

  const maxVotes = newsList.length ? Math.max(...newsList.map((t) => t.votes)) : 0;
  // ++ используем реальный счётчик комментариев
  const totalComments = newsList.reduce((s, t) => s + t.commentCount, 0);

  const panelThread = panelThreadId != null
    ? threads.find((t) => t.id === panelThreadId) ?? null
    : null;

  const newsStatus = isLoadingThreads && !threads.length
    ? { type: 'loading' as const, message: 'Загружаем новости…' }
    : { type: 'idle' as const, message: '' };

  return (
    <div className="section-enter">
      <div className="section-hero">
        <div className="section-hero-left">
          <div className="section-title">
            Новости <span className="hl">сообщества</span>
          </div>
          <div className="section-sub">
            Важное и актуальное — только треды с пометкой «Новость»
          </div>
        </div>
        <div className="section-hero-right">
          <button className="btn btn-ghost" onClick={loadThreads} disabled={isLoadingThreads}>
            ↻ Обновить
          </button>
        </div>
      </div>

      <StatusToast status={newsStatus} />

      {newsList.length > 0 && (
        <div className="stats-strip">
          <StatPill icon="📰" value={newsList.length} label="новостей" />
          <StatPill icon="🔥" value={maxVotes} label="макс. голосов" />
          <StatPill icon="💬" value={totalComments} label="комментариев" />
        </div>
      )}

      <div className="threads-list">
        {isLoadingThreads && !threads.length ? (
          <ThreadSkeletonList count={4} />
        ) : slice.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <div className="empty-title">Новостей пока нет</div>
            <div className="empty-sub">Публикуй треды с тегом «Новость»</div>
          </div>
        ) : (
          slice.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              showActions={false}
              onVote={voteThread}
              onClick={openPanel}
            />
          ))
        )}
      </div>

      <Pagination
        page={newsPage}
        totalPages={totalPages}
        onPage={(n) => { setNewsPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      <ThreadPanel
        state={{ open: panelOpen, panelThreadId, comments: panelComments, commentsStatus: panelCommentsStatus, isSendingComment }}
        thread={panelThread}
        onClose={closePanel}
        onPostComment={postComment}
      />
    </div>
  );
}