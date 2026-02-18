import { calculatorApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';

// 재무 현황 DTO
export interface FinancialStatusDto {
  currentAssets: number;
  estimatedAssets: number;
  loanRequired: number;
}

// 대출 분석 DTO
export interface LoanAnalysisDto {
  ltv: number;
  dti: number;
  dsr: number;
  ltvLimit: number;
  dtiLimit: number;
  dsrLimit: number;
  isEligible: boolean;
  ineligibilityReasons: string[];
  monthlyPayment: number;
}

// 입주 후 재무상태 DTO
export interface AfterMoveInDto {
  assets: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  monthlyAvailableFunds: number;
}

// 계산 참여 가구원 정보
export interface CalculationResultMember {
  userId: string;
  name: string;
  role: string;
}

// 계산 결과 응답 타입
export interface CalculationResultResponse {
  id: string;
  userId: string;
  housingId: string;
  housingName: string;
  moveInDate: string;
  loanProductId: string;
  loanProductName: string;
  loanAmount: number;
  calculatedAt: string;
  financialStatus: FinancialStatusDto;
  loanAnalysis: LoanAnalysisDto;
  afterMoveIn: AfterMoveInDto;
  status: string;
  householdMembers?: CalculationResultMember[];
}

// 계산 결과 목록 항목 타입
export interface CalculationResultListItem {
  id: string;
  housingName: string;
  loanProductName: string;
  calculatedAt: string;
  status: string;
  monthlyAvailableFunds: number;
}

// 계산 결과 목록 응답 타입
export interface CalculationResultListResponse {
  results: CalculationResultListItem[];
  page: number;
  size: number;
  total: number;
}

// 계산 결과 목록 조회 파라미터
export interface CalculationResultListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  housingId?: string;
  status?: string;
}

// 계산 요청 타입
export interface CalculationRequest {
  housingId: string;
  loanProductId: string;
  loanAmount: number;
  loanTerm: number;
  householdMemberIds: string[];
}

// Calculator API 서비스
export const calculatorApi = {
  // 계산 결과 목록 조회
  getResults: async (params: CalculationResultListParams = {}): Promise<CalculationResultListResponse> => {
    const {
      page = 0,
      size = 20,
      sortBy = 'calculatedAt',
      sortOrder = 'desc',
      housingId,
      status,
    } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortOrder,
    });

    if (housingId) {
      queryParams.append('housingId', housingId);
    }

    if (status) {
      queryParams.append('status', status);
    }

    const response = await calculatorApiClient.get<CalculationResultListResponse>(
      `${API_ENDPOINTS.CALCULATOR.RESULTS}?${queryParams.toString()}`
    );
    return response.data;
  },

  // 계산 결과 상세 조회
  getResult: async (id: string): Promise<CalculationResultResponse> => {
    const response = await calculatorApiClient.get<CalculationResultResponse>(
      API_ENDPOINTS.CALCULATOR.RESULT_DETAIL(id)
    );
    return response.data;
  },

  // 입주 후 지출 계산 요청
  calculateHousingExpenses: async (data: CalculationRequest): Promise<CalculationResultResponse> => {
    const response = await calculatorApiClient.post<CalculationResultResponse>(
      API_ENDPOINTS.CALCULATOR.HOUSING_EXPENSES,
      data
    );
    return response.data;
  },

  // 계산 결과 삭제
  deleteResult: async (id: string): Promise<ApiResponse<void>> => {
    const response = await calculatorApiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.CALCULATOR.RESULT_DETAIL(id)
    );
    return response.data;
  },
};
