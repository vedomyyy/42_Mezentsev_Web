import type { StatPillProps } from '../../types';

export function StatPill({ icon, value, label }: StatPillProps) {
  return (
    <div className="stat-pill">
      <span className="si">{icon}</span>
      <strong>{value}</strong>
      {label && <span>{label}</span>}
    </div>
  );
}