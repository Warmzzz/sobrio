
export interface Drink {
  id: string;
  name: string;
  volumeMl: number;
  alcoholPercentage: number;
  isCustom: boolean;
}

export interface ConsumedDrink {
  drink: Drink;
  consumedVolumeMl: number;
  consumedAt: Date;
}

export const DEFAULT_DRINKS: Drink[] = [
  {
    id: '3750ff78-7c1e-48c7-9275-33015241dec3',
    name: 'Bière (33cl)',
    volumeMl: 330,
    alcoholPercentage: 5,
    isCustom: false,
  },
  {
    id: 'e249be11-646a-4e04-989c-c94625f540d9',
    name: 'Vin (12cl)',
    volumeMl: 120,
    alcoholPercentage: 12,
    isCustom: false,
  },
  {
    id: '665e316d-3a31-4c7b-9d2a-a71036e99858',
    name: 'Spiritueux (4cl)',
    volumeMl: 40,
    alcoholPercentage: 40,
    isCustom: false,
  },
];