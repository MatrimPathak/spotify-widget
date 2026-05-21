import { useSearchParams } from "next/navigation";

export interface WidgetConfig {
  radius:     number | null;
  blur:       number | null;
  visualizer: boolean;
}

export function useWidgetConfig(): WidgetConfig {
  const sp = useSearchParams();
  return {
    radius:     sp.get("radius") ? parseInt(sp.get("radius")!)  : null,
    blur:       sp.get("blur")   ? parseInt(sp.get("blur")!)    : null,
    visualizer: sp.get("visualizer") !== "false",
  };
}
