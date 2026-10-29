
export type Sex = 'male' | 'female';

export function isSex(value: any): value is Sex {
  return value === 'male' || value === 'female';
}

export interface Biometrics {
  sex: Sex;
  age: number;
  weightKg: number;
}

export type Legislation = "be" | "fr" | "ch" | "ca";

export interface UserPreferences {
  id: string;
  biometrics: Biometrics;
  legislation: Legislation;
}

export function createDefaultPreferences(): UserPreferences {
  return {
    id: "current",
    biometrics: {
      sex: "male",
      age: 25,
      weightKg: 70,
    },
    legislation: "be",
  };
}