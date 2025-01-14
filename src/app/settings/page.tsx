// app/settings/page.tsx
import { redirect } from "next/navigation";
import SettingsForm from "../../components/auth/settings/settingsForm";
import { auth } from "../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export default async function SettingsPage() {
  
  const session = await auth.api.getSession({
    headers: await headers()
})
  
  if (!session) {
    return redirect("/");
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      <SettingsForm />
    </div>
  );
}
