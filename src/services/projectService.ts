import api from './api';
import type { IProject, IProjectFormData, IAPIResponse } from '../types';

export const projectService = {
  /**
   * Get all projects
   */
  async getProjects(filters?: Record<string, string>): Promise<IProject[]> {
    const response = await api.get<IAPIResponse<IProject[]>>('/projects', {
      params: filters,
    });
    return response.data.data || [];
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<IProject> {
    const response = await api.get<IAPIResponse<IProject>>(`/projects/${id}`);
    return response.data.data!;
  },

  /**
   * Create new project
   */
  async createProject(data: IProjectFormData): Promise<IProject> {
    const response = await api.post<IAPIResponse<IProject>>('/projects', data);
    return response.data.data!;
  },

  /**
   * Update project
   */
  async updateProject(id: string, data: Partial<IProjectFormData>): Promise<IProject> {
    const response = await api.put<IAPIResponse<IProject>>(`/projects/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  /**
   * Assign team members to project
   */
  async assignTeam(id: string, team: IProjectFormData['team']): Promise<IProject> {
    const response = await api.post<IAPIResponse<IProject>>(`/projects/${id}/assign`, { team });
    return response.data.data!;
  },
};

