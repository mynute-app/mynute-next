import { auth } from "../../../auth";


export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div className="bg-red-400">
      {/* <p>{session.user.name}</p>
      <p>{session.user.email}</p> */}
      <p>{session.user.accessToken}</p>
      <p>{session.user.email_verified}</p>
      <p>{session.user.firstName}</p>
      {/* <p>{session.user.id}</p> */}
    </div>
  );
}
