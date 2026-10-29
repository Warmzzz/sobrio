import { Injectable } from '@angular/core';
import { AppDatabase } from '../infrastructures/app.database';
import { hasAcceptedCurrentTerms, LEGAL_TERMS_VERSION, MINIMUM_AGE } from '../core/legal';
import { LEGISLATIONS } from '../core/legislation';
import { Biometrics, createDefaultPreferences, Legislation, UserPreferences } from '../core/preferences';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  constructor(private db: AppDatabase) {}

  public async getBiometrics(): Promise<Biometrics> {
    const preferences = await this.getPreferences();
    return preferences.biometrics;
  }

  public async setBiometrics(biometrics: Biometrics): Promise<void> {
    if(biometrics.age < MINIMUM_AGE || biometrics.weightKg < 40) {
      throw new Error(`Invalid biometrics: age must be at least ${MINIMUM_AGE} and weight must be at least 40 kg.`);
    }

    const preferences = await this.getPreferences();
    preferences.biometrics = biometrics;
    await this.db.preferences.put(preferences);
  }

  public async getLegislation(): Promise<Legislation> {
    const preferences = await this.getPreferences();
    return preferences.legislation;
  }

  public async setLegislation(legislation: Legislation): Promise<void> {
    if (!LEGISLATIONS.some((item) => item.value === legislation)) {
      throw new Error(`Invalid legislation: ${legislation}`);
    }

    const preferences = await this.getPreferences();
    preferences.legislation = legislation;
    await this.db.preferences.put(preferences);
  }

  public async hasAcceptedLegalTerms(): Promise<boolean> {
    const preferences = await this.getPreferences();
    return hasAcceptedCurrentTerms(preferences.legalAcceptance);
  }

  public async acceptLegalTerms(): Promise<void> {
    const preferences = await this.getPreferences();
    preferences.legalAcceptance = { version: LEGAL_TERMS_VERSION, acceptedAt: new Date() };
    await this.db.preferences.put(preferences);
  }

  private async getPreferences(): Promise<UserPreferences> {
    const preferences = await this.db.preferences.get("current");
    return { ...createDefaultPreferences(), ...preferences };
  }
}
