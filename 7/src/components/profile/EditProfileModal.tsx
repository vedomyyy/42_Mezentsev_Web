import { useState, useEffect } from 'react';
import type { EditProfileModalProps, UserProfile } from '../../types';

export function EditProfileModal({ profile, open, isSaving, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setRole(profile.role);
      setCity(profile.city);
    }
  }, [profile]);

  if (!open || !profile) return null;

  const handleSave = async () => {
    if (isSaving) return;
    const data: Omit<UserProfile, 'id'> = {
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      city: city.trim(),
    };
    await onSave(data);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Редактировать профиль</div>

        <div className="form-grid form-grid-2" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Имя</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="field">
            <label>Специальность</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="field">
            <label>Город</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
            Отмена
          </button>
          <button className="btn btn-violet" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}