import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SettingsPage from "./SettingsPage";

export default async function Page() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access_token")?.value) {
    redirect("/login");
  }

  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
