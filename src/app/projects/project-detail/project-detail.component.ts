import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../shared/services/project.service';
import { TimeEntryService } from '../../shared/services/time-entry.service';
import { Project } from '../../shared/models/project.model';
import { TimeEntry } from '../../shared/models/time-entry.model';
import { Task } from '../../shared/models/task.model';
import { format, differenceInSeconds } from 'date-fns';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="flex items-center mb-6">
            <a routerLink="/projects" class="text-primary-600 hover:text-primary-700 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
            <h1 class="text-2xl font-semibold text-gray-900">
              <span *ngIf="project" class="flex items-center">
                <div class="h-6 w-6 rounded-md mr-2" [style.backgroundColor]="project.color"></div>
                {{ project.name }}
              </span>
              <span *ngIf="!project">Project Details</span>
            </h1>
          </div>
          
          <div *ngIf="isLoading" class="text-center py-12">
            <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <div *ngIf="project && !isLoading" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Details and time entries for this project.</p>
              </div>
              <div>
                <button (click)="showEditForm = true" class="btn btn-secondary mr-2">
                  Edit
                </button>
                <button (click)="archiveProject()" class="btn btn-danger">
                  Archive
                </button>
              </div>
            </div>
            
            <!-- Project Details -->
            <div class="border-t border-gray-200 px-4 py-5 sm:px-6" *ngIf="!showEditForm">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Project Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ project.name }}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Color</dt>
                  <dd class="mt-1 text-sm text-gray-900 flex items-center">
                    <div class="h-4 w-4 rounded-full mr-2" [style.backgroundColor]="project.color"></div>
                    {{ project.color }}
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500">Description</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ project.description || 'No description provided' }}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Created</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ project.created_at }}</dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ project.updated_at }}</dd>
                </div>  
              </dl>
            </div>
            
            <!-- Edit Project Form -->
            <div class="border-t border-gray-200 px-4 py-5 sm:px-6" *ngIf="showEditForm">
              <form [formGroup]="projectForm" (ngSubmit)="updateProject()">
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div class="sm:col-span-4">
                    <label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
                    <div class="mt-1">
                      <input type="text" id="name" formControlName="name" class="input" placeholder="Enter project name">
                      <div *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" class="text-red-500 text-xs mt-1">
                        Project name is required
                      </div>
                    </div>
                  </div>
                  
                  <div class="sm:col-span-2">
                    <label for="color" class="block text-sm font-medium text-gray-700">Color</label>
                    <div class="mt-1">
                      <input type="color" id="color" formControlName="color" class="h-10 w-full rounded-md border border-gray-300">
                    </div>
                  </div>
                  
                  <div class="sm:col-span-6">
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <div class="mt-1">
                      <textarea id="description" formControlName="description" rows="3" class="input" placeholder="Enter project description"></textarea>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6 flex justify-end">
                  <button type="button" (click)="showEditForm = false" class="btn btn-secondary mr-3">
                    Cancel
                  </button>
                  <button type="submit" [disabled]="projectForm.invalid || isSubmitting" class="btn btn-primary">
                    <span *ngIf="isSubmitting" class="mr-2">
                      <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Update Project
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Time Entries for this Project -->
          <div *ngIf="project && !isLoading" class="mt-8">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Time Entries</h2>
            
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let entry of projectTimeEntries">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ entry.description || 'No description' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(entry.startTime) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatTime(entry.startTime) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ entry.isRunning ? 'Running' : formatTime(entry.endTime) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDuration(entry) }}
                    </td>
                  </tr>
                  
                  <tr *ngIf="projectTimeEntries.length === 0">
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                      No time entries for this project
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  projectId: string | null = null;
  project: Project | null = null;
  projectTimeEntries: TimeEntry[] = [];

  isLoading = true;
  showEditForm = false;
  projectForm: FormGroup;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private timeEntryService: TimeEntryService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      color: ['#3b82f6']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.projectId = params.get('id');
        if (!this.projectId) {
          return of(null);
        }
        return this.projectService.getProject(this.projectId);
      })
    ).subscribe({
      next: (project) => {
        if (project) {
          this.project = project;
          this.projectForm.patchValue({
            name: project.name,
            description: project.description || '',
            color: project.color
          });
          this.loadProjectTimeEntries();
        } else {
          this.router.navigate(['/projects']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.isLoading = false;
        this.router.navigate(['/projects']);
      }
    });
  }

  loadProjectTimeEntries(): void {
    if (!this.projectId) return;

    effect(() => {
      this.projectTimeEntries = this.timeEntryService.timeEntries$().filter(entry => entry.projectId === this.projectId);
    });
  }

  updateProject(): void {
    if (this.projectForm.invalid || !this.projectId) return;

    this.isSubmitting = true;

    const updates = this.projectForm.value;

    this.projectService.updateProject(this.projectId, updates).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showEditForm = false;

        // Update local project data
        if (this.project) {
          this.project = {
            ...this.project,
            ...updates,
            updatedAt: new Date()
          };
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating project:', error);
      }
    });
  }

  archiveProject(): void {
    if (!this.projectId) return;

    if (confirm('Are you sure you want to archive this project? Archived projects will no longer appear in your active projects list.')) {
      this.projectService.archiveProject(this.projectId).subscribe({
        next: () => {
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          console.error('Error archiving project:', error);
        }
      });
    }
  }

  formatDate(date?: Date): string {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy');
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    return format(new Date(date), 'h:mm a');
  }

  formatDuration(entry: TimeEntry): string {
    let seconds = 0;

    if (entry.duration) {
      seconds = entry.duration;
    } else if (entry.startTime && entry.endTime) {
      seconds = differenceInSeconds(new Date(entry.endTime), new Date(entry.startTime));
    } else if (entry.startTime && entry.isRunning) {
      seconds = differenceInSeconds(new Date(), new Date(entry.startTime));
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  }
}