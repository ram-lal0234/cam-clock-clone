import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeEntryService } from '../../services/time-entry.service';
import { ProjectService } from '../../services/project.service';
import { TimeEntry } from '../../models/time-entry.model';
import { Project } from '../../models/project.model';
import { Observable, Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-timer-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm p-4 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1">
          <input 
            type="text" 
            [(ngModel)]="description" 
            placeholder="What are you working on?" 
            class="w-full border-0 focus:ring-0 text-lg font-medium"
          />
        </div>
        <div class="flex items-center space-x-2">
          <select 
            [(ngModel)]="selectedProjectId" 
            class="border-gray-300 rounded-md text-sm"
          >
            <option [value]="null">No Project</option>
            <option *ngFor="let project of projects" [value]="project.id">
              {{ project.name }}
            </option>
          </select>
          
          <div class="text-2xl font-mono">
            {{ formattedDuration }}
          </div>
          
          <button 
            *ngIf="!activeEntry" 
            (click)="startTimer()" 
            class="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
          
          <button 
            *ngIf="activeEntry" 
            (click)="stopTimer()" 
            class="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class TimerButtonComponent implements OnInit, OnDestroy {
  description = '';
  selectedProjectId: string | null = null;
  activeEntry: TimeEntry | null = null;
  projects: Project[] = [];
  
  private timerSubscription?: Subscription;
  private projectsSubscription?: Subscription;
  private activeEntrySubscription?: Subscription;
  
  duration = 0;
  formattedDuration = '00:00:00';

  constructor(
    private timeEntryService: TimeEntryService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectsSubscription = this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
    
    effect(() => {
      const entry = this.timeEntryService.activeTimeEntry$();
      this.activeEntry = entry;
      
      if (entry) {
        this.description = entry.description || '';
        this.selectedProjectId = entry.projectId || null;
        if (entry.startTime) {
          this.startDurationCounter(entry.startTime);
        }
      } else {
        this.stopDurationCounter();
        this.duration = 0;
        this.formattedDuration = '00:00:00';
      }
    });
  }

  ngOnDestroy(): void {
    this.projectsSubscription?.unsubscribe();
    this.stopDurationCounter();
  }

  startTimer(): void {
    this.timeEntryService.startTimeEntry(
      this.selectedProjectId || '',
      this.description
    ).subscribe();
  }

  stopTimer(): void {
    if (this.activeEntry?.id) {
      this.timeEntryService.stopTimeEntry(this.activeEntry.id).subscribe();
    }
  }

  private startDurationCounter(startTime: Date): void {
    this.stopDurationCounter();
    
    // Calculate initial duration
    this.updateDuration(startTime);
    
    // Update duration every second
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateDuration(startTime);
    });
  }

  private stopDurationCounter(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private updateDuration(startTime: Date): void {
    const now = new Date();
    this.duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    this.formattedDuration = this.formatDuration(this.duration);
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  }
}