import { Suspense } from "react";
import NowPlaying from "./NowPlaying";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NowPlaying />
    </Suspense>
  );
}
