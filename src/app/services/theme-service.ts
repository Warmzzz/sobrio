import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { ThemeStorage } from '../infrastructures/theme.storage';
import { Theme } from '../core/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(ThemeStorage);

  private readonly _theme = signal<Theme>(this.storage.load());

  public readonly theme = this._theme.asReadonly();

  constructor() {
    this.applyTheme(this.theme());

    this.document.defaultView
      ?.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
  }

  public setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.storage.save(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches);

    this.document.documentElement.classList.toggle('app-dark', isDark);
  }
}
