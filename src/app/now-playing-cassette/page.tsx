import { Suspense } from "react";
import NowPlayingCassette from "./NowPlayingCassette";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingCassette /></Suspense>;
}
