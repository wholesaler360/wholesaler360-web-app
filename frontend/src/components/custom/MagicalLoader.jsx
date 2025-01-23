import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function MagicalLoader() {
  return (
    <div className="flex flex-col items-center space-y-4 py-4">
      {/* Image skeleton */}
      <div className="space-y-2 w-full max-w-[240px]">
        <Skeleton className="h-[240px] w-[240px] rounded-lg" />
      </div>    
      </div>
  );
}
