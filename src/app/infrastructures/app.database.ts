import Dexie, { Table } from 'dexie';
import { UserPreferences } from '../core/preferences';
import { Injectable } from '@angular/core';
import { DEFAULT_DRINKS, Drink } from '../core/drink';

@Injectable({ providedIn: 'root' })
export class AppDatabase extends Dexie {

  public preferences!: Table<UserPreferences, string>;
  public drinks!: Table<Drink, string>;

  constructor() {
    super("SobrioDatabase");

    this.version(1).stores({
      preferences: 'id',
      drinks: 'id, name',
    });
    
    this.on("populate", async () => {
      await this.drinks.bulkAdd(DEFAULT_DRINKS);
    });
  }
}