import { useState, useEffect } from 'react';
import type { EditThreadModalProps } from '../../types';

export function EditThreadModal({ thread, onClose, onSave }: EditThreadModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (thread) {
      setTitle(thread.title);
      setBody(thread.body);
    }
  }, [thread]);

  if (!thread) return null;

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await onSave(thread.id, title.trim(), body.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Редактировать тред</div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label>Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Текст</label>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Отмена
          </button>
          <button className="btn btn-violet" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить — PUT'}
          </button>
        </div>
      </div>
    </div>
  );
}