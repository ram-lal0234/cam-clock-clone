import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimeEntry } from '../models/time-entry.model';
import { SupabaseService } from './supabase.service';
import { SUPABASE_CLIENT } from '../providers/supabase.provider';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {
  private supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private timeEntriesSignal = signal<TimeEntry[]>([]);
  timeEntries$ = this.timeEntriesSignal.asReadonly();
  
  private activeTimeEntrySignal = signal<TimeEntry | null>(null);
  activeTimeEntry$ = this.activeTimeEntrySignal.asReadonly();

  constructor(private supabaseService: SupabaseService) {
    effect(() => {
      const user = this.supabaseService.authState$();
      if (user) {
        this.loadTimeEntries(user.id);
      } else {
        this.timeEntriesSignal.set([]);
        this.activeTimeEntrySignal.set(null);
      }
    });
  }

  private loadTimeEntries(userId: string) {
    from(this.supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
    ).subscribe(({ data, error }) => {
      if (error) {
        console.error('Error loading time entries:', error);
        return;
      }
      
      const timeEntries = data.map(entry => ({
        ...entry,
        id: entry.id,
        startTime: new Date(entry.start_time),
        endTime: entry.end_time ? new Date(entry.end_time) : null,
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at)
      }));
      
      this.timeEntriesSignal.set(timeEntries);
      
      // Set active time entry if exists
      const activeEntry = timeEntries.find(entry => !entry.endTime);
      this.activeTimeEntrySignal.set(activeEntry || null);
    });
  }

  startTimeEntry(projectId: string, description: string = ''): Observable<TimeEntry> {
    const user = this.supabaseService.authState$();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const newEntry = {
      user_id: user.id,
      project_id: projectId,
      description,
      start_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return from(this.supabase
      .from('time_entries')
      .insert(newEntry)
      .select()
      .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return {
          ...data,
          id: data.id,
          startTime: new Date(data.start_time),
          endTime: data.end_time ? new Date(data.end_time) : null,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
      })
    );
  }

  stopTimeEntry(id: string, description: string = ''): Observable<TimeEntry> {
    return from(this.supabase
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return {
          ...data,
          id: data.id,
          startTime: new Date(data.start_time),
          endTime: data.end_time ? new Date(data.end_time) : null,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
      })
    );
  }

  updateTimeEntry(id: string, updates: Partial<TimeEntry>): Observable<void> {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return from(this.supabase
      .from('time_entries')
      .update(updatedData)
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  deleteTimeEntry(id: string): Observable<void> {
    return from(this.supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}