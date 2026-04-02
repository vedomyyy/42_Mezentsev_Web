import { useState, useCallback, useEffect } from 'react';
import type { ThreadPanelProps } from '../../types';
import { getTimeAgo } from '../../utils/mappers';

export function ThreadPanel({ state, thread, onClose, onPostComment }: ThreadPanelProps) {
  const [commentText, setCommentText] = useState('');
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (state.open) setEverOpened(true);
  }, [state.open]);

  const handleSend = useCallback(async () => {
    const text = commentText.trim();
    if (!text || state.isSendingComment || state.panelThreadId == null) return;
    await onPostComment(state.panelThreadId, text);
    setCommentText('');
  }, [commentText, state.isSendingComment, state.panelThreadId, onPostComment]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') handleSend();
  };

  if (!everOpened) return null;

  return (
    <>
      <div
        className={`tp-overlay${state.open ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`thread-panel${state.open ? ' open' : ''}`}>
        <div className="tp-header">
          <button className="tp-close" onClick={onClose}>← Назад</button>
          {thread && (
            <span className={`thread-tag tp-tag tag-${thread.tag}`}>
              {thread.tagLabel}
            </span>
          )}
        </div>

        <div className="tp-scroll">
          {thread && (
            <div className="tp-post">
              <div className="tp-post-meta">
                <span className="tp-author">{thread.author}</span>
                <span className="tp-time">{getTimeAgo(thread.id)}</span>
              </div>
              <div className="tp-title">{thread.title}</div>
              <div className="tp-body">{thread.body}</div>
              <div className="tp-post-footer">
                <span className="tp-votes-label">Голоса:</span>
                <span className="tp-votes-val">{thread.votes}</span>
              </div>
            </div>
          )}

          <div className="tp-comments-section">
            <div className="tp-comments-title">Комментарии</div>
            <div className="tp-comments-list">
              {state.commentsStatus.type === 'loading' && (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="tp-comment-sk">
                      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8, borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 10, width: '75%', borderRadius: 4 }} />
                    </div>
                  ))}
                </>
              )}

              {state.commentsStatus.type === 'error' && (
                <div className="tp-no-comments" style={{ color: 'var(--red)' }}>
                  Не удалось загрузить комментарии
                </div>
              )}

              {state.commentsStatus.type !== 'loading' && state.comments.length === 0 && (
                <div className="tp-no-comments">
                  Комментариев пока нет — будь первым 👇
                </div>
              )}

              {state.comments.map((comment, i) => (
                <div
                  key={comment.id}
                  className={`tp-comment${i === 0 && comment.authorName === 'Вы' ? ' tp-comment-new' : ''}`}
                >
                  <div className="tp-comment-head">
                    <div className={`tp-comment-ava av-${comment.avatarIndex}`}>
                      {comment.authorName[0]}
                    </div>
                    <div>
                      <div className="tp-comment-name">{comment.authorName}</div>
                      <div className="tp-comment-time">{comment.timeAgo}</div>
                    </div>
                  </div>
                  <div className="tp-comment-text">{comment.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="tp-compose">
            <div className="tp-compose-label">✦ Написать комментарий</div>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напиши что думаешь…"
            />
            <div className="tp-compose-actions">
              <button
                className="btn btn-lime"
                onClick={handleSend}
                disabled={state.isSendingComment}
              >
                {state.isSendingComment ? 'Отправляем…' : 'Отправить'}
              </button>
              <span className="tp-compose-hint">Ctrl+Enter</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}