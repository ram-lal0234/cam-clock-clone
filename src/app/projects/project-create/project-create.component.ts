import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';  // Fixed import
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SharedModule } from 'primeng/api';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    CardModule,
    SharedModule
  ],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent {
  projectForm: FormGroup;
  isLoading = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      client: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;
    this.isLoading = true;
    console.log(this.projectForm.value);
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}