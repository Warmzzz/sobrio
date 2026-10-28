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

  private async getPreferences(): Promise<UserPreferences> {
    const preferences = await this.db.preferences.get("current");
    return preferences || createDefaultPreferences();
  }
}
