import api from './api';
import type { IProjectHistory } from '../types';

export const projectHistoryService = {
  /**
   * Get project history
   */
  async getProjectHistory(projectId: string): Promise<IProjectHistory[]> {
    const response = await api.get<{ success: boolean; data: IProjectHistory[] }>(
      `/projects/${projectId}/history`
    );
    return response.data.data;
  },
};

