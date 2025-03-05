import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkspaceService } from '../shared/services/workspace.service';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/user.model';
import { Workspace } from '../shared/models/workspace.model';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Team</h1>
            
            <div>
              <button *ngIf="!workspace" (click)="showCreateWorkspaceForm = true" class="btn btn-primary">
                Create Workspace
              </button>
              <button *ngIf="workspace && isOwnerOrAdmin" (click)="showInviteForm = true" class="btn btn-primary">
                Invite Member
              </button>
            </div>
          </div>
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-12">
            <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <!-- No Workspace State -->
          <div *ngIf="!isLoading && !workspace" class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <h2 class="text-lg font-medium text-gray-900 mb-4">You don't have a workspace yet</h2>
            <p class="text-gray-500 mb-6">Create a workspace to start collaborating with your team</p>
            
            <div *ngIf="!showCreateWorkspaceForm" class="flex justify-center">
              <button (click)="showCreateWorkspaceForm = true" class="btn btn-primary">
                Create Workspace
              </button>
            </div>
            
            <form *ngIf="showCreateWorkspaceForm" [formGroup]="workspaceForm" (ngSubmit)="createWorkspace()" class="max-w-md mx-auto mt-6">
              <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                <input type="text" id="name" formControlName="name" class="input" placeholder="Enter workspace name">
                <div *ngIf="workspaceForm.get('name')?.invalid && workspaceForm.get('name')?.touched" class="text-red-500 text-xs mt-1">
                  Workspace name is required
                </div>
              </div>
              
              <div class="flex justify-end">
                <button type="button" (click)="showCreateWorkspaceForm = false" class="btn btn-secondary mr-3">
                  Cancel
                </button>
                <button type="submit" [disabled]="workspaceForm.invalid || isSubmitting" class="btn btn-primary">
                  <span *ngIf="isSubmitting" class="mr-2">
                    <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
          
          <!-- Workspace Info -->
          <div *ngIf="!isLoading && workspace" class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ workspace.name }}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  Created {{ formatDate(workspace.createdAt) }}
                </p>
              </div>
            </div>
            
            <!-- Invite Form -->
            <div *ngIf="showInviteForm" class="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Invite Team Member</h3>
              
              <form [formGroup]="inviteForm" (ngSubmit)="inviteMember()">
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-4">
                    <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                    <div class="mt-1">
                      <input type="email" id="email" formControlName="email" class="input" placeholder="Enter email address">
                      <div *ngIf="inviteForm.get('email')?.invalid && inviteForm.get('email')?.touched" class="text-red-500 text-xs mt-1">
                        Please enter a valid email address
                      </div>
                    </div>
                  </div>
                  
                  <div class="sm:col-span-2">
                    <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                    <div class="mt-1">
                      <select id="role" formControlName="role" class="input">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                  <button type="button" (click)="showInviteForm = false" class="btn btn-secondary mr-3">
                    Cancel
                  </button>
                  <button type="submit" [disabled]="inviteForm.invalid || isSubmitting" class="btn btn-primary">
                    <span *ngIf="isSubmitting" class="mr-2">
                      <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Send Invitation
                  </button>
                </div>
                
                <div *ngIf="errorMessage" class="mt-4 text-red-500 text-sm">
                  {{ errorMessage }}
                </div>
              </form>
            </div>
            
            <!-- Team Members List -->
            <div class="border-t border-gray-200">
              <h3 class="sr-only">Team Members</h3>
              <ul role="list" class="divide-y divide-gray-200">
                <li *ngFor="let member of teamMembers" class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                          <span class="text-white font-medium">{{ getInitials(member) }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ member.display_name || 'Unnamed User' }}</div>
                        <div class="text-sm text-gray-500">{{ member.email }}</div>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {{ getMemberRole(member.id) }}
                      </span>
                      
                      <div *ngIf="isOwner && member.id !== currentUser?.id" class="ml-4">
                        <button (click)="removeMember(member.id)" class="text-red-600 hover:text-red-900 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class TeamComponent implements OnInit {
  workspace: Workspace | null = null;
  teamMembers: User[] = [];
  currentUser: User | null = null;
  
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  
  showCreateWorkspaceForm = false;
  showInviteForm = false;
  
  workspaceForm: FormGroup;
  inviteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {
    this.workspaceForm = this.fb.group({
      name: ['', Validators.required]
    });
    
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['member']
    });
  }

  ngOnInit(): void {
    effect(() => {
      this.currentUser = this.authService.user$();
      this.loadWorkspace();
    });
  }

  private loadWorkspace() {
    if (!this.currentUser) {
      this.workspace = null;
      this.teamMembers = [];
      this.isLoading = false;
      return;
    }

    this.workspaceService.getCurrentWorkspace().subscribe(workspace => {
      this.workspace = workspace;
      if (workspace?.id) {
        this.loadTeamMembers(workspace.id);
      } else {
        this.teamMembers = [];
      }
      this.isLoading = false;
    });
  }

  private loadTeamMembers(workspaceId: string) {
    this.workspaceService.getWorkspaceMembers(workspaceId).subscribe(members => {
      this.teamMembers = members;
    });
  }

  get isOwner(): boolean {
    return this.workspace?.ownerId === this.currentUser?.id;
  }

  get isOwnerOrAdmin(): boolean {
    if (!this.currentUser?.id) return false;
    return this.isOwner || this.getMemberRole(this.currentUser.id) === 'admin';
  }

  getInitials(member: User): string {
    const name = member.display_name || member.email;
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getMemberRole(memberId: string): string {
    return 'Member'; // TODO: Implement role check
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  createWorkspace() {
    if (this.workspaceForm.valid) {
      this.isSubmitting = true;
      this.workspaceService.createWorkspace(this.workspaceForm.value.name).subscribe({
        next: (workspace) => {
          this.workspace = workspace;
          if (workspace?.id) {
            this.loadTeamMembers(workspace.id);
          }
          this.showCreateWorkspaceForm = false;
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isSubmitting = false;
        }
      });
    }
  }

  inviteMember() {
    if (this.inviteForm.valid && this.workspace?.id) {
      this.isSubmitting = true;
      this.workspaceService.addMember(
        this.workspace.id,
        this.inviteForm.value.email,
        this.inviteForm.value.role
      ).subscribe({
        next: () => {
          if (this.workspace?.id) {
            this.loadTeamMembers(this.workspace.id);
          }
          this.showInviteForm = false;
          this.inviteForm.reset();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isSubmitting = false;
        }
      });
    }
  }

  removeMember(memberId: string) {
    // Implement remove member functionality
  }
}