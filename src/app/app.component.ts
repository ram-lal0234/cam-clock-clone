import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidenavComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header *ngIf="!isAuthRoute"></app-header>
      <div *ngIf="!isAuthRoute" class="flex">
        <div class="w-64 flex-shrink-0">
          <app-sidenav></app-sidenav>
        </div>
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </div>
      <router-outlet *ngIf="isAuthRoute"></router-outlet>
    </div>
  `
})
export class AppComponent {
  isAuthRoute = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isAuthRoute = this.router.url.startsWith('/auth');
    });
  }
} 