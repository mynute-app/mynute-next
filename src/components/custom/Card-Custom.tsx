import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CardCustomProps {
    title: string;
    description: string;
}

export const CardCustom = () => {
    return (
      <div className="bg-gray-100 shadow-md rounded-md flex flex-col justify-center items-center h-48">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="p-4 ">
          <h1 className="text-2xl font-bold text-center">Lá Família</h1>
          <p className="text-sm text-gray-500 text-center">São Roque</p>
        </div>
      </div>
    );
}