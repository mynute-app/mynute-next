import { Skeleton } from "@/components/ui/skeleton";

const ServiceListSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
      <ul className="mt-2 space-y-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="p-2 rounded">
            <Skeleton className="w-full h-4" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceListSkeleton;
