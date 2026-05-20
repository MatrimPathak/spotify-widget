import { Suspense } from "react";
import NowPlayingTicker from "./NowPlayingTicker";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingTicker /></Suspense>;
}
