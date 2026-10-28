
export type Sex = 'male' | 'female';

export interface Biometrics {
  sex: Sex;
  age: number;
  weightKg: number;
}

export interface UserPreferences {
  id: string;
  biometrics: Biometrics;
}

export function createDefaultPreferences(): UserPreferences {
  return {
    id: "current",
    biometrics: {
      sex: "male",
      age: 25,
      weightKg: 70,
    },
  };
}