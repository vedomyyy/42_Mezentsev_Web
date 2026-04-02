// ── API raw types (JSONPlaceholder) ──────────────────────────────────────────

export interface RawPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface RawUser {
  id: number;
  name: string;
  email: string;
  username: string;
  address: { city: string };
  company: { name: string };
}

export interface RawComment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

// ── App domain types ──────────────────────────────────────────────────────────

export type ThreadTag = 'discuss' | 'idea' | 'help' | 'news';

export interface Thread {
  id: number;
  userId: number;
  title: string;
  body: string;
  tag: ThreadTag;
  tagLabel: string;
  votes: number;
  author: string;
  timeLabel?: string;
  views: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  timeAgo: string;
  avatarIndex: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  city: string;
}

// ── Store types ───────────────────────────────────────────────────────────────

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

export interface StatusState {
  type: StatusType;
  message: string;
}

export interface ThreadsState {
  threads: Thread[];
  status: StatusState;
  isCreating: boolean;
  page: number;
  filter: ThreadTag | 'all';
}

export interface ProfileState {
  profile: UserProfile | null;
  status: StatusState;
  isSaving: boolean;
}

export interface ThreadPanelState {
  open: boolean;
  threadId: number | null;
  comments: Comment[];
  commentsStatus: StatusState;
  isSendingComment: boolean;
}

// ── Component prop types ──────────────────────────────────────────────────────

export interface ThreadCardProps {
  thread: Thread;
  showActions?: boolean;
  onVote: (id: number, delta: number) => void;
  onEdit?: (thread: Thread) => void;
  onDelete?: (id: number) => void;
  onClick: (id: number) => void;
}

export interface StatusToastProps {
  status: StatusState;
}

export interface StatPillProps {
  icon: string;
  value: string | number;
  label: string;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (n: number) => void;
}

export interface EditThreadModalProps {
  thread: Thread | null;
  onClose: () => void;
  onSave: (id: number, title: string, body: string) => Promise<void>;
}

export interface EditProfileModalProps {
  profile: UserProfile | null;
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: Omit<UserProfile, 'id'>) => Promise<void>;
}

export interface ThreadPanelProps {
  state: {
    open: boolean;
    panelThreadId: number | null;
    comments: Comment[];
    commentsStatus: StatusState;
    isSendingComment: boolean;
  };
  thread: Thread | null;
  onClose: () => void;
  onPostComment: (postId: number, text: string) => Promise<void>;
}