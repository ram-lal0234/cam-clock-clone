import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { SupabaseService } from './supabase.service';
import { SUPABASE_CLIENT } from '../providers/supabase.provider';
import { toObservable } from '@angular/core/rxjs-interop';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  constructor(private supabaseService: SupabaseService) { }

  getProjects(): Observable<Project[]> {
    return toObservable(this.supabaseService.authState$).pipe(
      switchMap((user: User | null) => {
        if (!user?.id) {
          return from([]);
        }

        return from(this.supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('name')
        ).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return data.map(project => ({
              ...project,
              id: project.id,
              createdAt: new Date(project.created_at),
              updatedAt: new Date(project.updated_at)
            }));
          })
        );
      })
    );
  }

  getProject(id: string): Observable<Project> {
    return from(this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) throw new Error('Project not found');
        return {
          ...data,
          id: data.id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
      })
    );
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return toObservable(this.supabaseService.authState$).pipe(
      switchMap((user: User | null) => {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        const newProject = {
          name: project.name || 'New Project',
          workspace_id: project.workspace_id || '',
          color: project.color || '#3b82f6',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return from(this.supabase
          .from('projects')
          .insert(newProject)
          .select()
          .single()
        ).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return {
              ...data,
              id: data.id,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at)
            };
          })
        );
      })
    );
  }

  updateProject(id: string, updates: Partial<Project>): Observable<void> {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    return from(this.supabase
      .from('projects')
      .update(updatedData)
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  deleteProject(id: string): Observable<void> {
    return from(this.supabase
      .from('projects')
      .delete()
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  archiveProject(id: string): Observable<void> {
    return from(this.supabase
      .from('projects')
      .update({ is_archived: true })
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}