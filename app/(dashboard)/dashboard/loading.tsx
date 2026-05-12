export default function Loading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      <div className="h-7 bg-gray-200 rounded-xl w-40 mb-2" />
      <div className="h-4 bg-gray-100 rounded-xl w-32 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 h-32" />
        ))}
      </div>
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 h-24" />
    </div>
  )
}
