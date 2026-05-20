import { Suspense } from "react";
import NowPlayingCard from "./NowPlayingCard";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NowPlayingCard />
    </Suspense>
  );
}
