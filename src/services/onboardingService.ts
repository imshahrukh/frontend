import api from './api';

export interface IOnboardingRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  role: string;
  department: string;
  joiningDate: string;
  baseSalary: number;
  techStack: string[];
  bankName: string;
  accountHolderName: string;
  iban: string;
  swiftCode?: string;
  hasPayoneer: boolean;
  payoneerEmail?: string;
  payoneerAccountId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: any;
  reviewedAt?: string;
  reviewNotes?: string;
  employeeId?: any;
  createdAt: string;
  updatedAt: string;
}

export const onboardingService = {
  /**
   * Get all onboarding requests
   */
  async getOnboardingRequests(status?: string): Promise<IOnboardingRequest[]> {
    const params = status ? { status } : {};
    const response = await api.get<{ success: boolean; data: IOnboardingRequest[] }>(
      '/onboarding/requests',
      { params }
    );
    return response.data.data || [];
  },

  /**
   * Get single onboarding request
   */
  async getOnboardingRequest(id: string): Promise<IOnboardingRequest> {
    const response = await api.get<{ success: boolean; data: IOnboardingRequest }>(
      `/onboarding/requests/${id}`
    );
    return response.data.data;
  },

  /**
   * Update onboarding request
   */
  async updateOnboardingRequest(
    id: string,
    data: Partial<IOnboardingRequest>
  ): Promise<IOnboardingRequest> {
    const response = await api.put<{ success: boolean; data: IOnboardingRequest }>(
      `/onboarding/requests/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Approve onboarding request
   */
  async approveOnboardingRequest(
    id: string,
    baseSalary: number,
    reviewNotes?: string
  ): Promise<{ request: IOnboardingRequest; employee: any }> {
    const response = await api.post<{
      success: boolean;
      data: { request: IOnboardingRequest; employee: any };
    }>(`/onboarding/requests/${id}/approve`, { baseSalary, reviewNotes });
    return response.data.data;
  },

  /**
   * Reject onboarding request
   */
  async rejectOnboardingRequest(
    id: string,
    reviewNotes?: string
  ): Promise<IOnboardingRequest> {
    const response = await api.post<{ success: boolean; data: IOnboardingRequest }>(
      `/onboarding/requests/${id}/reject`,
      { reviewNotes }
    );
    return response.data.data;
  },

  /**
   * Delete onboarding request
   */
  async deleteOnboardingRequest(id: string): Promise<void> {
    await api.delete(`/onboarding/requests/${id}`);
  },
};

