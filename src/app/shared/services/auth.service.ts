import { Injectable, signal, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  user$ = this.userSignal.asReadonly();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Initialize user state from session
    this.supabase.getCurrentUser().then(({ data: { user } }) => {
      if (user) {
        this.loadUserData(user.id);
      }
    });

    // Listen for auth state changes
    effect(() => {
      const user = this.supabase.authState$();
      if (user) {
        this.loadUserData(user.id);
      } else {
        this.userSignal.set(null);
      }
    });
  }

  private async loadUserData(userId: string) {
    const { data: { user } } = await this.supabase.getCurrentUser();
    if (user) {
      this.userSignal.set(this.mapSupabaseUser(user));
    }
  }

  private mapSupabaseUser(supabaseUser: SupabaseUser): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      first_name: supabaseUser.user_metadata?.['first_name'] || '',
      last_name: supabaseUser.user_metadata?.['last_name'] || '',
      timezone: supabaseUser.user_metadata?.['timezone'] || 'UTC',
      is_active: true,
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: supabaseUser.last_sign_in_at || new Date().toISOString(),
      display_name: supabaseUser.user_metadata?.['display_name'] || '',
      workspace_id: supabaseUser.user_metadata?.['workspace_id'] || ''
    };
  }

  signUp(email: string, password: string, name: string): Observable<{ user: User | null; session: any }> {
    return from(this.supabase.signUp(email, password)).pipe(
      switchMap((response) => {
        if (!response.user) throw new Error('No user data returned');

        // Create user profile
        const userProfile = {
          id: response.user.id,
          email: response.user.email!,
          full_name: name,
          first_name: name.split(' ')[0] || '',
          last_name: name.split(' ').slice(1).join(' ') || '',
          timezone: 'UTC',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };

        return from(this.supabase.createUserProfile(userProfile)).pipe(
          map(() => ({ user: response.user, session: response.session }))
        );
      }),
      tap(() => {
        // Navigate to create workspace page after successful signup
        this.router.navigate(['/auth/create-workspace']);
      }),
      map(data => ({
        user: data.user ? this.mapSupabaseUser(data.user) : null,
        session: data.session
      })),
      catchError(error => {
        console.error('Sign up error:', error);
        throw error;
      })
    );
  }

  signIn(email: string, password: string): Observable<User> {
    return from(this.supabase.signIn(email, password)).pipe(
      map(data => {
        if (!data.user) throw new Error('User data is missing after signin');
        return this.mapSupabaseUser(data.user);
      }),
      catchError(error => {
        console.error('Sign in error:', error);
        throw error;
      })
    );
  }

  signOut(): Observable<void> {
    return from(this.supabase.signOut()).pipe(
      tap(() => {
        this.userSignal.set(null);
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        console.error('Sign out error:', error);
        throw error;
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(this.supabase.resetPasswordForEmail(email)).pipe(
      catchError(error => {
        console.error('Reset password error:', error);
        throw error;
      })
    );
  }
}