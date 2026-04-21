export default function ContentSkeleton({ blocks = 4 }: { blocks?: number }) {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="h-10 w-40 rounded-2xl bg-slate-200" />
        <div className="h-10 w-64 rounded-2xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: blocks }).map((_, index) => (
          <div key={index} className="h-32 rounded-[2rem] bg-white border border-slate-200" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-[2rem] bg-white border border-slate-200" />
        ))}
      </div>
    </div>
  );
}
