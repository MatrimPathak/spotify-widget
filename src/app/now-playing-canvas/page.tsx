import { Suspense } from "react";
import NowPlayingCanvas from "./NowPlayingCanvas";

export default function Page() {
  return <Suspense fallback={null}><NowPlayingCanvas /></Suspense>;
}
