import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Drink } from '../../core/drink';

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

@Component({
  selector: 'app-drink-item',
  imports: [Button, Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drink-item.html',
  styleUrl: './drink-item.scss',
})
export class DrinkItem {
  public readonly drink = input.required<Drink>();

  public readonly edit = output<Drink>();
  public readonly remove = output<Drink>();

  protected readonly details = computed(() => {
    const { volumeMl, alcoholPercentage } = this.drink();
    return `${numberFormat.format(volumeMl)} ml · ${numberFormat.format(alcoholPercentage)} %`;
  });
}
