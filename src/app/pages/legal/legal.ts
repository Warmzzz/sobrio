import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEGAL_TERMS_VERSION, MINIMUM_AGE, PUBLISHER } from '../../core/legal';
import { LEGISLATIONS } from '../../core/legislation';
import { formatNumber } from '../../utils/format';

@Component({
  selector: 'app-legal',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal {
  protected readonly version = LEGAL_TERMS_VERSION;
  protected readonly minimumAge = MINIMUM_AGE;
  protected readonly publisher = PUBLISHER;
  protected readonly legislations = LEGISLATIONS;
  protected readonly formatNumber = formatNumber;
}
