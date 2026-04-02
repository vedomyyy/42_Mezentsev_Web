import type { StatusToastProps } from '../../types';

export function StatusToast({ status }: StatusToastProps) {
  if (status.type === 'idle' || status.type === 'loading') return null;

  const isError = status.type === 'error';

  return (
    <div
      className={`status-toast ${isError ? 'status-toast-error' : 'status-toast-ok'}`}
      role="alert"
    >
      {isError ? '❌' : '✅'} {status.message}
    </div>
  );
}