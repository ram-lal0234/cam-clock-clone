import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../shared/services/supabase.service';
import { Workspace } from '../../shared/models/workspace.model';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-workspace-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 text-center">Select a Workspace</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Choose a workspace to continue or create a new one
        </p>
      </div>

      <div class="space-y-6">
        <div *ngIf="loading" class="flex justify-center py-6">
          <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div *ngIf="!loading && !error">
          <div *ngIf="workspaces.length === 0" class="text-center py-8 space-y-4">
            <div class="mx-auto h-12 w-12 text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-medium text-gray-900">No workspaces found</h3>
              <p class="text-sm text-gray-500">Create a new workspace to get started</p>
            </div>
            <button (click)="createNewWorkspace()"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200">
              Create New Workspace
            </button>
          </div>

          <div *ngIf="workspaces.length > 0" class="space-y-3">
            <div *ngFor="let workspace of workspaces"
              (click)="selectWorkspace(workspace)"
              class="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm hover:border-primary-500 cursor-pointer transition-all duration-200">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{{ workspace.name }}</h3>
                  <p class="text-sm text-gray-500">Team Workspace</p>
                </div>
                <div *ngIf="workspace.id === currentWorkspace?.id" class="text-primary-600">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="error" class="rounded-md bg-red-50 p-4 animate-fade-in">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WorkspaceSelectComponent implements OnInit {
  workspaces: Workspace[] = [];
  currentWorkspace: Workspace | null = null;
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;

  constructor(
    private supabase: SupabaseService,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {
    effect(() => {
      this.currentUser = this.supabase.authState$();
      if (this.currentUser) {
        this.loadWorkspaces();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit', this.currentUser);
    // Initial load will be handled by the effect
  }

  private loadWorkspaces() {
    if (!this.currentUser?.id) return;

    this.loading = true;
    this.error = null;

    this.workspaceService.getCurrentWorkspace().subscribe({
      next: (workspace) => {
        this.currentWorkspace = workspace;
        if (!workspace) {
          this.router.navigate(['/auth/create-workspace']);
        } else {
          this.router.navigate(['/dashboard']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  selectWorkspace(workspace: Workspace) {
    if (!workspace.id) return;

    this.loading = true;
    this.error = null;

    this.workspaceService.setCurrentWorkspace(workspace).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  createNewWorkspace() {
    this.router.navigate(['/auth/create-workspace']);
  }
}