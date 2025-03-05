import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TimerButtonComponent } from '../shared/components/timer-button/timer-button.component';
import { TimeEntryService } from '../shared/services/time-entry.service';
import { ProjectService } from '../shared/services/project.service';
import { TimeEntry } from '../shared/models/time-entry.model';
import { Project } from '../shared/models/project.model';
import { format, subDays, startOfWeek, endOfWeek, differenceInSeconds } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TimerButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          <div class="mt-6">
            <app-timer-button></app-timer-button>
          </div>
          
          <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Weekly summary card -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Weekly Summary</h3>
                <div class="mt-2 flex justify-between">
                  <div>
                    <p class="text-3xl font-semibold text-gray-900">{{ weeklyTotal }}</p>
                    <p class="text-sm text-gray-500">Total hours this week</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">{{ weekDateRange }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Today's summary card -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Today</h3>
                <div class="mt-2">
                  <p class="text-3xl font-semibold text-gray-900">{{ todayTotal }}</p>
                  <p class="text-sm text-gray-500">Hours tracked today</p>
                </div>
              </div>
            </div>
            
            <!-- Yesterday's summary card -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Yesterday</h3>
                <div class="mt-2">
                  <p class="text-3xl font-semibold text-gray-900">{{ yesterdayTotal }}</p>
                  <p class="text-sm text-gray-500">Hours tracked yesterday</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900">Recent Time Entries</h2>
            
            <div class="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" class="divide-y divide-gray-200">
                <li *ngFor="let entry of recentEntries" class="px-6 py-4 flex items-center">
                  <div class="min-w-0 flex-1 flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-10 w-10 rounded-full flex items-center justify-center" 
                           [style.backgroundColor]="getProjectColor(entry.projectId)">
                        <span class="text-white text-sm font-medium">
                          {{ getProjectInitials(entry.projectId) }}
                        </span>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1 px-4">
                      <div>
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ entry.description || 'No description' }}
                        </p>
                        <p class="text-sm text-gray-500">
                          {{ getProjectName(entry.projectId) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0 flex flex-col items-end">
                    <p class="text-sm text-gray-900">
                      {{ formatDuration(entry) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ entry.startTime ? formatDate(entry.startTime) : '' }}
                    </p>
                  </div>
                </li>
                
                <li *ngIf="recentEntries.length === 0" class="px-6 py-4 text-center text-gray-500">
                  No recent time entries
                </li>
              </ul>
              
              <div class="px-6 py-4 border-t border-gray-200">
                <a routerLink="/timer" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all time entries
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  recentEntries: TimeEntry[] = [];
  projects: Project[] = [];
  
  todayTotal = '0h 0m';
  yesterdayTotal = '0h 0m';
  weeklyTotal = '0h 0m';
  weekDateRange = '';

  constructor(
    private timeEntryService: TimeEntryService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    effect(() => {
      const entries = this.timeEntryService.timeEntries$();
      // Get recent entries (last 5)
      this.recentEntries = entries.slice(0, 5);
      
      // Calculate today's total
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEntries = entries.filter((entry: TimeEntry) => {
        const entryDate = entry.startTime ? new Date(entry.startTime) : new Date();
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      this.todayTotal = this.calculateTotalDuration(todayEntries);
      
      // Calculate yesterday's total
      const yesterday = subDays(today, 1);
      const yesterdayEntries = entries.filter((entry: TimeEntry) => {
        const entryDate = entry.startTime ? new Date(entry.startTime) : new Date();
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === yesterday.getTime();
      });
      this.yesterdayTotal = this.calculateTotalDuration(yesterdayEntries);
      
      // Calculate weekly total
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const weeklyEntries = entries.filter((entry: TimeEntry) => {
        const entryDate = entry.startTime ? new Date(entry.startTime) : new Date();
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      this.weeklyTotal = this.calculateTotalDuration(weeklyEntries);
      
      // Format week date range
      this.weekDateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
    });
    
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
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

  getProjectInitials(projectId?: string): string {
    if (!projectId) return 'NP';
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return 'UP';
    
    const words = project.name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  }

  formatDate(date: Date): string {
    return format(new Date(date), 'MMM d, h:mm a');
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

  private calculateTotalDuration(entries: TimeEntry[]): string {
    let totalSeconds = 0;
    
    entries.forEach(entry => {
      if (entry.duration) {
        totalSeconds += entry.duration;
      } else if (entry.startTime && entry.endTime) {
        totalSeconds += differenceInSeconds(new Date(entry.endTime), new Date(entry.startTime));
      } else if (entry.startTime && entry.isRunning) {
        totalSeconds += differenceInSeconds(new Date(), new Date(entry.startTime));
      }
    });
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }
}