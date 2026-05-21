import { useSearchParams } from "next/navigation";

export interface WidgetConfig {
  radius:     number | null;
  blur:       number | null;
  bgOpacity:  number | null; // 0–1
  visualizer: boolean;
  canvas:     boolean;
}

export function useWidgetConfig(): WidgetConfig {
  const sp = useSearchParams();
  const op = sp.get("bgOpacity");
  return {
    radius:     sp.get("radius")    ? parseInt(sp.get("radius")!)    : null,
    blur:       sp.get("blur")      ? parseInt(sp.get("blur")!)      : null,
    bgOpacity:  op !== null         ? parseInt(op) / 100             : null,
    visualizer: sp.get("visualizer") !== "false",
    canvas:     sp.get("canvas") === "true",
  };
}
