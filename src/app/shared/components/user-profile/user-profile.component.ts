import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  user$ = this.authService.user$;  // Use the signal directly
  isMenuOpen = false;

  constructor(private authService: AuthService) {}

  getUserInitials(): string {
    const user = this.authService.user$();
    if (!user?.email) return '';
    return user.email.split('@')[0].substring(0, 2).toUpperCase();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  signOut() {
    this.authService.signOut().subscribe();
  }
}