import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Message } from 'primeng/message';
import { AlcoholCalculator } from '../../core/alcohol-calculator';
import { ConsumedDrink } from '../../core/drink';
import { Biometrics } from '../../core/preferences';
import { formatConcentration, formatNumber, formatTime } from '../../utils/format';

const LEGAL_LIMIT = 0.5;
const THRESHOLDS = [0.5, 0.2];
const GAUGE_MAX = 1;
const HORIZON_MS = 48 * 3_600_000;
const SOBER_BELOW = 0.01;
const ABSORBING_GRAMS = 0.5;

interface ThresholdStatus {
  label: string;
  text: string;
  reached: boolean;
}

@Component({
  selector: 'app-bac-summary',
  imports: [RouterLink, Message],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bac-summary.html',
  styleUrl: './bac-summary.scss',
})
export class BacSummary {
  public readonly consumptions = input.required<ConsumedDrink[]>();
  public readonly biometrics = input.required<Biometrics>();
  public readonly now = input.required<number>();

  private readonly calculator = computed(() => new AlcoholCalculator(this.biometrics()));
  private readonly estimate = computed(() =>
    this.calculator().estimateAt(this.consumptions(), new Date(this.now())),
  );

  protected readonly concentration = computed(() => this.estimate().concentrationGPerL);
  protected readonly formattedConcentration = computed(() => formatConcentration(this.concentration()));
  protected readonly isAbsorbing = computed(() => this.estimate().unabsorbedEthanolGrams >= ABSORBING_GRAMS);
  protected readonly gaugePercent = computed(() => (Math.min(this.concentration(), GAUGE_MAX) / GAUGE_MAX) * 100);

  protected readonly thresholds = computed(() => THRESHOLDS.map((threshold) => this.getThresholdStatus(threshold)));

  protected readonly isOverLimit = computed(() => this.concentration() >= LEGAL_LIMIT);
  protected readonly willExceedLimit = computed(() => !this.isOverLimit() && !this.thresholds()[0].reached);
  protected readonly mustNotDrive = computed(() => this.isOverLimit() || this.willExceedLimit());

  protected readonly status = computed(() => {
    if (this.isOverLimit()) return 'Au-dessus de la limite légale : ne prends pas le volant';
    if (this.willExceedLimit()) return 'Ton taux va dépasser 0,5 g/L : ne prends pas le volant';
    if (this.concentration() < SOBER_BELOW) return 'Aucun alcool estimé';
    return 'Sous la limite légale de 0,5 g/L';
  });

  protected readonly profile = computed(() => {
    const { sex, weightKg } = this.biometrics();
    return `${sex === 'male' ? 'homme' : 'femme'}, ${formatNumber(weightKg)} kg`;
  });

  private getThresholdStatus(threshold: number): ThresholdStatus {
    const now = new Date(this.now());
    const label = `Sous ${formatNumber(threshold)} g/L`;
    const crossing = this.calculator().estimateTimeBelowThreshold(
      this.consumptions(),
      threshold,
      new Date(now.getTime() + HORIZON_MS),
    );

    if (crossing && crossing.estimatedAt > now) {
      return { label, text: `vers ${formatTime(crossing.estimatedAt, now)}`, reached: false };
    }

    if (this.concentration() >= threshold) {
      return { label, text: 'dans plus de 48 h', reached: false };
    }

    return { label, text: 'Atteint', reached: true };
  }
}
