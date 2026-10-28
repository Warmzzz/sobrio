import Dexie, { Table } from 'dexie';
import { UserPreferences } from '../core/preferences';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppDatabase extends Dexie {

  public preferences!: Table<UserPreferences, string>;

  constructor() {
    super("SobrioDatabase");

    this.version(1).stores({
      preferences: "id",
    });
  }
}