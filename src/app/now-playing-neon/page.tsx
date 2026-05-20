import { Suspense } from "react";
import NowPlayingNeon from "./NowPlayingNeon";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingNeon /></Suspense>;
}
