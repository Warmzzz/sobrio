import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from './nav-item';

@Component({
  selector: 'app-nav-menu',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.scss',
})
export class NavMenu {
  protected readonly items: NavItem[] = [
    { label: 'Accueil', icon: 'pi-home', link: '/' },
    { label: 'Paramètres', icon: 'pi-cog', link: '/settings' },
  ];
}
