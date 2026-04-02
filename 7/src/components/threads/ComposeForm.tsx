import { useState } from 'react';
import type { ThreadTag } from '../../types';

interface ComposeFormProps {
  onSubmit: (title: string, body: string, tag: ThreadTag) => Promise<void>;
  onRefresh: () => void;
  disabled: boolean;
}

export function ComposeForm({ onSubmit, onRefresh, disabled }: ComposeFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState<ThreadTag>('discuss');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(title.trim(), body.trim(), tag);
      setTitle('');
      setBody('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="compose-card">
      <h3>✦ Новый тред</h3>

      <div className="form-grid form-grid-1" style={{ marginBottom: 14 }}>
        <div className="field">
          <label>Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Сформулируйте тему одним предложением…"
          />
        </div>
      </div>

      <div className="form-grid form-grid-2">
        <div className="field">
          <label>Категория</label>
          <select value={tag} onChange={(e) => setTag(e.target.value as ThreadTag)}>
            <option value="discuss">💬 Обсуждение</option>
            <option value="idea">💡 Идея</option>
            <option value="help">🙋 Помощь</option>
            <option value="news">📰 Новость</option>
          </select>
        </div>
      </div>

      <div className="form-grid form-grid-1" style={{ marginTop: 14 }}>
        <div className="field">
          <label>Текст</label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Расскажите подробнее…"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn btn-lime"
          onClick={handleSubmit}
          disabled={disabled || submitting}
        >
          {submitting ? '⏳ Публикуем…' : '⚡ Опубликовать'}
        </button>
        <button className="btn btn-ghost" onClick={onRefresh} disabled={disabled}>
          ↻ Обновить список
        </button>
      </div>
    </div>
  );
}