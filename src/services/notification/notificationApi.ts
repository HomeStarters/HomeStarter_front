import { userApiClient } from '../api/client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { ApiResponse } from '../../types/api';
import type { Notification, UnreadCountResponse } from '../../types/notification.types';

export const notificationApi = {
  // 알림 목록 조회
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await userApiClient.get<ApiResponse<Notification[]>>(
      API_ENDPOINTS.NOTIFICATION.LIST
    );
    return response.data;
  },

  // 알림 읽음 처리
  markAsRead: async (id: number): Promise<ApiResponse<void>> => {
    const response = await userApiClient.put<ApiResponse<void>>(
      API_ENDPOINTS.NOTIFICATION.READ(id)
    );
    return response.data;
  },

  // 읽지 않은 알림 수 조회
  getUnreadCount: async (): Promise<ApiResponse<UnreadCountResponse>> => {
    const response = await userApiClient.get<ApiResponse<UnreadCountResponse>>(
      API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT
    );
    return response.data;
  },
};
