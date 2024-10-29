
import { auth } from "../../../auth";
const Page = async () => {
  const session = await auth();
  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      <div>
        <h1>Welcome, {session?.user?.name}!</h1>
        <img
          src={session?.user?.image ?? "/placeholder.svg"}
          alt="User Avatar"
        />
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
};
export default Page;
