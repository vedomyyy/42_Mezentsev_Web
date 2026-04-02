export function ThreadSkeleton() {
  return (
    <div className="sk-thread">
      <div className="sk-votes">
        <div className="skeleton sk-v1" />
        <div className="skeleton sk-v2" />
      </div>
      <div className="sk-body">
        <div className="skeleton sk-line sk-short" />
        <div className="skeleton sk-line sk-title-line" />
        <div className="skeleton sk-line sk-medium" />
        <div className="skeleton sk-line sk-short" />
      </div>
    </div>
  );
}

export function ThreadSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <ThreadSkeleton key={i} />
      ))}
    </>
  );
}