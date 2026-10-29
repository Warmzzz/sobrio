import { AlcoholCalculator, createPrudentCalculator } from './alcohol-calculator';
import { ConsumedDrink } from './drink';
import { Biometrics } from './preferences';

const biometrics: Biometrics = { sex: 'male', age: 25, weightKg: 70 };
const start = new Date('2026-01-01T20:00:00Z');
const at = (minutes: number) => new Date(start.getTime() + minutes * 60_000);
const beer = (minutes: number, volumeMl = 500): ConsumedDrink => ({
  id: `beer-${minutes}`,
  drink: { id: 'beer', name: 'Bière', volumeMl, alcoholPercentage: 5, isCustom: false },
  consumedVolumeMl: volumeMl,
  consumedAt: at(minutes),
});

describe('AlcoholCalculator', () => {
  const calculator = new AlcoholCalculator(biometrics);

  it('returns zero before any drink', () => {
    expect(calculator.estimateAt([beer(60)], at(30)).concentrationGPerL).toBe(0);
  });

  it('applies Widmark with blood density when absorption is instant', () => {
    const instant = new AlcoholCalculator(biometrics, { absorptionRate: 1000, eliminationRate: 1e-9 });
    const expected = (500 * 0.05 * 0.789) / ((0.68 * 70) / 1.055);
    expect(instant.estimateAt([beer(0)], at(10)).concentrationGPerL).toBeCloseTo(expected, 4);
  });

  it('matches the integrated Michaelis-Menten solution', () => {
    const instant = new AlcoholCalculator(biometrics, { absorptionRate: 1000 });
    const drinks = [beer(0, 1000), beer(0, 1000)];
    const c0 = instant.estimateAt(drinks, at(10)).concentrationGPerL;
    const c = instant.estimateAt(drinks, at(130)).concentrationGPerL;
    // Km·ln(C0/C) + (C0 − C) = Vmax·t
    expect(0.1 * Math.log(c0 / c) + (c0 - c)).toBeCloseTo(0.18 * 2, 4);
  });

  it('absorbs everything and eliminates it eventually', () => {
    const estimate = calculator.estimateAt([beer(0)], at(12 * 60));
    expect(estimate.consumedEthanolGrams).toBeCloseTo(19.725, 3);
    expect(estimate.unabsorbedEthanolGrams).toBeLessThan(1e-6);
    expect(estimate.concentrationGPerL).toBeLessThan(1e-3);
  });

  it('returns the last downward crossing when drinking again later', () => {
    const drinks = [beer(0, 1500), beer(5 * 60, 1500)];
    const result = calculator.estimateTimeBelowThreshold(drinks, 0.2, at(24 * 60));
    expect(result).not.toBeNull();
    expect(result!.estimatedAt.getTime()).toBeGreaterThan(at(5 * 60).getTime());
    expect(calculator.estimateAt(drinks, result!.estimatedAt).concentrationGPerL).toBeCloseTo(0.2, 3);
  });

  it('returns null when still above the threshold at the horizon', () => {
    expect(calculator.estimateTimeBelowThreshold([beer(0, 1500)], 0.2, at(60))).toBeNull();
  });

  it('rejects invalid input', () => {
    expect(() => new AlcoholCalculator({ ...biometrics, weightKg: 0 })).toThrow();
    expect(() => calculator.estimateAt([{ ...beer(0), consumedVolumeMl: -1 }], at(10))).toThrow();
    expect(() => calculator.estimateTimeBelowThreshold([beer(0)], 0, at(60))).toThrow();
  });

  it('prudent calculator never estimates less alcohol nor an earlier return under a threshold', () => {
    const drinks = [beer(0), beer(30), beer(60)];
    const prudent = createPrudentCalculator(biometrics);

    for (const minutes of [15, 45, 90, 180, 300, 480]) {
      expect(prudent.estimateAt(drinks, at(minutes)).concentrationGPerL).toBeGreaterThanOrEqual(
        calculator.estimateAt(drinks, at(minutes)).concentrationGPerL,
      );
    }

    for (const threshold of [0.5, 0.2, 0.01]) {
      const standard = calculator.estimateTimeBelowThreshold(drinks, threshold, at(48 * 60));
      const careful = prudent.estimateTimeBelowThreshold(drinks, threshold, at(48 * 60));
      expect(careful!.estimatedAt.getTime()).toBeGreaterThan(standard?.estimatedAt.getTime() ?? 0);
    }
  });
});
