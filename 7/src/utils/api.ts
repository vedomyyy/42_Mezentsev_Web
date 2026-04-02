import { BASE } from './constants';

export async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  if (options.method === 'DELETE') return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  getPosts: () => fetchJSON<import('../types').RawPost[]>(`${BASE}/posts`),
  getUser: (id: number) => fetchJSON<import('../types').RawUser>(`${BASE}/users/${id}`),
  getComments: (postId: number) => fetchJSON<import('../types').RawComment[]>(`${BASE}/posts/${postId}/comments`),
  createPost: (data: { title: string; body: string; userId: number }) =>
    fetchJSON<import('../types').RawPost>(`${BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updatePost: (id: number, data: { title: string; body: string; userId: number }) =>
    fetchJSON<import('../types').RawPost>(`${BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    }),
  deletePost: (id: number) =>
    fetchJSON<null>(`${BASE}/posts/${id}`, { method: 'DELETE' }),
  patchUser: (id: number, data: { name: string; email: string }) =>
    fetchJSON<import('../types').RawUser>(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  createComment: (data: { postId: number; name: string; email: string; body: string }) =>
    fetchJSON<import('../types').RawComment>(`${BASE}/posts/${data.postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};