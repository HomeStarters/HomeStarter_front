// API 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
}

// 페이징 정보
export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// 주소 타입
export interface Address {
  roadAddress?: string;
  jibunAddress?: string;
  fullAddress?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
