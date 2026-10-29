import { Legislation } from './preferences';

export interface LegislationInfo {
  value: Legislation;
  label: string;
  drivingLimitGPerL: number;
  stricterLimits: string;
}

export const LEGISLATIONS: LegislationInfo[] = [
  {
    value: 'be',
    label: 'Belgique',
    drivingLimitGPerL: 0.5,
    stricterLimits: 'Limite abaissée à 0,2 g/L pour les conducteurs professionnels.',
  },
  {
    value: 'fr',
    label: 'France',
    drivingLimitGPerL: 0.5,
    stricterLimits: 'Limite abaissée à 0,2 g/L en permis probatoire et pour les conducteurs de transport en commun.',
  },
  {
    value: 'ch',
    label: 'Suisse',
    drivingLimitGPerL: 0.5,
    stricterLimits:
      'Limite abaissée à 0,1 g/L pour les élèves conducteurs, le permis à l’essai et les conducteurs professionnels.',
  },
  {
    value: 'ca',
    label: 'Canada',
    drivingLimitGPerL: 0.5,
    stricterLimits:
      'La limite du Code criminel est de 0,8 g/L, mais la plupart des provinces sanctionnent dès 0,5 g/L et imposent 0 alcool aux nouveaux et jeunes conducteurs.',
  },
];

export function getLegislation(value: Legislation): LegislationInfo {
  return LEGISLATIONS.find((legislation) => legislation.value === value) ?? LEGISLATIONS[0];
}
