import { Suspense } from "react";
import NowPlayingVertical from "./NowPlayingVertical";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingVertical /></Suspense>;
}
