import { Injectable, inject, signal } from '@angular/core';
import { SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { User } from '../models/user.model';
import { SUPABASE_CLIENT } from '../providers/supabase.provider';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private authStateSignal = signal<User | null>(null);
  authState$ = this.authStateSignal.asReadonly();

  constructor() {
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.['first_name'] || '',
          last_name: session.user.user_metadata?.['last_name'] || '',
          timezone: session.user.user_metadata?.['timezone'] || 'UTC',
          is_active: true,
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: session.user.last_sign_in_at || new Date().toISOString(),
          display_name: session.user.user_metadata?.['display_name'] || '',
          workspace_id: session.user.user_metadata?.['workspace_id'] || ''
        };
        this.authStateSignal.set(user);
      } else {
        this.authStateSignal.set(null);
      }
    });
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && error.name === 'NavigatorLockAcquireTimeoutError') {
          if (attempt < maxRetries - 1) {
            const delay = initialDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        throw lastError;
      }
    }
    
    throw lastError;
  }

  async signIn(email: string, password: string) {
    return this.retryWithBackoff(() => 
      this.supabase.auth.signInWithPassword({ email, password })
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  async signUp(email: string, password: string) {
    return this.retryWithBackoff(() => 
      this.supabase.auth.signUp({ email, password })
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    );
  }

  async signOut() {
    return this.retryWithBackoff(() => 
      this.supabase.auth.signOut()
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  async resetPasswordForEmail(email: string) {
    return this.retryWithBackoff(() => 
      this.supabase.auth.resetPasswordForEmail(email)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  async createUser(userData: { 
    id: string; 
    email: string; 
    display_name: string;
    created_at: string; 
    last_login: string; 
  }): Promise<void> {
    try {
      await this.retryWithBackoff(() =>
        new Promise<void>((resolve, reject) => {
          this.supabase
            .from('users')
            .insert(userData)
            .then(({ error }) => {
              if (error) reject(error);
              else resolve();
            });
        })
      );
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserProfile(profile: UserProfile) {
    return this.supabase
      .from('user_profiles')
      .insert(profile);
  }
}