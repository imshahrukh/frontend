import api from './api';
import type { ISalary, ISalaryFilterOptions, IAPIResponse } from '../types';

export interface IGenerateSalariesResponse {
  success: boolean;
  count: number;
  month: string;
  salaries: ISalary[];
  message: string;
}

export const salaryService = {
  /**
   * Get all salaries
   */
  async getSalaries(filters?: ISalaryFilterOptions): Promise<ISalary[]> {
    const response = await api.get<IAPIResponse<ISalary[]>>('/salaries', {
      params: filters,
    });
    return response.data.data || [];
  },

  /**
   * Get salary by ID
   */
  async getSalary(id: string): Promise<ISalary> {
    const response = await api.get<IAPIResponse<ISalary>>(`/salaries/${id}`);
    return response.data.data!;
  },

  /**
   * Generate monthly salaries
   */
  async generateSalaries(month: string): Promise<IGenerateSalariesResponse> {
    const response = await api.post<IGenerateSalariesResponse>('/salaries/generate', { month });
    return response.data;
  },

  /**
   * Recalculate salaries for a specific month (updates existing salaries with latest project data)
   */
  async recalculateSalaries(month: string): Promise<any> {
    const response = await api.post<any>('/salaries/recalculate', { month });
    return response.data;
  },

  /**
   * Update salary payment status
   */
  async updateSalaryStatus(
    id: string,
    status: 'Paid' | 'Pending',
    paidDate?: string,
    paymentReference?: string
  ): Promise<ISalary> {
    const response = await api.put<IAPIResponse<ISalary>>(`/salaries/${id}/status`, {
      status,
      paidDate,
      paymentReference,
    });
    return response.data.data!;
  },

  /**
   * Get salary history for employee
   */
  async getEmployeeSalaryHistory(employeeId: string): Promise<ISalary[]> {
    const response = await api.get<IAPIResponse<ISalary[]>>(`/salaries/employee/${employeeId}`);
    return response.data.data || [];
  },
};

