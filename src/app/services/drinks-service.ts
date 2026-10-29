import { inject, Injectable } from '@angular/core';
import { AppDatabase } from '../infrastructures/app.database';
import { Drink, DrinkInput } from '../core/drink';
import { getRandomUniqueId } from '../utils/random';

@Injectable({
  providedIn: 'root',
})
export class DrinksService {
  private readonly db = inject(AppDatabase);

  public getAll(): Promise<Drink[]> {
    return this.db.drinks.orderBy('name').toArray();
  }

  public async create(input: DrinkInput): Promise<Drink> {
    const drink: Drink = { ...this.validate(input), id: getRandomUniqueId(), isCustom: true };
    await this.db.drinks.add(drink);
    return drink;
  }

  public async update(id: string, input: DrinkInput): Promise<void> {
    const values = this.validate(input);

    await this.db.transaction('rw', this.db.drinks, async () => {
      const drink = await this.getCustomDrink(id);
      await this.db.drinks.put({ ...drink, ...values });
    });
  }

  public async delete(id: string): Promise<void> {
    await this.db.transaction('rw', this.db.drinks, async () => {
      await this.getCustomDrink(id);
      await this.db.drinks.delete(id);
    });
  }

  private async getCustomDrink(id: string): Promise<Drink> {
    const drink = await this.db.drinks.get(id);

    if (!drink) {
      throw new Error('Drink not found.');
    }

    if (!drink.isCustom) {
      throw new Error('Default drinks are read-only.');
    }

    return drink;
  }

  private validate({ name, volumeMl, alcoholPercentage }: DrinkInput): DrinkInput {
    const trimmedName = name.trim();

    if (trimmedName.length === 0 || trimmedName.length > 50) {
      throw new Error('Invalid drink name: must be between 1 and 50 characters.');
    }

    if (!Number.isFinite(volumeMl) || volumeMl < 1 || volumeMl > 5000) {
      throw new Error('Invalid drink volume: must be between 1 and 5000 ml.');
    }

    if (!Number.isFinite(alcoholPercentage) || alcoholPercentage < 0 || alcoholPercentage > 100) {
      throw new Error('Invalid alcohol percentage: must be between 0 and 100.');
    }

    return { name: trimmedName, volumeMl, alcoholPercentage };
  }
}
