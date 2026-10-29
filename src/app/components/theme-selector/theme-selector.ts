import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Theme } from '../../core/theme';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-theme-selector',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-selector.html',
  styleUrl: './theme-selector.scss',
})
export class ThemeSelector {
  private readonly themeService = inject(ThemeService);

  protected readonly options: { label: string; value: Theme; icon: string }[] = [
    { label: 'Clair', value: 'light', icon: 'pi pi-sun' },
    { label: 'Sombre', value: 'dark', icon: 'pi pi-moon' },
    { label: 'Système', value: 'system', icon: 'pi pi-desktop' },
  ];

  protected readonly theme = new FormControl<Theme>(this.themeService.theme(), { nonNullable: true });

  constructor() {
    this.theme.valueChanges.pipe(takeUntilDestroyed()).subscribe((theme) => this.themeService.setTheme(theme));
  }
}
