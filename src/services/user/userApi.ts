import { userApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse, Address } from '../../types/api';

// 회원가입 요청 타입
export interface RegisterRequest {
  userId: string;
  password: string;
  passwordConfirm: string;
  name: string;
  email: string;
  phoneNumber: string;
  agreeTerms: boolean;
}

// 회원가입 응답 타입
export interface RegisterResponse {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

// 사용자 프로필 타입
export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  currentAddress?: Address;
  userWorkplaceAddress?: Address;
  spouseWorkplaceAddress?: Address;
  withholdingTaxSalary?: number;
  investmentPropensity?: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  updatedAt: string;
}

// 프로필 업데이트 요청 타입
export interface UserProfileUpdateRequest {
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  currentAddress?: string;
  userWorkplaceAddress?: string;
  spouseWorkplaceAddress?: string;
  withholdingTaxSalary?: number;
  investmentPropensity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

// 사용자 API
export const userApi = {
  // 회원가입
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await userApiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.USER.REGISTER,
      data
    );
    return response.data;
  },

  // 프로필 조회
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await userApiClient.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE
    );
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (
    data: UserProfileUpdateRequest
  ): Promise<ApiResponse<UserProfile>> => {
    const response = await userApiClient.put<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE,
      data
    );
    return response.data;
  },
};
