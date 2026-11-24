export default function Loading() {
  return (
    <div className="min-h-screen px-4 pt-28 md:px-[4%]">
      <div className="mb-10 h-[42vh] animate-pulse rounded-xl bg-white/10" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div key={rowIndex}>
            <div className="mb-3 h-7 w-48 animate-pulse rounded bg-white/10" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {Array.from({ length: 5 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  className="aspect-video animate-pulse rounded-lg bg-white/10"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
