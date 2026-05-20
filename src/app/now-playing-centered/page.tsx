import { Suspense } from "react";
import NowPlayingCentered from "./NowPlayingCentered";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingCentered /></Suspense>;
}
