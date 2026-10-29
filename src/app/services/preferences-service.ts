import { Injectable } from '@angular/core';
import { AppDatabase } from '../infrastructures/app.database';
import { Biometrics, createDefaultPreferences, UserPreferences } from '../core/preferences';

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
    if(biometrics.age < 12 || biometrics.weightKg < 40) {
      throw new Error('Invalid biometrics: age must be at least 12 and weight must be at least 40 kg.');
    }

    const preferences = await this.getPreferences();
    preferences.biometrics = biometrics;
    await this.db.preferences.put(preferences);
  }

  private async getPreferences(): Promise<UserPreferences> {
    const preferences = await this.db.preferences.get("current");
    return preferences || createDefaultPreferences();
  }
}
