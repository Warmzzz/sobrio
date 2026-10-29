import Dexie, { Table } from 'dexie';
import { UserPreferences } from '../core/preferences';
import { Injectable } from '@angular/core';
import { ConsumedDrink, DEFAULT_DRINKS, Drink } from '../core/drink';

@Injectable({ providedIn: 'root' })
export class AppDatabase extends Dexie {

  public preferences!: Table<UserPreferences, string>;
  public drinks!: Table<Drink, string>;
  public consumedDrinks!: Table<ConsumedDrink, string>;

  constructor() {
    super("SobrioDatabase");

    this.version(1).stores({
      preferences: 'id',
      drinks: 'id, name',
    });

    this.version(2).stores({
      consumedDrinks: 'id, consumedAt',
    });

    this.on("populate", async () => {
      await this.drinks.bulkAdd(DEFAULT_DRINKS);
    });

    // Ask the browser not to evict our data under storage pressure (all data lives only here)
    navigator.storage?.persist?.().catch(() => {});
  }
}
