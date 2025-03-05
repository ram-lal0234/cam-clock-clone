import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { effect } from '@angular/core';
import { WorkspaceSwitcherComponent } from '../workspace-switcher/workspace-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, WorkspaceSwitcherComponent],
  template: `
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/dashboard" class="flex items-center space-x-2">
                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span class="text-xl font-bold text-gray-900">TimeTracker</span>
              </a>
            </div>
            
            <nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                routerLink="/dashboard"
                routerLinkActive="border-indigo-500 text-gray-900"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Dashboard
              </a>
              <a
                routerLink="/timer"
                routerLinkActive="border-indigo-500 text-gray-900"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Timer
              </a>
              <a
                routerLink="/projects"
                routerLinkActive="border-indigo-500 text-gray-900"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Projects
              </a>
              <a
                routerLink="/reports"
                routerLinkActive="border-indigo-500 text-gray-900"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Reports
              </a>
              <a
                routerLink="/team"
                routerLinkActive="border-indigo-500 text-gray-900"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Team
              </a>
            </nav>
          </div>

          <div class="flex items-center">
            <app-workspace-switcher></app-workspace-switcher>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  user: User | null = null;

  constructor(private authService: AuthService) {
    effect(() => {
      this.user = this.authService.user$();
    });
  }

  getUserInitials(): string {
    if (!this.user?.email) return '';
    return this.user.email.split('@')[0].substring(0, 2).toUpperCase();
  }

  signOut(): void {
    this.authService.signOut().subscribe();
  }
}