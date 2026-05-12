export default function RelatoriosLoading() {
  return (
    <div className="p-4 md:p-8 max-w-4xl animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2" />
      <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="mb-3">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mb-1" />
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
