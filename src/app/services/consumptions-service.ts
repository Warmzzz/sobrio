import { inject, Injectable } from '@angular/core';
import { AppDatabase } from '../infrastructures/app.database';
import { ConsumedDrink, Drink } from '../core/drink';
import { getRandomUniqueId } from '../utils/random';

const MAX_CLOCK_SKEW_MS = 60_000;

@Injectable({
  providedIn: 'root',
})
export class ConsumptionsService {
  private readonly db = inject(AppDatabase);

  public getSince(since: Date): Promise<ConsumedDrink[]> {
    return this.db.consumedDrinks.where('consumedAt').aboveOrEqual(since).sortBy('consumedAt');
  }

  public async add(drink: Drink, consumedVolumeMl: number, consumedAt: Date): Promise<ConsumedDrink> {
    if (!Number.isFinite(consumedVolumeMl) || consumedVolumeMl < 1 || consumedVolumeMl > 5000) {
      throw new Error('Invalid consumed volume: must be between 1 and 5000 ml.');
    }

    if (!Number.isFinite(consumedAt.getTime()) || consumedAt.getTime() > Date.now() + MAX_CLOCK_SKEW_MS) {
      throw new Error('Invalid consumption date: must not be in the future.');
    }

    const consumedDrink: ConsumedDrink = {
      id: getRandomUniqueId(),
      drink: { ...drink },
      consumedVolumeMl,
      consumedAt,
    };

    await this.db.consumedDrinks.add(consumedDrink);
    return consumedDrink;
  }

  public async delete(id: string): Promise<void> {
    await this.db.consumedDrinks.delete(id);
  }
}
