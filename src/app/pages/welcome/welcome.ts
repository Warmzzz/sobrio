import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { MINIMUM_AGE } from '../../core/legal';
import { PreferencesService } from '../../services/preferences-service';

@Component({
  selector: 'app-welcome',
  imports: [ReactiveFormsModule, RouterLink, Button, Message],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {
  private readonly preferencesService = inject(PreferencesService);
  private readonly router = inject(Router);

  protected readonly minimumAge = MINIMUM_AGE;
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);

  protected readonly form = new FormGroup({
    isAdult: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    understandsEstimate: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
    acceptsTerms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  protected async accept(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveFailed.set(false);

    try {
      await this.preferencesService.acceptLegalTerms();
      await this.router.navigateByUrl('/');
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }
}
