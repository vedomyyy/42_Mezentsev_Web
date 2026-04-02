import type { PaginationProps } from '../../types';

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buttons: React.ReactNode[] = [];

  if (page > 1) {
    buttons.push(
      <button key="prev" className="pager-btn" onClick={() => onPage(page - 1)}>←</button>
    );
  }

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      buttons.push(
        <button
          key={i}
          className={`pager-btn ${i === page ? 'active' : ''}`}
          onClick={() => onPage(i)}
        >
          {i}
        </button>
      );
    } else if (Math.abs(i - page) === 2) {
      buttons.push(<span key={`ellipsis-${i}`} className="pager-ellipsis">…</span>);
    }
  }

  if (page < totalPages) {
    buttons.push(
      <button key="next" className="pager-btn" onClick={() => onPage(page + 1)}>→</button>
    );
  }

  return <div className="pagination">{buttons}</div>;
}