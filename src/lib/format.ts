export function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function relativeDate(value: string) {
  const date = new Date(value);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);

  if (Math.abs(days) < 1) {
    return "today";
  }

  if (Math.abs(days) < 31) {
    return formatter.format(days, "day");
  }

  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) {
    return formatter.format(months, "month");
  }

  return formatter.format(Math.round(months / 12), "year");
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
