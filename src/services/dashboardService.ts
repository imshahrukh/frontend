import api from './api';
import type { IDashboardMetrics, IAPIResponse } from '../types';

export const dashboardService = {
  /**
   * Get dashboard metrics
   */
  async getMetrics(filters?: { month?: string; department?: string }): Promise<IDashboardMetrics> {
    const response = await api.get<IAPIResponse<IDashboardMetrics>>('/dashboard/metrics', {
      params: filters,
    });
    return response.data.data!;
  },

  /**
   * Get salary overview
   */
  async getSalaryOverview(month?: string): Promise<IDashboardMetrics['salaryOverview']> {
    const response = await api.get<IAPIResponse<IDashboardMetrics['salaryOverview']>>(
      '/dashboard/salary-overview',
      {
        params: { month },
      }
    );
    return response.data.data!;
  },
};

