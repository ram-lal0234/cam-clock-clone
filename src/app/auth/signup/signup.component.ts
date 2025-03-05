import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { SupabaseService } from '../../shared/services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 text-center">Create your account</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account?
          <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
            Sign in
          </a>
        </p>
      </div>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input id="name" name="name" type="text" formControlName="name" autocomplete="name" required 
                class="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200" 
                [class.border-red-300]="signupForm.get('name')?.invalid && signupForm.get('name')?.touched"
                placeholder="Enter your name">
              <div *ngIf="signupForm.get('name')?.invalid && signupForm.get('name')?.touched" 
                class="mt-1 text-sm text-red-600 animate-fade-in">
                Please enter a valid name
              </div>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input id="email" name="email" type="email" formControlName="email" autocomplete="email" required 
                class="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200" 
                [class.border-red-300]="signupForm.get('email')?.invalid && signupForm.get('email')?.touched"
                placeholder="Enter your email">
              <div *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched" 
                class="mt-1 text-sm text-red-600 animate-fade-in">
                Please enter a valid email address
              </div>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <input id="password" name="password" type="password" formControlName="password" autocomplete="new-password" required 
                class="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                [class.border-red-300]="signupForm.get('password')?.invalid && signupForm.get('password')?.touched"
                placeholder="Create a password">
              <div *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched" 
                class="mt-1 text-sm text-red-600 animate-fade-in">
                Password must be at least 6 characters
              </div>
            </div>
          </div>
        </div>

        <div>
          <button type="submit" [disabled]="signupForm.invalid || isLoading" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Create account
          </button>
        </div>
        
        <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4 animate-fade-in">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.signupForm.value;

    this.authService.signUp(email, password, name).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/auth/create-workspace']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'auth/email-already-in-use') {
      return 'An account with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      return 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      return 'Password should be at least 6 characters';
    } else {
      return 'An error occurred during sign up. Please try again.';
    }
  }
}