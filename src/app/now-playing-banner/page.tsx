import { Suspense } from "react";
import NowPlayingBanner from "./NowPlayingBanner";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingBanner /></Suspense>;
}
