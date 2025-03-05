import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" *ngIf="currentWorkspace">
      <button
        (click)="toggleDropdown()"
        class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <span class="text-white font-medium text-sm">{{ getInitials(currentWorkspace.name) }}</span>
        </div>
        <div class="text-left">
          <div class="text-sm font-medium text-gray-900">{{ currentWorkspace.name }}</div>
          <div class="text-xs text-gray-500">{{ currentWorkspace.is_personal ? 'Personal' : 'Team' }}</div>
        </div>
        <svg
          class="h-4 w-4 text-gray-400"
          [class.transform]="isOpen"
          [class.rotate-180]="isOpen"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <div
        *ngIf="isOpen"
        class="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1">
          <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Workspaces
          </div>
          
          <div class="max-h-60 overflow-y-auto">
            <div
              *ngFor="let workspace of workspaces"
              (click)="selectWorkspace(workspace)"
              class="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
              [class.bg-indigo-50]="workspace.id === currentWorkspace?.id"
            >
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <span class="text-white font-medium text-sm">{{ getInitials(workspace.name) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ workspace.name }}</div>
                <div class="text-xs text-gray-500">{{ workspace.is_personal ? 'Personal' : 'Team' }}</div>
              </div>
              <div *ngIf="workspace.id === currentWorkspace?.id" class="text-indigo-600">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100">
            <button
              (click)="createNewWorkspace()"
              class="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WorkspaceSwitcherComponent {
  currentWorkspace: Workspace | null = null;
  workspaces: Workspace[] = [];
  isOpen = false;

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {
    effect(() => {
      this.currentWorkspace = this.workspaceService.currentWorkspace$();
      this.workspaces = this.workspaceService.workspaces$();
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectWorkspace(workspace: Workspace) {
    if (workspace.id === this.currentWorkspace?.id) {
      this.isOpen = false;
      return;
    }

    this.workspaceService.setCurrentWorkspace(workspace).subscribe({
      next: () => {
        this.isOpen = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  createNewWorkspace() {
    this.isOpen = false;
    this.router.navigate(['/auth/create-workspace']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
} 