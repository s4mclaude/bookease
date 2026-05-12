export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-4xl animate-pulse">
      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-xl w-24 mb-2" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-xl w-48 mb-8" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1 max-w-xs" />
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
      <div className="flex gap-2 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-xl w-24 mb-3" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
