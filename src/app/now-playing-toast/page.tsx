import { Suspense } from "react";
import NowPlayingToast from "./NowPlayingToast";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingToast /></Suspense>;
}
