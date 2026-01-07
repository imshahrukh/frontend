import api from './api';
import type { IMonthlyProjectRevenue, IMonthlyRevenueFormData, IMonthlyRevenueResponse } from '../types';

export const monthlyRevenueService = {
  /**
   * Get all monthly revenues (optionally filtered by month)
   */
  async getMonthlyRevenues(month?: string): Promise<IMonthlyProjectRevenue[]> {
    const params = month ? { month } : {};
    const response = await api.get<{ success: boolean; data: IMonthlyProjectRevenue[] }>(
      '/monthly-revenues',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get revenues for a specific month with project list
   */
  async getRevenuesByMonth(month: string): Promise<IMonthlyRevenueResponse> {
    const response = await api.get<{ success: boolean; data: IMonthlyRevenueResponse }>(
      `/monthly-revenues/month/${month}`
    );
    return response.data.data;
  },

  /**
   * Get monthly revenue by ID
   */
  async getMonthlyRevenueById(id: string): Promise<IMonthlyProjectRevenue> {
    const response = await api.get<{ success: boolean; data: IMonthlyProjectRevenue }>(
      `/monthly-revenues/${id}`
    );
    return response.data.data;
  },

  /**
   * Create monthly revenue
   */
  async createMonthlyRevenue(data: IMonthlyRevenueFormData): Promise<IMonthlyProjectRevenue> {
    const response = await api.post<{ success: boolean; message: string; data: IMonthlyProjectRevenue }>(
      '/monthly-revenues',
      data
    );
    return response.data.data;
  },

  /**
   * Update monthly revenue
   */
  async updateMonthlyRevenue(id: string, data: Partial<IMonthlyRevenueFormData>): Promise<IMonthlyProjectRevenue> {
    const response = await api.put<{ success: boolean; message: string; data: IMonthlyProjectRevenue }>(
      `/monthly-revenues/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete monthly revenue
   */
  async deleteMonthlyRevenue(id: string): Promise<void> {
    await api.delete(`/monthly-revenues/${id}`);
  },

  /**
   * Bulk create/update monthly revenues
   */
  async bulkUpsertRevenues(revenues: IMonthlyRevenueFormData[]): Promise<IMonthlyProjectRevenue[]> {
    const response = await api.post<{ success: boolean; message: string; data: IMonthlyProjectRevenue[] }>(
      '/monthly-revenues/bulk',
      { revenues }
    );
    return response.data.data;
  },
};

