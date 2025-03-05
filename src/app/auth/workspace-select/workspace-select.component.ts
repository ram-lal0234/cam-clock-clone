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
    <div class="h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
        <div class="p-8 sm:p-10">
          <div class="space-y-6">
            <div class="flex justify-center">
              <div class="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
                <svg class="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div class="text-center">
              <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
                Select a Workspace
              </h2>
              <p class="mt-3 text-sm text-gray-600">
                Choose a workspace to continue or create a new one
              </p>
            </div>
          </div>

          <div class="mt-8">
            <div *ngIf="loading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>

            <div *ngIf="error" class="rounded-lg bg-red-50 p-4 animate-fade-in">
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

            <div *ngIf="!loading && !error" class="space-y-4">
              <div *ngIf="workspaces.length === 0" class="text-center py-12">
                <div class="rounded-full bg-indigo-50 p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <svg class="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
                <p class="text-sm text-gray-500 mb-6">Create a new workspace to get started</p>
                <button
                  (click)="createNewWorkspace()"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Create New Workspace
                </button>
              </div>

              <div *ngIf="workspaces.length > 0" class="grid gap-4">
                <div
                  *ngFor="let workspace of workspaces"
                  (click)="selectWorkspace(workspace)"
                  class="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-500 cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">{{ workspace.name }}</h3>
                      <p class="text-sm text-gray-500">{{  'Team' }}</p>
                    </div>
                    <div *ngIf="workspace.id === currentWorkspace?.id" class="text-indigo-600">
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
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