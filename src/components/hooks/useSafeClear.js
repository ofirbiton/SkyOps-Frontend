import { useCallback } from "react";

export function useSafeClear() {
  const safeClearDrawings = useCallback(() => {
    if (
      window.govmapReady &&
      window.govmap &&
      typeof window.govmap.clearDrawings === "function"
    ) {
      try {
        window.govmap.clearDrawings();
      } catch (_) {
        // שקט - אין צורך בלוגים
      }
    }
  }, []);

  return { safeClearDrawings };
}
