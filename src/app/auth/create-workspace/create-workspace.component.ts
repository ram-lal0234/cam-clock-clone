import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceService } from '../../shared/services/workspace.service';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your workspace
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Give your workspace a name to get started
          </p>
        </div>

        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="workspaceForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Workspace name</label>
              <div class="mt-1">
                <input id="name" name="name" type="text" formControlName="name" required 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  [class.border-red-300]="workspaceForm.get('name')?.invalid && workspaceForm.get('name')?.touched"
                  placeholder="Enter workspace name">
                <div *ngIf="workspaceForm.get('name')?.invalid && workspaceForm.get('name')?.touched" 
                  class="mt-1 text-sm text-red-600 animate-fade-in">
                  Please enter a workspace name
                </div>
              </div>
            </div>

            <div>
              <button type="submit" [disabled]="workspaceForm.invalid || isLoading" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Create workspace
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
      </div>
    </div>
  `
})
export class CreateWorkspaceComponent {
  workspaceForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {
    this.workspaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.workspaceForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name } = this.workspaceForm.value;

    this.workspaceService.createWorkspace(name).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create workspace. Please try again.';
      }
    });
  }
} 