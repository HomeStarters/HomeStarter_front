// 가구원 역할
export type HouseholdRole = 'OWNER' | 'MEMBER';

// 초대 상태
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

// 가구원 정보
export interface HouseholdMember {
  id: number;
  userId: string;
  name: string;
  role: HouseholdRole;
  joinedAt: string;
}

// 가구원 목록 응답
export interface HouseholdMembersResponse {
  members: HouseholdMember[];
}

// 가구원 초대 요청
export interface HouseholdInviteRequest {
  targetUserId: string;
}

// 가구원 초대 응답
export interface HouseholdInviteResponse {
  id: number;
  targetUserId: string;
  status: InvitationStatus;
  createdAt: string;
}
