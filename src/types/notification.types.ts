// 알림 유형
export type NotificationType = 'HOUSEHOLD_INVITATION' | 'HOUSEHOLD_ACCEPTED' | 'HOUSEHOLD_REJECTED';

// 알림 정보
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  referenceId?: number;
}

// 읽지 않은 알림 수 응답
export interface UnreadCountResponse {
  unreadCount: number;
}
