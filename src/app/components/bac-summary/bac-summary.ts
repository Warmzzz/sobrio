import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Message } from 'primeng/message';
import { createPrudentCalculator } from '../../core/alcohol-calculator';
import { ConsumedDrink } from '../../core/drink';
import { LegislationInfo } from '../../core/legislation';
import { Biometrics } from '../../core/preferences';
import { formatConcentration, formatNumber, formatTime } from '../../utils/format';

const GAUGE_MAX = 1;
const HORIZON_MS = 48 * 3_600_000;
const NEAR_ZERO = 0.01;
const ABSORBING_GRAMS = 0.5;
const DANGER_LEVEL = 2;

interface ThresholdStatus {
  label: string;
  text: string;
  pending: boolean;
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
  public readonly legislation = input.required<LegislationInfo>();

  protected readonly limit = computed(() => this.legislation().drivingLimitGPerL);
  protected readonly formattedLimit = computed(() => formatNumber(this.limit()));
  protected readonly limitPercent = computed(() => (this.limit() / GAUGE_MAX) * 100);

  private readonly calculator = computed(() => createPrudentCalculator(this.biometrics()));
  private readonly estimate = computed(() =>
    this.calculator().estimateAt(this.consumptions(), new Date(this.now())),
  );

  protected readonly concentration = computed(() => this.estimate().concentrationGPerL);
  protected readonly formattedConcentration = computed(() => formatConcentration(this.concentration()));
  protected readonly isAbsorbing = computed(() => this.estimate().unabsorbedEthanolGrams >= ABSORBING_GRAMS);
  protected readonly isDangerous = computed(() => this.concentration() >= DANGER_LEVEL);
  protected readonly gaugePercent = computed(() => (Math.min(this.concentration(), GAUGE_MAX) / GAUGE_MAX) * 100);

  protected readonly thresholds = computed(() => [
    this.getThresholdStatus(this.limit(), `Sous ${this.formattedLimit()} g/L`),
    this.getThresholdStatus(NEAR_ZERO, 'Proche de 0 g/L'),
  ]);

  protected readonly isOverLimit = computed(() => this.concentration() >= this.limit());
  protected readonly willExceedLimit = computed(() => !this.isOverLimit() && this.thresholds()[0].pending);
  protected readonly hasAlcohol = computed(() => this.concentration() >= NEAR_ZERO || this.isAbsorbing());

  protected readonly status = computed(() => {
    if (this.isOverLimit()) return `Au-dessus de la limite légale (${this.formattedLimit()} g/L) : ne prends pas le volant`;
    if (this.willExceedLimit()) return `Ton taux va dépasser ${this.formattedLimit()} g/L : ne prends pas le volant`;
    if (this.hasAlcohol()) return 'Alcool encore présent dans ton sang : ne prends pas le volant';
    return 'Aucun alcool estimé';
  });

  protected readonly profile = computed(() => {
    const { sex, weightKg } = this.biometrics();
    return `${sex === 'male' ? 'homme' : 'femme'}, ${formatNumber(weightKg)} kg`;
  });

  private getThresholdStatus(threshold: number, label: string): ThresholdStatus {
    const now = new Date(this.now());
    const crossing = this.calculator().estimateTimeBelowThreshold(
      this.consumptions(),
      threshold,
      new Date(now.getTime() + HORIZON_MS),
    );

    if (crossing && crossing.estimatedAt > now) {
      return { label, text: `pas avant ${formatTime(crossing.estimatedAt, now)}`, pending: true };
    }

    if (this.concentration() >= threshold) {
      return { label, text: 'pas avant 48 h', pending: true };
    }

    return { label, text: 'Déjà en dessous', pending: false };
  }
}
