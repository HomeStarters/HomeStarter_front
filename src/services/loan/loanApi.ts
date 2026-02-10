import { loanApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';

// 대출상품 DTO 타입 (API 응답과 일치)
export interface LoanProductDTO {
  id: number;
  name: string;
  loanLimit: number;
  dsrLimit: number;
  isApplyLtv: boolean;
  isApplyDti: boolean;
  isApplyDsr: boolean;
  interestRate: number;
  targetHousing: string;
  incomeRequirement?: string;
  applicantRequirement?: string;
  remarks?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 기존 타입 유지 (호환성)
export interface LoanProduct {
  id: number;
  name: string;
  loanLimit: number;
  dsrLimit: number;
  isApplyLtv: boolean;
  isApplyDti: boolean;
  isApplyDsr: boolean;
  targetHousing: string;
  incomeRequirement?: string;
  applicantRequirement?: string;
  interestRate: number;
  note?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// 대출상품 목록 응답 타입
export interface LoanProductListResponse {
  content: LoanProduct[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// API 응답의 목록 데이터 타입
export interface LoanProductListData {
  content: LoanProductDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

// 대출상품 목록 조회 파라미터
export interface LoanProductListParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  targetHousing?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 대출상품 생성 요청 타입
export interface CreateLoanProductRequest {
  name: string;
  loanLimit: number;
  dsrLimit: number;
  isApplyLtv: boolean;
  isApplyDti: boolean;
  isApplyDsr: boolean;
  interestRate: number;
  targetHousing: string;
  incomeRequirement?: string;
  applicantRequirement?: string;
  remarks?: string;
}

// 대출상품 수정 요청 타입
export interface UpdateLoanProductRequest extends CreateLoanProductRequest {
  active: boolean;
}

// Loan API 서비스
export const loanApi = {
  // 대출상품 목록 조회
  getLoans: async (params: LoanProductListParams = {}): Promise<ApiResponse<LoanProductListResponse>> => {
    const {
      page = 0,
      size = 20,
      sort = 'createdAt',
      direction = 'DESC',
      targetHousing,
    } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
      direction,
    });

    if (targetHousing) {
      queryParams.append('targetHousing', targetHousing);
    }

    const response = await loanApiClient.get<ApiResponse<LoanProductListResponse>>(
      `${API_ENDPOINTS.LOAN.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  // 대출상품 상세 조회
  getLoan: async (id: number): Promise<ApiResponse<LoanProduct>> => {
    const response = await loanApiClient.get<ApiResponse<LoanProduct>>(
      API_ENDPOINTS.LOAN.DETAIL(id)
    );
    return response.data;
  },

  // 대출상품 목록 조회 (API 응답 형식)
  getLoanProducts: async (params: LoanProductListParams = {}): Promise<ApiResponse<LoanProductListData>> => {
    const {
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      keyword,
      targetHousing,
    } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortOrder,
    });

    if (keyword) {
      queryParams.append('keyword', keyword);
    }
    if (targetHousing) {
      queryParams.append('housingType', targetHousing);
    }

    const response = await loanApiClient.get<ApiResponse<LoanProductListData>>(
      `${API_ENDPOINTS.LOAN.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  // [관리자] 대출상품 등록
  createLoanProduct: async (data: CreateLoanProductRequest): Promise<ApiResponse<LoanProductDTO>> => {
    const response = await loanApiClient.post<ApiResponse<LoanProductDTO>>(
      API_ENDPOINTS.LOAN.ADMIN_CREATE,
      data
    );
    return response.data;
  },

  // [관리자] 대출상품 수정
  updateLoanProduct: async (id: number, data: UpdateLoanProductRequest): Promise<ApiResponse<LoanProductDTO>> => {
    const response = await loanApiClient.put<ApiResponse<LoanProductDTO>>(
      API_ENDPOINTS.LOAN.ADMIN_UPDATE(id),
      data
    );
    return response.data;
  },

  // [관리자] 대출상품 삭제
  deleteLoanProduct: async (id: number): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await loanApiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.LOAN.ADMIN_DELETE(id)
    );
    return response.data;
  },
};
