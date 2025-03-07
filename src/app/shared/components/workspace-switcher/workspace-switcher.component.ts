import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workspace-switcher.component.html',
  styleUrls: ['./workspace-switcher.component.css']
})
export class WorkspaceSwitcherComponent {
  workspaces$ = this.workspaceService.workspaces$;
  currentWorkspace$ = this.workspaceService.currentWorkspace$;
  isMenuOpen = false;

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) { }

  toggleDropdown() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectWorkspace(workspace: Workspace) {
    if (workspace.id === this.currentWorkspace$()?.id) {
      this.isMenuOpen = false;
      return;
    }

    this.workspaceService.setCurrentWorkspace(workspace).subscribe({
      next: () => {
        this.isMenuOpen = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  createNewWorkspace() {
    this.isMenuOpen = false;
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