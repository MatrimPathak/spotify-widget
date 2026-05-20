import { Suspense } from "react";
import NowPlayingSplit from "./NowPlayingSplit";
export default function Page() {
  return <Suspense fallback={null}><NowPlayingSplit /></Suspense>;
}
