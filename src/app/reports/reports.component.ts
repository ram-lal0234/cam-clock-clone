import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeEntryService } from '../shared/services/time-entry.service';
import { ProjectService } from '../shared/services/project.service';
import { TimeEntry } from '../shared/models/time-entry.model';
import { Project } from '../shared/models/project.model';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInSeconds, eachDayOfInterval, parseISO } from 'date-fns';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <h1 class="text-2xl font-semibold text-gray-900">Reports</h1>
          
          <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-col sm:flex-row sm:space-x-4">
                <div class="mb-4 sm:mb-0">
                  <label for="reportType" class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select id="reportType" [(ngModel)]="reportType" (change)="generateReport()" class="input py-1">
                    <option value="summary">Summary</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="project">By Project</option>
                  </select>
                </div>
                
                <div class="mb-4 sm:mb-0">
                  <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select id="dateRange" [(ngModel)]="dateRange" (change)="generateReport()" class="input py-1">
                    <option value="thisWeek">This Week</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div *ngIf="dateRange === 'custom'" class="flex space-x-2">
                  <div>
                    <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" id="startDate" [(ngModel)]="startDate" (change)="generateReport()" class="input py-1">
                  </div>
                  <div>
                    <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" id="endDate" [(ngModel)]="endDate" (change)="generateReport()" class="input py-1">
                  </div>
                </div>
              </div>
              
              <div class="mt-4 sm:mt-0">
                <button (click)="exportReport()" class="btn btn-secondary">
                  Export CSV
                </button>
              </div>
            </div>
            
            <div class="mt-6">
              <h2 class="text-lg font-medium text-gray-900">{{ reportTitle }}</h2>
              <p class="text-sm text-gray-500">{{ reportDateRange }}</p>
              
              <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                    <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ totalHours }}</dd>
                  </div>
                </div>
                
                <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Daily Average</dt>
                    <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ dailyAverage }}</dd>
                  </div>
                </div>
                
                <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Entries</dt>
                    <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ filteredEntries.length }}</dd>
                  </div>
                </div>
                
                <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Projects</dt>
                    <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ uniqueProjects }}</dd>
                  </div>
                </div>
              </div>
              
              <!-- Summary Report -->
              <div *ngIf="reportType === 'summary'" class="mt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Time by Project</h3>
                
                <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let project of projectSummary">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div class="flex items-center">
                            <div class="h-4 w-4 rounded-full mr-2" [style.backgroundColor]="project.color"></div>
                            {{ project.name }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ project.hours }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ project.percentage }}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Daily Report -->
              <div *ngIf="reportType === 'daily'" class="mt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Daily Breakdown</h3>
                
                <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entries
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let day of dailyBreakdown">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ day.date }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ day.hours }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ day.entries }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Project Report -->
              <div *ngIf="reportType === 'project'" class="mt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
                
                <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let entry of filteredEntries">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div class="flex items-center">
                            <div class="h-4 w-4 rounded-full mr-2" [style.backgroundColor]="getProjectColor(entry.projectId)"></div>
                            {{ getProjectName(entry.projectId) }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ entry.description || 'No description' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ entry.startTime ?  formatDate(entry.startTime) : '' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ entry.duration ? formatDuration(entry) : '' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  timeEntries: TimeEntry[] = [];
  filteredEntries: TimeEntry[] = [];
  projects: Project[] = [];

  reportType = 'summary';
  dateRange = 'thisWeek';
  startDate = '';
  endDate = '';

  reportTitle = 'Weekly Summary';
  reportDateRange = '';
  totalHours = '0h';
  dailyAverage = '0h';
  uniqueProjects = 0;

  projectSummary: any[] = [];
  dailyBreakdown: any[] = [];

  constructor(
    private timeEntryService: TimeEntryService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    effect(() => {
      this.timeEntries = this.timeEntryService.timeEntries$();
      this.generateReport();
    });

    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
      this.generateReport();
    });

    // Set default dates for custom range
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    this.startDate = format(weekAgo, 'yyyy-MM-dd');
    this.endDate = format(today, 'yyyy-MM-dd');
  }

  generateReport(): void {
    // Get date range
    const { start, end } = this.getDateRange();

    // Filter entries by date range
    this.filteredEntries = this.timeEntries.filter(entry => {
      const entryDate = entry.startTime ? new Date(entry.startTime) : new Date();
      return entryDate >= start && entryDate <= end;
    });

    // Set report title and date range
    this.setReportTitleAndDateRange(start, end);

    // Calculate total hours
    const totalSeconds = this.calculateTotalSeconds(this.filteredEntries);
    const totalHours = totalSeconds / 3600;
    this.totalHours = `${Math.floor(totalHours)}h ${Math.floor((totalHours % 1) * 60)}m`;

    // Calculate daily average
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const avgHours = totalHours / days;
    this.dailyAverage = `${Math.floor(avgHours)}h ${Math.floor((avgHours % 1) * 60)}m`;

    // Count unique projects
    const projectIds = new Set(this.filteredEntries.map(entry => entry.projectId).filter(id => id));
    this.uniqueProjects = projectIds.size;

    // Generate report based on type
    switch (this.reportType) {
      case 'summary':
        this.generateSummaryReport();
        break;
      case 'daily':
        this.generateDailyReport(start, end);
        break;
      case 'weekly':
        // Similar to daily but grouped by week
        break;
      case 'monthly':
        // Similar to daily but grouped by month
        break;
      case 'project':
        // Already have filtered entries for project view
        break;
    }
  }

  getDateRange(): { start: Date, end: Date } {
    const today = new Date();
    let start: Date, end: Date;

    switch (this.dateRange) {
      case 'thisWeek':
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break; case 'lastWeek':
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        start = startOfWeek(lastWeek, { weekStartsOn: 1 });
        end = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'custom':
        start = this.startDate ? new Date(this.startDate) : new Date();
        end = this.endDate ? new Date(this.endDate) : new Date();
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
    }

    return { start, end };
  }

  setReportTitleAndDateRange(start: Date, end: Date): void {
    const dateRangeStr = `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
    this.reportDateRange = dateRangeStr;

    switch (this.reportType) {
      case 'summary':
        this.reportTitle = 'Summary Report';
        break;
      case 'daily':
        this.reportTitle = 'Daily Report';
        break;
      case 'weekly':
        this.reportTitle = 'Weekly Report';
        break;
      case 'monthly':
        this.reportTitle = 'Monthly Report';
        break;
      case 'project':
        this.reportTitle = 'Project Report';
        break;
    }
  }

  calculateTotalSeconds(entries: TimeEntry[]): number {
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

    return totalSeconds;
  }

  generateSummaryReport(): void {
    // Group entries by project
    const projectMap = new Map<string, TimeEntry[]>();

    this.filteredEntries.forEach(entry => {
      const projectId = entry.projectId || 'no-project';
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, []);
      }
      projectMap.get(projectId)?.push(entry);
    });

    // Calculate hours per project
    const totalSeconds = this.calculateTotalSeconds(this.filteredEntries);
    this.projectSummary = [];

    projectMap.forEach((entries, projectId) => {
      const projectSeconds = this.calculateTotalSeconds(entries);
      const projectHours = projectSeconds / 3600;
      const percentage = totalSeconds > 0 ? Math.round((projectSeconds / totalSeconds) * 100) : 0;

      let projectName = 'No Project';
      let projectColor = '#9CA3AF';

      if (projectId !== 'no-project') {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
          projectName = project.name;
          projectColor = project.color;
        }
      }

      this.projectSummary.push({
        id: projectId,
        name: projectName,
        color: projectColor,
        hours: `${Math.floor(projectHours)}h ${Math.floor((projectHours % 1) * 60)}m`,
        percentage
      });
    });

    // Sort by percentage (descending)
    this.projectSummary.sort((a, b) => b.percentage - a.percentage);
  }

  generateDailyReport(start: Date, end: Date): void {
    // Create array of days in the range
    const days = eachDayOfInterval({ start, end });

    // Initialize daily breakdown
    this.dailyBreakdown = days.map(day => {
      return {
        date: format(day, 'EEE, MMM d'),
        hours: '0h 0m',
        entries: 0,
        seconds: 0
      };
    });

    // Group entries by day
    this.filteredEntries.forEach(entry => {
      const entryDate = entry.startTime ? new Date(entry.startTime) : new Date();
      entryDate.setHours(0, 0, 0, 0);

      const dayIndex = days.findIndex(day => {
        const d = new Date(day);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === entryDate.getTime();
      });

      if (dayIndex >= 0) {
        let seconds = 0;
        if (entry.duration) {
          seconds = entry.duration;
        } else if (entry.startTime && entry.endTime) {
          seconds = differenceInSeconds(new Date(entry.endTime), new Date(entry.startTime));
        } else if (entry.startTime && entry.isRunning) {
          seconds = differenceInSeconds(new Date(), new Date(entry.startTime));
        }

        this.dailyBreakdown[dayIndex].seconds += seconds;
        this.dailyBreakdown[dayIndex].entries += 1;
      }
    });

    // Format hours
    this.dailyBreakdown.forEach(day => {
      const hours = day.seconds / 3600;
      day.hours = `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
    });

    // Sort by date (descending)
    this.dailyBreakdown.reverse();
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

  formatDate(date: Date): string {
    return format(new Date(date), 'MMM d, yyyy');
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

  exportReport(): void {
    // Generate CSV content based on report type
    let csvContent = '';

    switch (this.reportType) {
      case 'summary':
        csvContent = this.generateSummaryCSV();
        break;
      case 'daily':
        csvContent = this.generateDailyCSV();
        break;
      case 'project':
        csvContent = this.generateProjectCSV();
        break;
      default:
        csvContent = this.generateProjectCSV();
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `timetracker_${this.reportType}_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateSummaryCSV(): string {
    let csv = 'Project,Hours,Percentage\n';

    this.projectSummary.forEach(project => {
      csv += `"${project.name}","${project.hours}",${project.percentage}\n`;
    });

    return csv;
  }

  generateDailyCSV(): string {
    let csv = 'Date,Hours,Entries\n';

    this.dailyBreakdown.forEach(day => {
      csv += `"${day.date}","${day.hours}",${day.entries}\n`;
    });

    return csv;
  }

  generateProjectCSV(): string {
    let csv = 'Project,Description,Date,Start Time,End Time,Duration\n';

    this.filteredEntries.forEach(entry => {
      const projectName = this.getProjectName(entry.projectId);
      const description = entry.description || 'No description';
      const date = entry.startTime ? format(new Date(entry.startTime), 'yyyy-MM-dd') : '';
      const startTime = entry.startTime ? format(new Date(entry.startTime), 'HH:mm:ss') : '';
      const endTime = entry.endTime ? format(new Date(entry.endTime), 'HH:mm:ss') : 'Running';
      const duration = this.formatDuration(entry);

      csv += `"${projectName}","${description}","${date}","${startTime}","${endTime}","${duration}"\n`;
    });

    return csv;
  }
}