import { ChangeDetectionStrategy, Component, effect, input, model, output, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Drink, DrinkInput } from '../../core/drink';

@Component({
  selector: 'app-drink-dialog',
  imports: [ReactiveFormsModule, Button, Dialog, InputNumber, InputText, Message],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './drink-dialog.html',
  styleUrl: './drink-dialog.scss',
})
export class DrinkDialog {
  public readonly visible = model(false);
  public readonly drink = input<Drink | null>(null);
  public readonly saving = input(false);

  public readonly save = output<DrinkInput>();

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50), Validators.pattern(/\S/)],
    }),
    volumeMl: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(5000)],
    }),
    alcoholPercentage: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        return;
      }

      const drink = this.drink();

      untracked(() =>
        this.form.reset({
          name: drink?.name ?? '',
          volumeMl: drink?.volumeMl ?? null,
          alcoholPercentage: drink?.alcoholPercentage ?? null,
        }),
      );
    });
  }

  protected isInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    const { name, volumeMl, alcoholPercentage } = this.form.getRawValue();

    if (this.form.invalid || volumeMl === null || alcoholPercentage === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit({ name, volumeMl, alcoholPercentage });
  }
}
