import api from './api';
import type { IEmployee, IEmployeeFormData, IAPIResponse } from '../types';

export const employeeService = {
  /**
   * Get all employees
   */
  async getEmployees(filters?: Record<string, string>): Promise<IEmployee[]> {
    const response = await api.get<IAPIResponse<IEmployee[]>>('/employees', {
      params: filters,
    });
    return response.data.data || [];
  },

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<IEmployee> {
    const response = await api.get<IAPIResponse<IEmployee>>(`/employees/${id}`);
    return response.data.data!;
  },

  /**
   * Create new employee
   */
  async createEmployee(data: IEmployeeFormData): Promise<IEmployee> {
    const response = await api.post<IAPIResponse<IEmployee>>('/employees', data);
    return response.data.data!;
  },

  /**
   * Update employee
   */
  async updateEmployee(id: string, data: Partial<IEmployeeFormData>): Promise<IEmployee> {
    const response = await api.put<IAPIResponse<IEmployee>>(`/employees/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};

