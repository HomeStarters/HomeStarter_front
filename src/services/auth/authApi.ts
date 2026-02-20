import { userApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';

// 로그인 요청 타입
export interface LoginRequest {
  userId: string;
  password: string;
  rememberMe?: boolean;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    userId: string;
    name: string;
    email: string;
    isAdmin?: boolean;
  };
}

// 회원가입 요청 타입
export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  userId: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
}

// 회원가입 응답 타입
export interface RegisterResponse {
  userId: string;
  email: string;
}

// 인증 API
export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await userApiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.USER.LOGIN,
      data
    );
    return response.data;
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await userApiClient.post<ApiResponse<RegisterResponse>>(
      API_ENDPOINTS.USER.REGISTER,
      data
    );
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await userApiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.USER.LOGOUT
    );
    return response.data;
  },

  // 프로필 조회 (세션 복원용)
  getProfile: async (): Promise<ApiResponse<LoginResponse['user']>> => {
    const response = await userApiClient.get<ApiResponse<LoginResponse['user']>>(
      API_ENDPOINTS.USER.PROFILE
    );
    return response.data;
  },
};
