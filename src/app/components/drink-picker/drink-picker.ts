import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Drink } from '../../core/drink';
import { formatNumber } from '../../utils/format';

@Component({
  selector: 'app-drink-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drink-picker.html',
  styleUrl: './drink-picker.scss',
})
export class DrinkPicker {
  public readonly drinks = input.required<Drink[]>();

  public readonly pick = output<Drink>();

  protected readonly formatNumber = formatNumber;
}
