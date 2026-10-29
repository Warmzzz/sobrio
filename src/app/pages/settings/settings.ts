import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BiometricsForm } from '../../components/biometrics-form/biometrics-form';
import { ThemeSelector } from '../../components/theme-selector/theme-selector';

@Component({
  selector: 'app-settings',
  imports: [BiometricsForm, ThemeSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {}
