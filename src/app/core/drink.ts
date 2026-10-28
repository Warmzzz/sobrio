
export interface Drink {
  id: string;
  name: string;
  volumeMl: number;
  alcoholPercentage: number;
}

export interface ConsumedDrink {
  drink: Drink;
  consumedVolumeMl: number;
  consumedAt: Date;
}