export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function formatRelativeDate(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(hours) < 1) return relative.format(Math.round(minutes), "minute");
  if (Math.abs(days) < 1) return relative.format(Math.round(hours), "hour");
  if (Math.abs(days) < 30) return relative.format(Math.round(days), "day");
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short" });
}
