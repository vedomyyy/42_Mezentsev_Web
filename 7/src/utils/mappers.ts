import type { RawPost, RawUser, RawComment, Thread, UserProfile, Comment } from '../types';
import {
  RU_THREADS, RU_NAMES, RU_ROLES, RU_CITIES,
  RU_COMMENTS, RU_COMMENT_NAMES, TIME_AGO,
} from './constants';

export function mapPost(p: RawPost, index: number): Thread {
  const tpl = RU_THREADS[index % RU_THREADS.length];

  return {
    id: p.id,
    userId: p.userId,
    title: tpl.title,
    body: tpl.body,
    tag: tpl.tag,
    tagLabel: tpl.tagLabel,
    votes: tpl.votes + Math.floor(index / RU_THREADS.length) * 3,
    author: RU_NAMES[(p.id * 7 + p.id % 3) % RU_NAMES.length],

    // Для старых тредов — красивые фейковые метрики
    views: 45 + (index * 19) % 680,
    commentCount: 3 + (index * 7) % 42,
    createdAt: new Date(Date.now() - (index + 1) * 3600000 * (3 + index % 12)).toISOString(),
  };
}

export function mapUser(u: RawUser, index: number): UserProfile {
  return {
    id: u.id,
    name: RU_NAMES[index] ?? u.name,
    email: u.email,
    role: RU_ROLES[index] ?? u.company.name,
    city: RU_CITIES[index] ?? u.address.city,
  };
}

export function mapComment(c: RawComment, index: number): Comment {
  return {
    id: c.id,
    postId: c.postId,
    authorName: RU_COMMENT_NAMES[index % RU_COMMENT_NAMES.length],
    body: RU_COMMENTS[index % RU_COMMENTS.length],
    timeAgo: TIME_AGO[(c.id + 3) % 10],
    avatarIndex: index % 10,
  };
}

// Удаляем ненужные фейковые функции
export function getTimeAgo(id: number): string {
  return TIME_AGO[id % 10];
}