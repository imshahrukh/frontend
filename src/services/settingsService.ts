import api from './api';

export interface ISettings {
  _id: string;
  usdToPkrRate: number;
  pmCommissionPercentage: number;
  teamLeadBonusAmount: number;
  bidderBonusAmount: number;
  lastUpdatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISettingsUpdate {
  usdToPkrRate?: number;
  pmCommissionPercentage?: number;
  teamLeadBonusAmount?: number;
  bidderBonusAmount?: number;
}

export const settingsService = {
  /**
   * Get application settings
   */
  async getSettings(): Promise<ISettings> {
    const response = await api.get<{ success: boolean; data: ISettings }>('/settings');
    return response.data.data;
  },

  /**
   * Update application settings
   */
  async updateSettings(settings: ISettingsUpdate): Promise<ISettings> {
    const response = await api.put<{ success: boolean; message: string; data: ISettings }>(
      '/settings',
      settings
    );
    return response.data.data;
  },
};
