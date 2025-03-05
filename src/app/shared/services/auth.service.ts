import { Injectable, signal, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { User as SupabaseUser } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);
  user$ = this.userSignal.asReadonly();

  constructor(private supabase: SupabaseService) {
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
      tap(() => {
        // After successful signup, create user in users table
        this.createUserInTable(email, name);
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

  private async createUserInTable(email: string, name: string) {
    const { data: { user } } = await this.supabase.getCurrentUser();
    if (!user) return;

    await this.supabase.createUser({
      id: user.id,
      email: email,
      display_name: name,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    });
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
      tap(() => this.userSignal.set(null)),
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