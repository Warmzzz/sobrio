import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { ConsumedDrink } from '../../core/drink';
import { formatNumber } from '../../utils/format';

@Component({
  selector: 'app-consumption-item',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consumption-item.html',
  styleUrl: './consumption-item.scss',
})
export class ConsumptionItem {
  public readonly consumption = input.required<ConsumedDrink>();
  public readonly time = input.required<string>();

  public readonly remove = output<ConsumedDrink>();

  protected readonly formatNumber = formatNumber;
}
