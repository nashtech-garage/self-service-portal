import { useRef, useState, type RefObject } from "react";
import { useClickOutside } from "@hooks/useClickOutside";

export function useDropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const menuRef: RefObject<HTMLUListElement | null> =
    useRef<HTMLUListElement | null>(null);

  // close on outside click
  useClickOutside([triggerRef, menuRef], () => setIsOpen(false), triggerRef);

  const toggle = () => setIsOpen((e) => !e);

  return { isOpen, toggle, triggerRef, menuRef };
}
