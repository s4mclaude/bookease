export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-xl w-36 mb-2" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-xl w-52" />
        </div>
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-40" />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-xl max-w-xs" />
            <div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            <div className="w-12 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
