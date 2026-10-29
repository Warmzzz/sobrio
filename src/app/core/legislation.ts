import { Legislation } from './preferences';

export interface LegislationInfo {
  value: Legislation;
  label: string;
  drivingLimitGPerL: number;
}

export const LEGISLATIONS: LegislationInfo[] = [
  { value: 'be', label: 'Belgique', drivingLimitGPerL: 0.5 },
  { value: 'fr', label: 'France', drivingLimitGPerL: 0.5 },
  { value: 'ch', label: 'Suisse', drivingLimitGPerL: 0.5 },
  { value: 'ca', label: 'Canada', drivingLimitGPerL: 0.8 },
];

export function getLegislation(value: Legislation): LegislationInfo {
  return LEGISLATIONS.find((legislation) => legislation.value === value) ?? LEGISLATIONS[0];
}
