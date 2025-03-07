import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  projectId: string = '';
  activeTab: 'overview' | 'tasks' | 'team' | 'settings' = 'overview';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
  }

  setActiveTab(tab: 'overview' | 'tasks' | 'team' | 'settings') {
    this.activeTab = tab;
  }
}