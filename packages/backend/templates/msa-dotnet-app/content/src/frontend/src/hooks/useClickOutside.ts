import { useEffect } from "react";

type Handler = (event: MouseEvent) => void;

export function useClickOutside(
  refElement: React.RefObject<HTMLElement | null>[],
  handler: Handler,
  triggerRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInside = refElement.some(
        (ref) => ref.current && ref.current.contains(target)
      );
      const isTrigger = triggerRef.current?.contains(target);
      if (!isInside && !isTrigger) {
        setTimeout(() => handler(e), 100);
        // handler(e);
      }
    };
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, [refElement, handler, triggerRef]);
}
