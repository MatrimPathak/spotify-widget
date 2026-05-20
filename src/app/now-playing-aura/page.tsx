import { Suspense } from "react";
import NowPlayingAura from "./NowPlayingAura";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingAura /></Suspense>;
}
