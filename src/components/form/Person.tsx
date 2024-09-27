import { CardCustom } from "../custom/Card-Custom";

export const Person = () => {
  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-2 md:pr-6">
      <CardCustom title="João" description="São Paulo" />
    </div>
  );
};
