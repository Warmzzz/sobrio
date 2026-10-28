import { Biometrics } from './preferences';
import { ConsumedDrink } from './drink';

export interface AlcoholCalculatorOptions {
  distributionFactor?: number;
  eliminationRate?: number;
  michaelisConstant?: number;
  absorptionRate?: number;
  stepMinutes?: number;
}

export interface AlcoholEstimate {
  concentrationGPerL: number;
  consumedEthanolGrams: number;
  unabsorbedEthanolGrams: number;
}

export interface ThresholdEstimate {
  estimatedAt: Date;
  concentrationGPerL: number;
  calculatedPeakGPerL: number;
}

interface CalculationPoint {
  timeMs: number;
  concentrationGPerL: number;
}

interface InternalCalculation {
  estimate: AlcoholEstimate;
  points: CalculationPoint[];
}

interface Dose {
  timeMs: number;
  ethanolGrams: number;
}

const ETHANOL_DENSITY_G_PER_ML = 0.789;
const BLOOD_DENSITY_KG_PER_L = 1.055;
const MALE_DISTRIBUTION_FACTOR = 0.68;
const FEMALE_DISTRIBUTION_FACTOR = 0.55;
const DEFAULT_MAX_ELIMINATION_RATE = 0.18;
const DEFAULT_MICHAELIS_CONSTANT = 0.1;
const DEFAULT_ABSORPTION_RATE = 1.5;
const NEGLIGIBLE = 1e-6;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

export class AlcoholCalculator {
  private readonly distributionVolumeL: number;
  private readonly eliminationRate: number;
  private readonly michaelisConstant: number;
  private readonly absorptionRate: number;
  private readonly stepMs: number;

  constructor(biometrics: Biometrics, options: AlcoholCalculatorOptions = {}) {
    const distributionFactor =
      options.distributionFactor ??
      (biometrics.sex === 'male' ? MALE_DISTRIBUTION_FACTOR : FEMALE_DISTRIBUTION_FACTOR);

    this.eliminationRate = options.eliminationRate ?? DEFAULT_MAX_ELIMINATION_RATE;
    this.michaelisConstant = options.michaelisConstant ?? DEFAULT_MICHAELIS_CONSTANT;
    this.absorptionRate = options.absorptionRate ?? DEFAULT_ABSORPTION_RATE;
    const stepMinutes = options.stepMinutes ?? 1;

    for (const value of [
      biometrics.weightKg,
      distributionFactor,
      this.eliminationRate,
      this.michaelisConstant,
      this.absorptionRate,
      stepMinutes,
    ]) {
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Invalid biometrics or calculation parameters.');
      }
    }

    this.distributionVolumeL = (distributionFactor * biometrics.weightKg) / BLOOD_DENSITY_KG_PER_L;
    this.stepMs = Math.min(stepMinutes * MINUTE_MS, (0.1 / this.absorptionRate) * HOUR_MS);
  }

  public estimateAt(drinks: ConsumedDrink[], targetAt: Date): AlcoholEstimate {
    return this.calculate(this.toDoses(drinks), targetAt).estimate;
  }

  public estimateTimeBelowThreshold(drinks: ConsumedDrink[], thresholdGPerL: number, horizonEnd: Date): ThresholdEstimate | null {
    if (!Number.isFinite(thresholdGPerL) || thresholdGPerL <= 0 || !Number.isFinite(horizonEnd.getTime())) {
      throw new Error('Invalid threshold or horizon.');
    }

    const { points } = this.calculate(this.toDoses(drinks), horizonEnd);

    let peak = 0;
    for (const point of points) {
      peak = Math.max(peak, point.concentrationGPerL);
    }

    if (peak <= thresholdGPerL || points[points.length - 1].concentrationGPerL > thresholdGPerL) {
      return null;
    }

    for (let i = points.length - 1; i > 0; i--) {
      const previous = points[i - 1];
      const current = points[i];

      if (previous.concentrationGPerL > thresholdGPerL && current.concentrationGPerL <= thresholdGPerL) {
        const fraction = (previous.concentrationGPerL - thresholdGPerL) / (previous.concentrationGPerL - current.concentrationGPerL);

        return {
          estimatedAt: new Date(previous.timeMs + fraction * (current.timeMs - previous.timeMs)),
          concentrationGPerL: thresholdGPerL,
          calculatedPeakGPerL: peak,
        };
      }
    }

    return null;
  }

  private toDoses(drinks: ConsumedDrink[]): Dose[] {
    return drinks.map(consumedDrink => {
      const { drink, consumedVolumeMl, consumedAt } = consumedDrink;
      const timeMs = consumedAt.getTime();

      if (
        !Number.isFinite(timeMs) ||
        !Number.isFinite(consumedVolumeMl) ||
        consumedVolumeMl < 0 ||
        !Number.isFinite(drink.alcoholPercentage) ||
        drink.alcoholPercentage < 0 ||
        drink.alcoholPercentage > 100
      ) {
        throw new Error(`Invalid drink: ${drink.name}.`);
      }

      return {
        timeMs,
        ethanolGrams: consumedVolumeMl * (drink.alcoholPercentage / 100) * ETHANOL_DENSITY_G_PER_ML,
      };
    });
  }

  private calculate(allDoses: Dose[], targetAt: Date): InternalCalculation {
    const targetMs = targetAt.getTime();
    const doses = allDoses.filter((dose) => dose.timeMs <= targetMs).sort((a, b) => a.timeMs - b.timeMs);
    const totalEthanol = doses.reduce((sum, dose) => sum + dose.ethanolGrams, 0);

    if (doses.length === 0) {
      return {
        estimate: { concentrationGPerL: 0, consumedEthanolGrams: 0, unabsorbedEthanolGrams: 0 },
        points: [{ timeMs: targetMs, concentrationGPerL: 0 }],
      };
    }

    let timeMs = doses[0].timeMs;
    let doseIndex = 0;
    let gutEthanolGrams = 0;
    let concentration = 0;
    const points: CalculationPoint[] = [{ timeMs, concentrationGPerL: 0 }];

    while (timeMs < targetMs) {
      while (doseIndex < doses.length && doses[doseIndex].timeMs <= timeMs) {
        gutEthanolGrams += doses[doseIndex].ethanolGrams;
        doseIndex++;
      }

      const nextDoseMs = doseIndex < doses.length ? doses[doseIndex].timeMs : targetMs;
      const isSober = gutEthanolGrams < NEGLIGIBLE && concentration < NEGLIGIBLE;
      const nextTimeMs = Math.min(isSober ? nextDoseMs : timeMs + this.stepMs, nextDoseMs, targetMs);
      const dtHours = (nextTimeMs - timeMs) / HOUR_MS;

      if (isSober) {
        gutEthanolGrams = 0;
        concentration = 0;
      } else {
        concentration = this.integrateConcentration(concentration, gutEthanolGrams, dtHours);
        gutEthanolGrams *= Math.exp(-this.absorptionRate * dtHours);
      }

      timeMs = nextTimeMs;
      points.push({ timeMs, concentrationGPerL: concentration });
    }

    return {
      estimate: {
        concentrationGPerL: concentration,
        consumedEthanolGrams: totalEthanol,
        unabsorbedEthanolGrams: gutEthanolGrams,
      },
      points,
    };
  }

  private integrateConcentration(concentration: number, gutEthanolGrams: number, dtHours: number): number {
    const ka = this.absorptionRate;
    const derivative = (t: number, c: number): number => {
      const input = (ka * gutEthanolGrams * Math.exp(-ka * t)) / this.distributionVolumeL;
      const cPositive = Math.max(0, c);
      return input - (this.eliminationRate * cPositive) / (this.michaelisConstant + cPositive);
    };

    const h = dtHours;
    const k1 = derivative(0, concentration);
    const k2 = derivative(h / 2, concentration + (h / 2) * k1);
    const k3 = derivative(h / 2, concentration + (h / 2) * k2);
    const k4 = derivative(h, concentration + h * k3);

    return Math.max(0, concentration + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4));
  }
}
