import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMenu } from './layout/nav-menu/nav-menu';
import { Footer } from './layout/footer/footer';
import { UpdateBanner } from './layout/update-banner/update-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavMenu, Footer, UpdateBanner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
