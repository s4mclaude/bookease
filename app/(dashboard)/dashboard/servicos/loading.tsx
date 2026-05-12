export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 bg-gray-200 rounded-xl w-28 mb-2" />
          <div className="h-4 bg-gray-100 rounded-xl w-48" />
        </div>
        <div className="h-9 bg-gray-200 rounded-xl w-32" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100 last:border-0 flex items-center gap-4">
            <div className="flex-1 h-4 bg-gray-200 rounded-xl" />
            <div className="w-16 h-4 bg-gray-100 rounded-xl" />
            <div className="w-20 h-4 bg-gray-100 rounded-xl" />
            <div className="w-12 h-6 bg-gray-100 rounded-lg" />
            <div className="w-20 h-4 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
