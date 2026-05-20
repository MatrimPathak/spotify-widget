import { Suspense } from "react";
import NowPlayingCRT from "./NowPlayingCRT";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingCRT /></Suspense>;
}
