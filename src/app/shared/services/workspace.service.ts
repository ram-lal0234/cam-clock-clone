import { Injectable, inject, signal, effect } from '@angular/core';
import { SupabaseClient, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Workspace, WorkspaceMember } from '../models/workspace.model';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';
import { SUPABASE_CLIENT } from '../providers/supabase.provider';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private currentWorkspaceSignal = signal<Workspace | null>(null);
  private workspacesSignal = signal<Workspace[]>([]);
  
  currentWorkspace$ = this.currentWorkspaceSignal.asReadonly();
  workspaces$ = this.workspacesSignal.asReadonly();

  constructor(private supabaseService: SupabaseService) {
    // Listen for auth state changes
    effect(() => {
      const user = this.supabaseService.authState$();
      if (user?.id) {
        this.loadWorkspaces(user.id);
      } else {
        this.currentWorkspaceSignal.set(null);
        this.workspacesSignal.set([]);
      }
    });
  }

  private loadWorkspaces(userId: string) {
    // First, get all workspaces the user is a member of
    from(this.supabase
      .from('workspace_members')
      .select(`
        workspace:workspaces(*)
      `)
      .eq('user_id', userId)
    ).subscribe(({ data, error }) => {
      if (error) {
        console.error('Error loading workspace members:', error);
        return;
      }

      const workspaces = (data || []).map(member => ({
        id: member.workspace.id,
        name: member.workspace.name,
        ownerId: member.workspace.owner_id,
        isPersonal: member.workspace.owner_id === userId,
        createdAt: new Date(member.workspace.created_at),
        updatedAt: new Date(member.workspace.updated_at),
        members: [] // Will be populated later if needed
      })) as Workspace[];

      this.workspacesSignal.set(workspaces);

      // Then, get the current workspace
      from(this.supabase
        .from('users')
        .select('workspace_id')
        .eq('id', userId)
        .single()
      ).subscribe(({ data: userData, error: userError }) => {
        if (userError) {
          console.error('Error loading user workspace:', userError);
          return;
        }

        const currentWorkspace = workspaces.find(w => w.id === userData.workspace_id);
        this.currentWorkspaceSignal.set(currentWorkspace || null);
      });
    });
  }

  getCurrentWorkspace(): Observable<Workspace | null> {
    return from([this.currentWorkspaceSignal()]);
  }

  getAllWorkspaces(): Observable<Workspace[]> {
    return from([this.workspacesSignal()]);
  }

  createWorkspace(name: string): Observable<Workspace> {
    const user = this.supabaseService.authState$();
    if (!user?.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const newWorkspace = {
      name,
      owner_id: user.id,
      is_personal: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return from(this.supabase
      .from('workspaces')
      .insert(newWorkspace)
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
      }),
      switchMap(workspace => {
        // Add user as workspace member
        const memberData = {
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin',
          joined_at: new Date().toISOString()
        };

        return from(this.supabase
          .from('workspace_members')
          .insert(memberData)
        ).pipe(
          map(() => workspace)
        );
      }),
      switchMap(workspace => {
        // Update user with workspace ID
        return from(this.supabase
          .from('users')
          .update({
            workspace_id: workspace.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        ).pipe(
          map(() => workspace)
        );
      })
    );
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Observable<void> {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    return from(this.supabase
      .from('workspaces')
      .update(updatedData)
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  deleteWorkspace(id: string): Observable<void> {
    return from(this.supabase
      .from('workspaces')
      .delete()
      .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  getWorkspaceMembers(workspaceId: string): Observable<User[]> {
    return from(this.supabase
      .from('workspace_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('workspace_id', workspaceId)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.map(member => ({
          ...member.user,
          id: member.user.id,
          createdAt: new Date(member.user.created_at),
          lastLogin: new Date(member.user.last_sign_in_at)
        }));
      })
    );
  }

  addMember(workspaceId: string, email: string, role: 'admin' | 'member'): Observable<void> {
    return from(this.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    ).pipe(
      switchMap(({ data: user, error: userError }) => {
        if (userError) throw userError;
        if (!user) throw new Error('User not found');

        const newMember = {
          workspace_id: workspaceId,
          user_id: user.id,
          role,
          joined_at: new Date().toISOString()
        };

        return from(this.supabase
          .from('workspace_members')
          .insert(newMember)
        ).pipe(
          map(({ error }) => {
            if (error) throw error;
          })
        );
      })
    );
  }

  updateMemberRole(workspaceId: string, userId: string, role: 'admin' | 'member'): Observable<void> {
    return from(this.supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  removeMember(workspaceId: string, userId: string): Observable<void> {
    return from(this.supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  setCurrentWorkspace(workspace: Workspace): Observable<void> {
    const user = this.supabaseService.authState$();
    if (!user?.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(this.supabase
      .from('users')
      .update({
        workspace_id: workspace.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        this.currentWorkspaceSignal.set(workspace);
      })
    );
  }
}