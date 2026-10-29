const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const concentrationFormat = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatConcentration(gPerL: number): string {
  return `${concentrationFormat.format(gPerL)} g/L`;
}

export function formatTime(date: Date, now: Date): string {
  const days = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
  const time = timeFormat.format(date);

  if (days === 1) return `demain à ${time}`;
  if (days === -1) return `hier à ${time}`;
  return time;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
