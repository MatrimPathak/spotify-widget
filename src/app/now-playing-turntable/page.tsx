import { Suspense } from "react";
import NowPlayingTurntable from "./NowPlayingTurntable";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingTurntable /></Suspense>;
}
