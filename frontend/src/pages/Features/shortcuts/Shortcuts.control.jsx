import React, { createContext, useContext, useMemo } from "react";
import { HotkeysContext } from "@/context/HotkeysContext.jsx";

export const ShortcutsContext = createContext({ shortcuts: [] });

function ShortcutsControl({ children }) {
  // Prefer the live array from context, fallback to snapshot getter.
  const { shortcuts: liveShortcuts = [], getShortcuts } =
    useContext(HotkeysContext);
  const shortcuts = useMemo(() => {
    return Array.isArray(liveShortcuts) && liveShortcuts.length > 0
      ? liveShortcuts
      : getShortcuts?.() || [];
  }, [liveShortcuts, getShortcuts]);

  return (
    <ShortcutsContext.Provider value={{ shortcuts }}>
      {children}
    </ShortcutsContext.Provider>
  );
}

export default ShortcutsControl;
