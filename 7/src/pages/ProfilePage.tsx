import { useEffect, useState } from 'react';
import { useStore } from '../store';

import { StatusToast } from '../components/ui/StatusToast';
import { StatPill } from '../components/ui/StatPill';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { TIME_AGO } from '../utils/constants';

export function ProfilePage() {
  const {
    profile, profileStatus, isSavingProfile,
    loadProfile, saveProfile,
    myThreads, openPanel,
  } = useStore();

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!profile) loadProfile();
  }, []);

  const initials = profile
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
    : '';

  const totalVotes = myThreads.reduce((s, t) => s + t.votes, 0);

  return (
    <div className="section-enter">
      <div className="section-hero">
        <div className="section-hero-left">
          <div className="section-title">
            Мой <span className="hl">профиль</span>
          </div>
          <div className="section-sub">
            Ваша страница на форуме — редактируйте данные и смотрите свою активность
          </div>
        </div>
      </div>

      <StatusToast status={profileStatus} />

      <div className="profile-card">
        {profileStatus.type === 'loading' && !profile ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: 160, height: 18, borderRadius: 6, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 220, height: 13, borderRadius: 6 }} />
          </div>
        ) : profile ? (
          <div className="profile-main">
            <div className="profile-ava av-0">{initials}</div>
            <div className="profile-info">
              <div className="profile-name">{profile.name}</div>
              <div className="profile-role">{profile.role} · {profile.city}</div>
              <div className="profile-email">📧 {profile.email}</div>
              <div className="profile-joined">На форуме с марта 2023</div>
            </div>
            <button
              className="btn btn-lime profile-edit-btn"
              onClick={() => setEditOpen(true)}
            >
              ✏️ Редактировать
            </button>
          </div>
        ) : null}
      </div>

      {profile && (
        <div className="stats-strip" style={{ marginTop: 20 }}>
          <StatPill icon="💬" value={myThreads.length} label="тредов" />
          <StatPill icon="🔥" value={totalVotes} label="голосов" />
          <StatPill icon="🏙️" value={profile.city} label="" />
        </div>
      )}

      {/* ── Мои треды ── */}
      {profile && (
        <div style={{ marginTop: 28 }}>
          <div className="section-title" style={{ fontSize: '1.1rem', marginBottom: 14 }}>
            Мои треды <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: '0.9rem' }}>
              {myThreads.length} тредов
            </span>
          </div>

          {myThreads.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <div className="empty-title">Тредов пока нет</div>
              <div className="empty-sub">Напишите первый!</div>
            </div>
          ) : (
            <div className="threads-list">
              {myThreads.map((t) => (
                <div
                  key={t.id}
                  className={`thread-card tag-${t.tag}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openPanel(t.id)}
                >
                  <div className="thread-votes">
                    <div className="vote-count">{t.votes}</div>
                  </div>
                  <div className="thread-body">
                    <div className="thread-meta">
                      <span className={`thread-tag tag-${t.tag}`}>{t.tagLabel}</span>
                      <span className="thread-time">
                        {t.timeLabel ?? TIME_AGO[t.id % TIME_AGO.length]}
                      </span>
                    </div>
                    <div className="thread-title">{t.title}</div>
                    <div className="thread-preview">{t.body}</div>
                    <div className="thread-footer">
                      <span className="thread-stat">💬 {t.commentCount} комментариев</span>
                      <span className="thread-stat">👁 {t.views} просмотров</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <EditProfileModal
        profile={profile}
        open={editOpen}
        isSaving={isSavingProfile}
        onClose={() => setEditOpen(false)}
        onSave={saveProfile}
      />
    </div>
  );
}