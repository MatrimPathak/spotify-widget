import { Suspense } from "react";
import NowPlayingNotification from "./NowPlayingNotification";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingNotification /></Suspense>;
}
