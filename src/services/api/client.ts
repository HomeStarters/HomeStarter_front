import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { store } from '../../store';
import { logout, refreshTokenSuccess } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';

// Axios 인스턴스 생성 함수
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Redux store에서 액세스 토큰 가져오기
      const state = store.getState();
      const { accessToken } = state.auth;

      // 토큰이 있으면 헤더에 추가
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // 개발 환경에서 요청 로깅
      if (import.meta.env.DEV) {
        console.log('[API Request]', config.method?.toUpperCase(), config.url);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  client.interceptors.response.use(
    (response) => {
      // 개발 환경에서 응답 로깅
      if (import.meta.env.DEV) {
        console.log('[API Response]', response.config.url, response.status);
      }
      return response;
    },
    async (error: AxiosError<any>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // 개발 환경에서 에러 로깅
      if (import.meta.env.DEV) {
        console.error('[API Error]', error.config?.url, error.response?.status);
      }

      // 401 Unauthorized 처리
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // 리프레시 토큰으로 새 액세스 토큰 발급
          const state = store.getState();
          const { refreshToken } = state.auth;

          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post(
            `${API_CONFIG.USER_HOST}/users/refresh`,
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

          // Redux store 업데이트
          store.dispatch(
            refreshTokenSuccess({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            })
          );

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return client(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 로그아웃
          store.dispatch(logout());
          store.dispatch(
            openSnackbar({
              message: '세션이 만료되었습니다. 다시 로그인해주세요.',
              severity: 'warning',
            })
          );
          return Promise.reject(refreshError);
        }
      }

      // 에러 메시지 추출
      const errorMessage =
        (error.response?.data as any)?.message ||
        error.message ||
        '요청 처리 중 오류가 발생했습니다.';

      // 사용자에게 에러 표시
      store.dispatch(
        openSnackbar({
          message: errorMessage,
          severity: 'error',
        })
      );

      return Promise.reject(error);
    }
  );

  return client;
};

// 서비스별 API 클라이언트
export const userApiClient = createApiClient(API_CONFIG.USER_HOST);
export const assetApiClient = createApiClient(API_CONFIG.ASSET_HOST);
export const housingApiClient = createApiClient(API_CONFIG.HOUSING_HOST);
export const loanApiClient = createApiClient(API_CONFIG.LOAN_HOST);
export const calculatorApiClient = createApiClient(API_CONFIG.CALCULATOR_HOST);
export const roadmapApiClient = createApiClient(API_CONFIG.ROADMAP_HOST);
