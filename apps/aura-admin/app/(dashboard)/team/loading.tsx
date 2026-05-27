export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-white/5" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-white/5" />
    </div>
  )
}
