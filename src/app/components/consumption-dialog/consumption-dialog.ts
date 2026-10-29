import { ChangeDetectionStrategy, Component, effect, input, model, output, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { Drink } from '../../core/drink';
import { formatNumber } from '../../utils/format';

export interface ConsumptionInput {
  consumedVolumeMl: number;
  minutesAgo: number;
}

@Component({
  selector: 'app-consumption-dialog',
  imports: [ReactiveFormsModule, Button, Dialog, InputNumber, Message],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consumption-dialog.html',
  styleUrl: './consumption-dialog.scss',
})
export class ConsumptionDialog {
  public readonly visible = model(false);
  public readonly drink = input<Drink | null>(null);
  public readonly saving = input(false);

  public readonly add = output<ConsumptionInput>();

  protected readonly formatNumber = formatNumber;

  protected readonly whenOptions = [
    { label: 'Maintenant', value: 0 },
    { label: 'Il y a 15 min', value: 15 },
    { label: 'Il y a 30 min', value: 30 },
    { label: 'Il y a 1 h', value: 60 },
  ];

  protected readonly form = new FormGroup({
    consumedVolumeMl: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(5000)],
    }),
    minutesAgo: new FormControl(0, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        return;
      }

      const drink = this.drink();

      untracked(() => this.form.reset({ consumedVolumeMl: drink?.volumeMl ?? null, minutesAgo: 0 }));
    });
  }

  protected isInvalid(): boolean {
    const control = this.form.controls.consumedVolumeMl;
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    const { consumedVolumeMl, minutesAgo } = this.form.getRawValue();

    if (this.form.invalid || consumedVolumeMl === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.add.emit({ consumedVolumeMl, minutesAgo });
  }
}
