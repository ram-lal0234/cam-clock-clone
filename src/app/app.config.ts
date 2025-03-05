import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { SUPABASE_CLIENT } from './shared/providers/supabase.provider';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { routes } from './app.routes';

const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'sb-auth-token',
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: {
        getItem: (key) => {
          try {
            return sessionStorage.getItem(key);
          } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            sessionStorage.setItem(key, value);
          } catch (error) {
            console.error('Error setting item in storage:', error);
          }
        },
        removeItem: (key) => {
          try {
            sessionStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing item from storage:', error);
          }
        }
      }
    }
  }
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideExperimentalZonelessChangeDetection(),
    { provide: SUPABASE_CLIENT, useValue: supabase }
  ]
};