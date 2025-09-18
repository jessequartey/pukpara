import { getServerSession } from "@/lib/auth-server";

export default async function Home() {
  const session = await getServerSession();
  const userDisplayName =
    session?.user?.name?.trim() || session?.user?.email || "Pukpara member";

  return (
    <main className="space-y-4 p-6">
      <h1 className="font-semibold text-2xl">Welcome to Pukpara</h1>
      {session ? (
        <p className="text-muted-foreground">Hello, {userDisplayName}</p>
      ) : (
        <p className="text-muted-foreground">Please sign in to continue.</p>
      )}
    </main>
  );
}
