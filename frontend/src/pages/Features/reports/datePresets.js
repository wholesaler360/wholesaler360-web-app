import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";

export const DATE_PRESETS = [
  // { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisQuarter", label: "This Quarter" },
  { key: "lastQuarter", label: "Last Quarter" },
  { key: "thisYear", label: "This Year" },
  { key: "lastYear", label: "Last Year" },
  { key: "custom", label: "Custom" },
];

export function computePresetRange(presetKey) {
  const today = new Date();

  switch (presetKey) {
    case "thisMonth":
      return { from: startOfMonth(today), to: endOfMonth(today) };

    case "lastMonth": {
      const d = subMonths(today, 1);
      return { from: startOfMonth(d), to: endOfMonth(d) };
    }

    case "thisQuarter":
      return { from: startOfQuarter(today), to: endOfQuarter(today) };

    case "lastQuarter": {
      const d = subQuarters(today, 1);
      return { from: startOfQuarter(d), to: endOfQuarter(d) };
    }

    case "thisYear":
      return { from: startOfYear(today), to: endOfYear(today) };

    case "lastYear": {
      const d = subYears(today, 1);
      return { from: startOfYear(d), to: endOfYear(d) };
    }

    default:
      return { from: undefined, to: undefined };
  }
}
