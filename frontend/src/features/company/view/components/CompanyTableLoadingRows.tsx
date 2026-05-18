import { Skeleton } from "@/components/ui/skeleton";

export function CompanyTableLoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_3fr_2fr_80px] px-6 py-4 border-b border-gray-50 items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-rm-trip-smooth shrink-0" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
      ))}
    </>
  );
}
