import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimerButtonComponent } from '../shared/components/timer-button/timer-button.component';
import { TimeEntryService } from '../shared/services/time-entry.service';
import { ProjectService } from '../shared/services/project.service';
import { TimeEntry } from '../shared/models/time-entry.model';
import { Project } from '../shared/models/project.model';
import { format, differenceInSeconds, parseISO } from 'date-fns';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TimerButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h1 class="text-2xl font-semibold text-gray-900">Timer</h1>
          
          <div class="mt-6">
            <app-timer-button></app-timer-button>
          </div>
          
          <div class="mt-8">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-medium text-gray-900">Add Time Entry</h2>
            </div>
            
            <form [formGroup]="manualEntryForm" (ngSubmit)="addManualEntry()" class="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-6">
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <div class="mt-1">
                    <input type="text" id="description" formControlName="description" class="input" placeholder="What did you work on?">
                  </div>
                </div>
                
                <div class="sm:col-span-3">
                  <label for="project" class="block text-sm font-medium text-gray-700">Project</label>
                  <div class="mt-1">
                    <select id="project" formControlName="projectId" class="input">
                      <option [value]="null">No Project</option>
                      <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
                    </select>
                  </div>
                </div>
                
                <div class="sm:col-span-3">
                  <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
                  <div class="mt-1">
                    <input type="date" id="date" formControlName="date" class="input">
                  </div>
                </div>
                
                <div class="sm:col-span-3">
                  <label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
                  <div class="mt-1">
                    <input type="time" id="startTime" formControlName="startTime" class="input">
                  </div>
                </div>
                
                <div class="sm:col-span-3">
                  <label for="endTime" class="block text-sm font-medium text-gray-700">End Time</label>
                  <div class="mt-1">
                    <input type="time" id="endTime" formControlName="endTime" class="input">
                  </div>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end">
                <button type="button" (click)="resetForm()" class="btn btn-secondary mr-3">
                  Cancel
                </button>
                <button type="submit" [disabled]="manualEntryForm.invalid || isSubmitting" class="btn btn-primary">
                  <span *ngIf="isSubmitting" class="mr-2">
                    <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Add Time Entry
                </button>
              </div>
            </form>
          </div>
          
          <div class="mt-8">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-medium text-gray-900">Time Entries</h2>
              
              <div class="flex space-x-2">
                <select [(ngModel)]="filterProject" (change)="applyFilters()" class="input py-1 px-2 text-sm">
                  <option value="all">All Projects</option>
                  <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
                </select>
                
                <select [(ngModel)]="filterPeriod" (change)="applyFilters()" class="input py-1 px-2 text-sm">
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            
            <div class="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
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
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let entry of filteredEntries">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ entry.description || 'No description' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div class="flex items-center">
                        <div class="h-4 w-4 rounded-full mr-2" [style.backgroundColor]="getProjectColor(entry.projectId)"></div>
                        {{ getProjectName(entry.projectId) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDateTime(entry.start_time) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ entry.isRunning ? 'Running' : formatDateTime(entry.endTime) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDuration(entry) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button *ngIf="entry.isRunning" (click)="stopTimer(entry)" class="text-red-600 hover:text-red-900 mr-3">
                        Stop
                      </button>
                      <button (click)="deleteEntry(entry)" class="text-gray-600 hover:text-gray-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                  
                  <tr *ngIf="filteredEntries.length === 0">
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                      No time entries found
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
export class TimerComponent implements OnInit {
  timeEntries: TimeEntry[] = [];
  filteredEntries: TimeEntry[] = [];
  projects: Project[] = [];
  
  manualEntryForm: FormGroup;
  isSubmitting = false;
  
  filterProject = 'all';
  filterPeriod = 'today';

  constructor(
    private fb: FormBuilder,
    private timeEntryService: TimeEntryService,
    private projectService: ProjectService
  ) {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    
    this.manualEntryForm = this.fb.group({
      description: ['', Validators.required],
      projectId: [null],
      date: [formattedDate, Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required]
    }, { validators: this.timeValidator });
  }

  ngOnInit(): void {
    effect(() => {
      this.timeEntries = this.timeEntryService.timeEntries$();
      this.applyFilters();
    });
    
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  timeValidator(form: FormGroup) {
    const startTime = form.get('startTime')?.value;
    const endTime = form.get('endTime')?.value;
    
    if (!startTime || !endTime) return null;
    
    return startTime < endTime ? null : { invalidTimeRange: true };
  }

  addManualEntry(): void {
    if (this.manualEntryForm.invalid) return;
    
    this.isSubmitting = true;
    
    const formValues = this.manualEntryForm.value;
    const date = formValues.date;
    
    // Create start and end time Date objects
    const startDateTime = new Date(`${date}T${formValues.startTime}`);
    const endDateTime = new Date(`${date}T${formValues.endTime}`);
    
    this.timeEntryService.startTimeEntry(
      formValues.projectId || '',
      formValues.description
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        console.error('Error adding time entry:', error);
      }
    });
  }

  resetForm(): void {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    
    this.manualEntryForm.reset({
      description: '',
      projectId: null,
      date: formattedDate,
      startTime: '09:00',
      endTime: '17:00'
    });
  }

  stopTimer(entry: TimeEntry): void {
    if (entry.id) {
      this.timeEntryService.stopTimeEntry(entry.id).subscribe();
    }
  }

  deleteEntry(entry: TimeEntry): void {
    if (entry.id && confirm('Are you sure you want to delete this time entry?')) {
      this.timeEntryService.deleteTimeEntry(entry.id).subscribe();
    }
  }

  applyFilters(): void {
    let filtered = [...this.timeEntries];
    
    // Filter by project
    if (this.filterProject !== 'all') {
      filtered = filtered.filter(entry => entry.projectId === this.filterProject);
    }
    
    // Filter by time period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (this.filterPeriod) {
      case 'today':
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.start_time);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.start_time);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === yesterday.getTime();
        });
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.start_time);
          return entryDate >= weekStart;
        });
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.start_time);
          return entryDate >= monthStart;
        });
        break;
    }
    
    this.filteredEntries = filtered;
  }

  getProjectName(projectId?: string): string {
    if (!projectId) return 'No Project';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }

  getProjectColor(projectId?: string): string {
    if (!projectId) return '#9CA3AF'; // Gray color for no project
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.color : '#9CA3AF';
  }

  formatDateTime(date?: Date | string): string {
    if (!date) return '';
    return format(new Date(date), 'MMM d, h:mm a');
  }

  formatDuration(entry: TimeEntry): string {
    let seconds = 0;
    
    if (entry.duration) {
      seconds = entry.duration;
    } else if (entry.start_time && entry.endTime) {
      seconds = differenceInSeconds(new Date(entry.endTime), new Date(entry.start_time));
    } else if (entry.start_time && entry.isRunning) {
      seconds = differenceInSeconds(new Date(), new Date(entry.start_time));
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }
}