import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { MINIMUM_AGE } from '../../core/legal';
import { Sex } from '../../core/preferences';
import { PreferencesService } from '../../services/preferences-service';
import { sexValidator } from '../../validators/sex-validator';

type SaveStatus = 'idle' | 'saved' | 'error';

@Component({
  selector: 'app-biometrics-form',
  imports: [ReactiveFormsModule, Button, InputNumber, Message, SelectButton, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './biometrics-form.html',
  styleUrl: './biometrics-form.scss',
})
export class BiometricsForm implements OnInit {
  private readonly preferencesService = inject(PreferencesService);

  protected readonly sexOptions: { label: string; value: Sex }[] = [
    { label: 'Homme', value: 'male' },
    { label: 'Femme', value: 'female' },
  ];

  protected readonly loaded = signal(false);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  protected readonly status = signal<SaveStatus>('idle');

  protected readonly form = new FormGroup({
    sex: new FormControl<Sex>('male', {
      nonNullable: true,
      validators: [Validators.required, sexValidator()],
    }),
    age: new FormControl<number | null>(25, {
      validators: [Validators.required, Validators.min(MINIMUM_AGE), Validators.max(100)],
    }),
    weightKg: new FormControl<number | null>(70, {
      validators: [Validators.required, Validators.min(40), Validators.max(200)],
    }),
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.status.set('idle'));
  }

  async ngOnInit(): Promise<void> {
    try {
      this.form.setValue(await this.preferencesService.getBiometrics());
    } catch {
      this.loadFailed.set(true);
    } finally {
      this.loaded.set(true);
    }
  }

  protected isInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected async save(): Promise<void> {
    const { sex, age, weightKg } = this.form.getRawValue();

    if (this.form.invalid || age === null || weightKg === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      await this.preferencesService.setBiometrics({ sex, age, weightKg });
      this.form.markAsPristine();
      this.status.set('saved');
    } catch {
      this.status.set('error');
    } finally {
      this.saving.set(false);
    }
  }
}
