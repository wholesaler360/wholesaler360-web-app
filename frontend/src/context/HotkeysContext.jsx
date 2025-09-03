import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

/**
 * Keyboard Shortcuts Mapping:
 *
 * Navigation (Alt + key):
 * - Alt+D: Dashboard
 * - Alt+H: Home
 * - Alt+C: Customers
 * - Alt+V: Vendors
 * - Alt+R: Products
 * - Alt+G: Categories
 * - Alt+S: Stock
 * - Alt+I: Invoices
 * - Alt+P: Purchases
 * - Alt+Y: Payments
 * - Alt+U: Users
 * - Alt+O: Roles & Permissions
 *
 * Quick Actions (Ctrl+Alt + key):
 * - Ctrl+Alt+C: Add Customer
 * - Ctrl+Alt+V: Add Vendor
 * - Ctrl+Alt+R: Add Product
 * - Ctrl+Alt+I: Add Invoice
 * - Ctrl+Alt+P: Add Purchase
 * - Ctrl+Alt+U: Add User
 *
 * Settings (Comma variations):
 * - Alt+,: Account Settings
 * - Ctrl+,: Company Settings
 * - Ctrl+Shift+,: App Settings
 *
 * Help & Utilities:
 * - Shift+?: Show shortcuts help
 * - Ctrl+Shift+K: Show shortcuts help
 * - Ctrl+K: Quick search (placeholder)
 *
 * Legacy shortcuts maintained:
 * - Alt+N: New invoice (duplicate of Ctrl+Alt+I)
 */

// Convert an event to a normalized combo string like "ctrl+shift+p"
function eventToCombo(e) {
  const parts = [];
  if (e.ctrlKey) parts.push("ctrl");
  if (e.metaKey) parts.push("meta");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");

  let key = e.key || "";
  const map = {
    " ": "space",
    Enter: "enter",
    Escape: "esc",
    Esc: "esc",
    Backspace: "backspace",
    Delete: "delete",
    ArrowUp: "arrowup",
    ArrowDown: "arrowdown",
    ArrowLeft: "arrowleft",
    ArrowRight: "arrowright",
    "/": "slash",
    "?": "?",
    ",": "comma",
  };
  key = map[key] || key.toLowerCase();
  if (key === "?" || (key === "slash" && e.shiftKey)) {
    key = "?"; // normalize Shift+? combos
  }
  parts.push(key);
  const result = parts.join("+");
  console.log("Event combo:", result); // Debug log
  return result;
}

function normalizeCombo(combo) {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean);
  const keys = new Set(parts);
  const order = ["ctrl", "meta", "alt", "shift"];
  const mods = order.filter((m) => keys.has(m));
  const rest = parts.filter((p) => !order.includes(p));
  const result = [...mods, ...rest].join("+");
  console.log("Normalized combo:", result); // Debug log
  return result;
}

export const HotkeysContext = createContext({
  registerShortcut: () => () => {},
  getShortcuts: () => [],
  shortcuts: [],
});

export function HotkeysProvider({ children }) {
  const navigate = useNavigate();
  const [shortcuts, setShortcuts] = useState([]);
  const shortcutsRef = useRef([]);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const registerShortcut = useCallback((def, callback) => {
    const entry = {
      combo: normalizeCombo(def.combo),
      description: def.description || "",
      scope: def.scope || "Global",
      allowInInput: !!def.allowInInput,
      callback,
    };
    setShortcuts((prev) => [...prev, entry]);
    return () => setShortcuts((prev) => prev.filter((s) => s !== entry));
  }, []);

  const getShortcuts = useCallback(() => {
    return shortcutsRef.current.map(({ combo, description, scope }) => ({
      combo,
      description,
      scope,
    }));
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const isEditable =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);

      const combo = normalizeCombo(eventToCombo(e));
      const match = shortcutsRef.current.find((s) => s.combo === combo);

      console.log("Looking for combo:", combo);
      console.log(
        "Available shortcuts:",
        shortcutsRef.current.map((s) => s.combo)
      );
      console.log("Match found:", !!match);

      if (!match) return;
      if (isEditable && !match.allowInInput) return;

      e.preventDefault();
      e.stopPropagation();
      try {
        match.callback(e);
      } catch {}
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  // Register default global navigation shortcuts once
  useEffect(() => {
    const unsubs = [];
    const add = (combo, path, description) =>
      registerShortcut(
        { combo, description, scope: "Global", allowInInput: false },
        () => navigate(path)
      );

    // Primary navigation shortcuts
    unsubs.push(add("alt+d", "/dashboard", "Go to Dashboard"));
    unsubs.push(add("alt+h", "/", "Go to Home"));

    // Customer related shortcuts
    unsubs.push(add("alt+c", "/customers", "Go to Customers"));
    unsubs.push(add("ctrl+alt+c", "/customer/add", "Add new customer"));

    // Vendor related shortcuts
    unsubs.push(add("alt+v", "/vendors", "Go to Vendors"));
    unsubs.push(add("ctrl+alt+v", "/vendor/add", "Add new vendor"));

    // Inventory shortcuts
    unsubs.push(add("alt+r", "/products", "Go to Products"));
    unsubs.push(add("alt+g", "/categories", "Go to Categories"));
    unsubs.push(add("alt+s", "/stock", "Go to Stock"));

    // Sales shortcuts
    unsubs.push(add("alt+i", "/invoices", "Go to Invoices"));
    unsubs.push(add("alt+n", "/invoice/add", "New invoice"));

    // Purchase shortcuts
    unsubs.push(add("alt+p", "/purchases", "Go to Purchases"));
    unsubs.push(add("ctrl+alt+p", "/purchase/add", "Add new purchase"));

    // Finance shortcuts
    unsubs.push(add("alt+y", "/payments", "Go to Payments"));

    // User management shortcuts
    unsubs.push(add("alt+u", "/users", "Go to Users"));
    unsubs.push(
      add("alt+o", "/roles-and-permissions", "Go to Roles & Permissions")
    );

    // Settings shortcuts
    unsubs.push(add("alt+comma", "/account-settings", "Account Settings"));
    unsubs.push(add("ctrl+comma", "/company-settings", "Company Settings"));

    // Help and shortcuts
    unsubs.push(add("shift+?", "/shortcuts", "Keyboard shortcuts help"));
    unsubs.push(add("ctrl+shift+k", "/shortcuts", "Show keyboard shortcuts"));

    return () => unsubs.forEach((u) => u && u());
  }, [navigate, registerShortcut]);

  const value = useMemo(
    () => ({ registerShortcut, getShortcuts, shortcuts }),
    [registerShortcut, getShortcuts, shortcuts]
  );

  return (
    <HotkeysContext.Provider value={value}>{children}</HotkeysContext.Provider>
  );
}

export default HotkeysProvider;
