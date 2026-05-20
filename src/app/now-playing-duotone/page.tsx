import { Suspense } from "react";
import NowPlayingDuotone from "./NowPlayingDuotone";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingDuotone /></Suspense>;
}
