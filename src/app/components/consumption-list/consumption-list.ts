import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ConsumptionItem } from '../consumption-item/consumption-item';
import { ConsumedDrink, getEthanolGrams, STANDARD_DRINK_GRAMS } from '../../core/drink';
import { formatNumber, formatTime } from '../../utils/format';

@Component({
  selector: 'app-consumption-list',
  imports: [ConsumptionItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consumption-list.html',
  styleUrl: './consumption-list.scss',
})
export class ConsumptionList {
  public readonly consumptions = input.required<ConsumedDrink[]>();
  public readonly now = input.required<number>();

  public readonly remove = output<ConsumedDrink>();

  protected readonly formatNumber = formatNumber;

  protected readonly totalGrams = computed(() =>
    this.consumptions().reduce(
      (sum, { drink, consumedVolumeMl }) => sum + getEthanolGrams(consumedVolumeMl, drink.alcoholPercentage),
      0,
    ),
  );

  protected readonly standardDrinks = computed(() => this.totalGrams() / STANDARD_DRINK_GRAMS);

  protected time(consumption: ConsumedDrink): string {
    return formatTime(consumption.consumedAt, new Date(this.now()));
  }
}
