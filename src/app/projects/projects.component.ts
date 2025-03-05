import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../shared/services/project.service';
import { Project } from '../shared/models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900">Projects</h1>
            
            <button (click)="showNewProjectForm = true" class="btn btn-primary">
              New Project
            </button>
          </div>
          
          <!-- New Project Form -->
          <div *ngIf="showNewProjectForm" class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Create New Project</h2>
            
            <form [formGroup]="projectForm" (ngSubmit)="createProject()">
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
                <button type="button" (click)="cancelProjectForm()" class="btn btn-secondary mr-3">
                  Cancel
                </button>
                <button type="submit" [disabled]="projectForm.invalid || isSubmitting" class="btn btn-primary">
                  <span *ngIf="isSubmitting" class="mr-2">
                    <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Create Project
                </button>
              </div>
            </form>
          </div>
          
          <!-- Projects List -->
          <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div *ngFor="let project of projects" class="bg-white overflow-hidden shadow rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-12 w-12 rounded-md flex items-center justify-center" [style.backgroundColor]="project.color">
                      <span class="text-white text-lg font-bold">
                        {{ getProjectInitials(project) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">{{ project.name }}</h3>
                    <p class="text-sm text-gray-500 truncate">{{ project.description || 'No description' }}</p>
                  </div>
                </div>
                
                <div class="mt-4 flex justify-end">
                  <a [routerLink]="['/projects', project.id]" class="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View Details
                  </a>
                </div>
              </div>
            </div>
            
            <div *ngIf="projects.length === 0 && !isLoading" class="sm:col-span-3 text-center py-12">
              <p class="text-gray-500">No projects found. Create your first project to get started.</p>
            </div>
            
            <div *ngIf="isLoading" class="sm:col-span-3 text-center py-12">
              <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  
  showNewProjectForm = false;
  projectForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      color: ['#3b82f6']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  createProject(): void {
    if (this.projectForm.invalid) return;
    
    this.isSubmitting = true;
    
    const project = this.projectForm.value;
    
    this.projectService.createProject(project).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showNewProjectForm = false;
        this.resetProjectForm();
        this.loadProjects();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating project:', error);
      }
    });
  }

  cancelProjectForm(): void {
    this.showNewProjectForm = false;
    this.resetProjectForm();
  }

  resetProjectForm(): void {
    this.projectForm.reset({
      name: '',
      description: '',
      color: '#3b82f6'
    });
  }

  getProjectInitials(project: Project): string {
    const words = project.name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  }
}