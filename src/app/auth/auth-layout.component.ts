import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-primary-600">TimeTracker</h1>
          <p class="mt-2 text-sm text-gray-600">Track your time, boost productivity</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {} 