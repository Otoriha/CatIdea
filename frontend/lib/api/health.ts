import apiClient from './client';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export const healthApi = {
  // ヘルスチェック
  check: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};