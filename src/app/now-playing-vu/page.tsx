import { Suspense } from "react";
import NowPlayingVU from "./NowPlayingVU";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingVU /></Suspense>;
}
