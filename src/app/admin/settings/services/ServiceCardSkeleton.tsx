import { Skeleton } from "@/components/ui/skeleton";

const ServiceCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg border-l-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-48 h-3" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-16 h-8 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;
