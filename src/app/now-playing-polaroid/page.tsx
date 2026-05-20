import { Suspense } from "react";
import NowPlayingPolaroid from "./NowPlayingPolaroid";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingPolaroid /></Suspense>;
}
