export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
