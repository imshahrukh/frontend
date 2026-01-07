import api from './api';
import type { IDepartment, IAPIResponse } from '../types';

export const departmentService = {
  /**
   * Get all departments
   */
  async getDepartments(): Promise<IDepartment[]> {
    const response = await api.get<IAPIResponse<IDepartment[]>>('/departments');
    return response.data.data || [];
  },

  /**
   * Create new department
   */
  async createDepartment(data: { name: string; description?: string }): Promise<IDepartment> {
    const response = await api.post<IAPIResponse<IDepartment>>('/departments', data);
    return response.data.data!;
  },
};

