import { toast } from "sonner";

const DEFAULT_DURATIONS = {
  positive: 2500,
  normal_negative: 2500,
  negative: 15000,
  warning: 4000,
  info: 5000,
};

export const showNotification = {
  success: (message, duration) =>
    toast.success(message, duration ?? DEFAULT_DURATIONS.positive),

  error: (message, duration) =>
    toast.error(message, duration ?? DEFAULT_DURATIONS.negative),

  warning: (message, duration) =>
    toast.warning(message, duration ?? DEFAULT_DURATIONS.warning),

  info: (message, duration) =>
    toast.info(message, duration ?? DEFAULT_DURATIONS.info),
};
