/** Format an ISO date (YYYY-MM-DD) as e.g. "Wed, Jul 16". */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Trim trailing ".0" so 140.0 -> "140" but 2.5 stays "2.5". */
export function num(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function weight(n: number, unit: string): string {
  return `${num(n)} ${unit}`;
}
