import { userApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';
import type {
  HouseholdMembersResponse,
  HouseholdInviteRequest,
  HouseholdInviteResponse,
} from '../../types/household.types';

export const householdApi = {
  // 가구원 목록 조회
  getMembers: async (): Promise<ApiResponse<HouseholdMembersResponse>> => {
    const response = await userApiClient.get<ApiResponse<HouseholdMembersResponse>>(
      API_ENDPOINTS.HOUSEHOLD.MEMBERS
    );
    return response.data;
  },

  // 가구원 초대
  invite: async (data: HouseholdInviteRequest): Promise<ApiResponse<HouseholdInviteResponse>> => {
    const response = await userApiClient.post<ApiResponse<HouseholdInviteResponse>>(
      API_ENDPOINTS.HOUSEHOLD.INVITE,
      data
    );
    return response.data;
  },

  // 초대 수락
  acceptInvite: async (id: number): Promise<ApiResponse<void>> => {
    const response = await userApiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.HOUSEHOLD.INVITE_ACCEPT(id)
    );
    return response.data;
  },

  // 초대 거절
  rejectInvite: async (id: number): Promise<ApiResponse<void>> => {
    const response = await userApiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.HOUSEHOLD.INVITE_REJECT(id)
    );
    return response.data;
  },

  // 가구원 제거
  deleteMember: async (id: string): Promise<ApiResponse<void>> => {
    const response = await userApiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.HOUSEHOLD.MEMBER_DELETE(id)
    );
    return response.data;
  },

  // OWNER 권한 위임
  delegateOwner: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await userApiClient.put<ApiResponse<void>>(
      API_ENDPOINTS.HOUSEHOLD.DELEGATE_OWNER(userId)
    );
    return response.data;
  },
};
