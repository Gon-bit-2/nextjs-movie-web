/**
 * Màn hình khung chờ (Skeleton) đồng bộ bố cục Rạp chiếu đêm khi chuyển trang
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0D]">
      <div className="h-[58vh] w-full animate-pulse bg-[#14141A]" />
      <div className="mx-auto max-w-[1600px] space-y-10 px-4 pt-8 pb-16 md:px-8 xl:px-12">
        {Array.from({ length: 2 }).map((_, rowIndex) => (
          <div key={rowIndex}>
            <div className="mb-4 h-7 w-52 animate-pulse rounded bg-[#1E1E26]" />
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((__, itemIndex) => (
                <div key={itemIndex} className="space-y-2.5">
                  <div className="aspect-[2/3] animate-pulse rounded-[10px] bg-[#14141A]" />
                  <div className="h-3.5 w-4/5 animate-pulse rounded bg-[#1E1E26]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#14141A]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
