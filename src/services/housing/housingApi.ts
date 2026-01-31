import { housingApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';

// 주소 정보 타입
export interface AddressRequest {
  fullAddress: string;
  roadAddress?: string;
  jibunAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressResponse {
  fullAddress: string;
  roadAddress?: string;
  jibunAddress?: string;
  latitude?: number;
  longitude?: number;
}

// 출퇴근 시간 정보 타입
export interface CommuteTimeRequest {
  selfBefore9am?: number;
  selfAfter6pm?: number;
  spouseBefore9am?: number;
  spouseAfter6pm?: number;
}

export interface CommuteTimeResponse {
  selfBefore9am?: number;
  selfAfter6pm?: number;
  spouseBefore9am?: number;
  spouseAfter6pm?: number;
}

// 교통 정보 타입
export type TransportType = 'SUBWAY' | 'BUS' | 'TRAIN';

export interface TransportationRequest {
  transportType: TransportType;
  lineName?: string;
  stationName: string;
  distance?: number;
  walkingTime?: number;
  commuteTime?: CommuteTimeRequest;
}

export interface TransportationResponse {
  id: number;
  transportType: TransportType;
  lineName?: string;
  stationName: string;
  distance?: number;
  walkingTime?: number;
  commuteTime?: CommuteTimeResponse;
}

// 단지 정보 타입
export interface ComplexInfo {
  complexName?: string;
  totalHouseholds?: number;
  totalDong?: number;
  totalFloors?: number;
  parkingCount?: number;
  moveInDate?: string;
  constructionCompany?: string;
  houseArea?: number;
  exclusiveArea?: number;
  floor?: number;
  direction?: string;
}

// 주거환경 정보 타입
export type SunlightLevel = 'VERY_GOOD' | 'GOOD' | 'AVERAGE' | 'POOR';
export type NoiseLevel = 'VERY_QUIET' | 'QUIET' | 'NORMAL' | 'NOISY';

export interface LivingEnvironment {
  sunlightLevel?: SunlightLevel;
  noiseLevel?: NoiseLevel;
  nearbySchools?: string[];
  nearbyMarts?: string[];
  nearbyHospitals?: string[];
}

// 주택 유형
export type HousingType = 'APARTMENT' | 'OFFICETEL' | 'VILLA' | 'HOUSE';

// 주택 생성 요청 타입
export interface HousingCreateRequest {
  housingName: string;
  housingType: HousingType;
  price: number;
  moveInDate?: string; // YYYY-MM 형식
  completionDate?: string; // YYYY-MM-DD 형식
  address: string;
  // address: AddressRequest;
  complexInfo?: ComplexInfo;
  livingEnvironment?: LivingEnvironment;
  transportations?: TransportationRequest[];
}

// 주택 수정 요청 타입
export interface HousingUpdateRequest {
  housingName: string;
  housingType: HousingType;
  price: number;
  moveInDate?: string;
  completionDate?: string;
  address: string;
  // address: AddressRequest;
  complexInfo?: ComplexInfo;
  livingEnvironment?: LivingEnvironment;
  transportations?: TransportationRequest[];
}

// 주택 응답 타입
export interface HousingResponse {
  id: number;
  housingName: string;
  housingType: HousingType;
  price: number;
  moveInDate?: string;
  completionDate?: string;
  address: AddressResponse;
  complexInfo?: ComplexInfo;
  livingEnvironment?: LivingEnvironment;
  isGoal: boolean;
  transportations?: TransportationResponse[];
  createdAt: string;
  updatedAt: string;
}

// 주택 목록 항목 타입
export interface HousingListItem {
  id: number;
  housingName: string;
  housingType: HousingType;
  price: number;
  fullAddress: string;
  isGoal: boolean;
  createdAt: string;
}

// 주택 목록 응답 타입
export interface HousingListResponse {
  housings: HousingListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// 최종목표 주택 설정 응답 타입
export interface GoalHousingResponse {
  housingId: number;
  housingName: string;
  message: string;
}

// 주택 목록 조회 파라미터
export interface HousingListParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  housingType?: HousingType;
}

// Housing API 서비스
export const housingApi = {
  // 주택 목록 조회
  getHousings: async (params: HousingListParams = {}): Promise<ApiResponse<HousingListResponse>> => {
    const {
      page = 0,
      size = 10,
      sort = 'createdAt',
      direction = 'DESC',
      housingType,
    } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
      direction,
    });

    if (housingType) {
      queryParams.append('housingType', housingType);
    }

    const response = await housingApiClient.get<ApiResponse<HousingListResponse>>(
      `${API_ENDPOINTS.HOUSING.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  // 주택 상세 조회
  getHousing: async (id: number): Promise<ApiResponse<HousingResponse>> => {
    const response = await housingApiClient.get<ApiResponse<HousingResponse>>(
      API_ENDPOINTS.HOUSING.DETAIL(id)
    );
    return response.data;
  },

  // 주택 등록
  createHousing: async (data: HousingCreateRequest): Promise<ApiResponse<HousingResponse>> => {
    const response = await housingApiClient.post<ApiResponse<HousingResponse>>(
      API_ENDPOINTS.HOUSING.CREATE,
      data
    );
    return response.data;
  },

  // 주택 수정
  updateHousing: async (id: number, data: HousingUpdateRequest): Promise<ApiResponse<HousingResponse>> => {
    const response = await housingApiClient.put<ApiResponse<HousingResponse>>(
      API_ENDPOINTS.HOUSING.UPDATE(id),
      data
    );
    return response.data;
  },

  // 주택 삭제
  deleteHousing: async (id: number): Promise<ApiResponse<void>> => {
    const response = await housingApiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.HOUSING.DELETE(id)
    );
    return response.data;
  },

  // 최종목표 주택 설정
  setGoalHousing: async (id: number): Promise<ApiResponse<GoalHousingResponse>> => {
    const response = await housingApiClient.put<ApiResponse<GoalHousingResponse>>(
      API_ENDPOINTS.HOUSING.SET_GOAL(id)
    );
    return response.data;
  },
};
