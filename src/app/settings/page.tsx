import { Suspense } from "react";
import SettingsPage from "./SettingsPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
