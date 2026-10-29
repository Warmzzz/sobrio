import { ConsumedDrink, getEthanolGrams } from './drink';

export interface DayGroup {
  day: Date;
  consumptions: ConsumedDrink[];
  ethanolGrams: number;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function groupByDay(consumptions: ConsumedDrink[]): DayGroup[] {
  const groups = new Map<number, DayGroup>();
  const newestFirst = [...consumptions].sort((a, b) => b.consumedAt.getTime() - a.consumedAt.getTime());

  for (const consumption of newestFirst) {
    const day = startOfDay(consumption.consumedAt);
    const group = groups.get(day.getTime()) ?? { day, consumptions: [], ethanolGrams: 0 };

    group.consumptions.push(consumption);
    group.ethanolGrams += getEthanolGrams(consumption.consumedVolumeMl, consumption.drink.alcoholPercentage);
    groups.set(day.getTime(), group);
  }

  return [...groups.values()];
}
