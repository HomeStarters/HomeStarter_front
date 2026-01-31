import { userApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';
import type { DashboardData, FinancialSummary } from '../../types/dashboard.types';

// 대시보드 API 서비스

export const dashboardApi = {
  // 대시보드 전체 데이터 조회
  getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await userApiClient.get<ApiResponse<DashboardData>>(
      `${API_ENDPOINTS.USER.PROFILE}/dashboard`
    );
    return response.data;
  },

  // 재무 현황만 조회
  getFinancialSummary: async (): Promise<ApiResponse<FinancialSummary>> => {
    const response = await userApiClient.get<ApiResponse<FinancialSummary>>(
      `${API_ENDPOINTS.USER.PROFILE}/financial-summary`
    );
    return response.data;
  },
};
