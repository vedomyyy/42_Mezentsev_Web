import type { ThreadCardProps } from '../../types';

export function ThreadCard({ 
  thread, 
  showActions = true, 
  onVote, 
  onEdit, 
  onDelete, 
  onClick 
}: ThreadCardProps) {

  const timeDisplay = getRelativeTime(thread.createdAt);

  return (
    <div className={`thread-card tag-${thread.tag}`} id={`t-${thread.id}`}>
      <div className="thread-votes">
        <button
          className="vote-btn"
          onClick={(e) => { e.stopPropagation(); onVote(thread.id, 1); }}
          aria-label="Голосовать за"
        >▲</button>
        <div className="vote-count">{thread.votes}</div>
        <button
          className="vote-btn"
          onClick={(e) => { e.stopPropagation(); onVote(thread.id, -1); }}
          aria-label="Голосовать против"
        >▼</button>
      </div>

      <div className="thread-body thread-clickable" onClick={() => onClick(thread.id)}>
        <div className="thread-meta">
          <span className="thread-author">{thread.author}</span>
          <span className="thread-time">{timeDisplay}</span>
          <span className={`thread-tag tag-${thread.tag}`}>{thread.tagLabel}</span>
        </div>
        <div className="thread-title">{thread.title}</div>
        <div className="thread-preview">{thread.body}</div>

        <div className="thread-footer">
          <span className="thread-stat">💬 {thread.commentCount} комментариев</span>
          <span className="thread-stat">👁 {thread.views} просмотров</span>
        </div>
      </div>

      {showActions && onEdit && onDelete && (
        <div className="thread-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); onEdit(thread); }}
          >
            ✏️ Изменить
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => { e.stopPropagation(); onDelete(thread.id); }}
          >
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}

// Простая функция "только что", "5 мин назад", "2 ч назад" и т.д.
function getRelativeTime(createdAt: string): string {
  const seconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);

  if (seconds < 60) return "только что";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
  return `${Math.floor(seconds / 86400)} дн назад`;
}