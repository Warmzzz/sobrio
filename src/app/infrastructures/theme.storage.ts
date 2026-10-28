import { Injectable } from '@angular/core';
import { DEFAULT_THEME, Theme } from '../core/theme';

const STORAGE_KEY = "sobrio-theme";

@Injectable({ providedIn: 'root' })
export class ThemeStorage {

  public load(): Theme {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if(this.isTheme(value)) return value;
    } catch {
      console.error("Failed to load theme from local storage");
    }

    return DEFAULT_THEME;
  }

  public save(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      console.error("Failed to save theme to local storage");
    }
  }

  private isTheme(value: string | null): value is Theme {
    return value === "light"
      || value === "dark"
      || value === "system";
  }

}