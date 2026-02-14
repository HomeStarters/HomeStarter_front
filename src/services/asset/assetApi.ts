import { assetApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';

// 자산 항목 타입
export interface AssetItem {
  id: string;
  name: string;
  amount: number;
  category?: string;
  interestRate?: number;
  repaymentType?: string;
  expirationDate?: string;
  isExcludingCalculation?: boolean;
}

// 자산 정보 타입 (개별 사용자)
export interface AssetInfo {
  id?: number;  // asset ID
  assetId?: number;
  userId?: string;
  ownerType?: 'SELF' | 'SPOUSE';
  assets: AssetItem[];
  loans: AssetItem[];
  monthlyIncomes: AssetItem[];
  monthlyExpenses: AssetItem[];
  totalAssets: number;
  totalLoans: number;
  totalMonthlyIncome: number;
  totalMonthlyExpense: number;
  netAssets?: number;
  monthlyAvailableFunds?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 자산정보 수정 요청 타입
export interface AssetUpdateRequest {
  assets: AssetItem[];
  loans: AssetItem[];
  monthlyIncomes: AssetItem[];
  monthlyExpenses: AssetItem[];
}

// 재무 요약 타입
export interface CombinedSummary {
  totalAssets: number;
  totalLoans: number;
  totalMonthlyIncome: number;
  totalMonthlyExpense: number;
  netAssets: number;
  monthlyAvailableFunds: number;
}

// 자산 정보 응답 타입 (GET /api/v1/assets)
export interface AssetsResponse {
  assets: AssetInfo[];
  combinedSummary: CombinedSummary;
}

// 재무 요약 타입 (대시보드용)
export interface FinancialSummaryResponse {
  totalAssets: number;
  totalLoans: number;
  netAssets: number;
  monthlyAvailableFunds: number;
}

// 자산정보 저장 요청 타입
export interface AssetSaveRequest {
  assets: AssetItem[];
  loans: AssetItem[];
  monthlyIncomes: AssetItem[];
  monthlyExpenses: AssetItem[];
}

// Asset API 서비스
export const assetApi = {
  // 전체 자산정보 조회
  getAssets: async (): Promise<AssetsResponse> => {
    const response = await assetApiClient.get<AssetsResponse>(
      API_ENDPOINTS.ASSET.LIST
    );
    return response.data;
  },

  // 본인 자산정보 저장
  saveSelfAssets: async (data: AssetSaveRequest): Promise<ApiResponse<AssetInfo>> => {
    const response = await assetApiClient.post<ApiResponse<AssetInfo>>(
      API_ENDPOINTS.ASSET.SELF,
      data
    );
    return response.data;
  },

  // 배우자 자산정보 저장
  saveSpouseAssets: async (data: AssetSaveRequest): Promise<ApiResponse<AssetInfo>> => {
    const response = await assetApiClient.post<ApiResponse<AssetInfo>>(
      API_ENDPOINTS.ASSET.SPOUSE,
      data
    );
    return response.data;
  },

  // 본인 자산정보 조회
  getSelfAssets: async (): Promise<ApiResponse<AssetInfo>> => {
    const response = await assetApiClient.get<ApiResponse<AssetInfo>>(
      API_ENDPOINTS.ASSET.SELF
    );
    return response.data;
  },

  // 배우자 자산정보 조회
  getSpouseAssets: async (): Promise<ApiResponse<AssetInfo>> => {
    const response = await assetApiClient.get<ApiResponse<AssetInfo>>(
      API_ENDPOINTS.ASSET.SPOUSE
    );
    return response.data;
  },

  // 자산정보 수정 (PUT /api/v1/assets/{id})
  updateAssets: async (id: number, data: AssetUpdateRequest): Promise<ApiResponse<AssetInfo>> => {
    const response = await assetApiClient.put<ApiResponse<AssetInfo>>(
      API_ENDPOINTS.ASSET.DETAIL(String(id)),
      data
    );
    return response.data;
  },

  // 자산정보 직접 입력 (POST /api/v1/assets/{userId}?ownerType=SELF|SPOUSE)
  createAssetsByUserId: async (
    userId: string,
    ownerType: 'SELF' | 'SPOUSE',
    data: AssetUpdateRequest
  ): Promise<ApiResponse<AssetInfo>> => {
    const response = await assetApiClient.post<ApiResponse<AssetInfo>>(
      API_ENDPOINTS.ASSET.CREATE_BY_USER(userId, ownerType),
      data
    );
    return response.data;
  },

  // 자산상세정보 삭제 (DELETE /api/v1/assets/{assetType}/{id})
  deleteAssetItem: async (
    assetType: 'assets' | 'loans' | 'monthlyIncome' | 'monthlyExpense',
    id: string
  ): Promise<void> => {
    await assetApiClient.delete(
      API_ENDPOINTS.ASSET.DELETE_ITEM(assetType, id)
    );
  },

  // 대시보드용 재무 요약 계산 (combinedSummary 사용)
  calculateFinancialSummary: (data: AssetsResponse): FinancialSummaryResponse => {
    // combinedSummary가 있으면 그대로 사용
    if (data.combinedSummary) {
      return {
        totalAssets: data.combinedSummary.totalAssets,
        totalLoans: data.combinedSummary.totalLoans,
        netAssets: data.combinedSummary.netAssets,
        monthlyAvailableFunds: data.combinedSummary.monthlyAvailableFunds,
      };
    }

    // combinedSummary가 없으면 assets 배열에서 계산
    let totalAssets = 0;
    let totalLoans = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    data.assets?.forEach((asset) => {
      totalAssets += asset.totalAssets || 0;
      totalLoans += asset.totalLoans || 0;
      totalIncome += asset.totalMonthlyIncome || 0;
      totalExpense += asset.totalMonthlyExpense || 0;
    });

    return {
      totalAssets,
      totalLoans,
      netAssets: totalAssets - totalLoans,
      monthlyAvailableFunds: totalIncome - totalExpense,
    };
  },
};
