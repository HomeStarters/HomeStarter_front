// API 호스트 설정
// runtime-env.js에서 설정한 값을 우선 사용하고, 없으면 환경변수 사용
const getRuntimeConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__runtime_config__) {
    return (window as any).__runtime_config__;
  }
  return null;
};

const runtimeConfig = getRuntimeConfig();

// ?? 연산자 사용: null/undefined만 체크하여 빈 문자열("")도 유효한 값으로 처리
export const API_CONFIG = {
  API_GROUP: runtimeConfig?.API_GROUP ?? import.meta.env.VITE_API_GROUP ?? '/api/v1',
  USER_HOST: runtimeConfig?.USER_HOST ?? import.meta.env.VITE_USER_HOST ?? 'http://localhost:8081',
  ASSET_HOST: runtimeConfig?.ASSET_HOST ?? import.meta.env.VITE_ASSET_HOST ?? 'http://localhost:8082',
  HOUSING_HOST: runtimeConfig?.HOUSING_HOST ?? import.meta.env.VITE_HOUSING_HOST ?? 'http://localhost:8084',
  LOAN_HOST: runtimeConfig?.LOAN_HOST ?? import.meta.env.VITE_LOAN_HOST ?? 'http://localhost:8083',
  CALCULATOR_HOST: runtimeConfig?.CALCULATOR_HOST ?? import.meta.env.VITE_CALCULATOR_HOST ?? 'http://localhost:8085',
  ROADMAP_HOST: runtimeConfig?.ROADMAP_HOST ?? import.meta.env.VITE_ROADMAP_HOST ?? 'http://localhost:8086',
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // User Service
  USER: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
    PROFILE: '/users/profile',
  },

  // Asset Service
  ASSET: {
    SELF: `${API_CONFIG.API_GROUP}/assets/self`,
    SPOUSE: `${API_CONFIG.API_GROUP}/assets/spouse`,
    LIST: `${API_CONFIG.API_GROUP}/assets`,
    HOUSEHOLD: `${API_CONFIG.API_GROUP}/assets/household`,
    DETAIL: (id: string) => `${API_CONFIG.API_GROUP}/assets/${id}`,
    CREATE_BY_USER: (userId: string, ownerType: 'SELF' | 'SPOUSE') =>
      `${API_CONFIG.API_GROUP}/assets/${userId}?ownerType=${ownerType}`,
    DELETE_ITEM: (assetType: string, id: string) =>
      `${API_CONFIG.API_GROUP}/assets/${assetType}/${id}`,
  },

  // Housing Service
  HOUSING: {
    LIST: '/housings',
    CREATE: '/housings',
    DETAIL: (id: number) => `/housings/${id}`,
    UPDATE: (id: number) => `/housings/${id}`,
    DELETE: (id: number) => `/housings/${id}`,
    SET_GOAL: (id: number) => `/housings/${id}/goal`,
  },

  // Loan Service
  LOAN: {
    LIST: `${API_CONFIG.API_GROUP}/loans`,
    DETAIL: (id: number) => `${API_CONFIG.API_GROUP}/loans/${id}`,
    ADMIN_CREATE: `${API_CONFIG.API_GROUP}/admin/loans`,
    ADMIN_UPDATE: (id: number) => `${API_CONFIG.API_GROUP}/admin/loans/${id}`,
    ADMIN_DELETE: (id: number) => `${API_CONFIG.API_GROUP}/admin/loans/${id}`,
  },

  // Calculator Service
  CALCULATOR: {
    HOUSING_EXPENSES: '/calculator/housing-expenses',
    RESULTS: '/calculator/results',
    RESULT_DETAIL: (id: string) => `/calculator/results/${id}`,
    DELETE_RESULT: (id: string) => `/calculator/results/${id}`,
  },

  // Household Service
  HOUSEHOLD: {
    INVITE: '/users/household/invite',
    INVITE_ACCEPT: (id: number) => `/users/household/invite/${id}/accept`,
    INVITE_REJECT: (id: number) => `/users/household/invite/${id}/reject`,
    MEMBERS: '/users/household/members',
    MEMBER_DELETE: (id: string) => `/users/household/members/${id}`,
    DELEGATE_OWNER: (userId: string) => `/users/household/members/${userId}/delegate-owner`,
  },

  // Notification Service
  NOTIFICATION: {
    LIST: '/users/notifications',
    READ: (id: number) => `/users/notifications/${id}/read`,
    UNREAD_COUNT: '/users/notifications/unread-count',
  },

  // Roadmap Service
  ROADMAP: {
    LIST: '/roadmaps',
    CREATE: '/roadmaps',
    UPDATE: '/roadmaps',
    STATUS: (requestId: string) => `/roadmaps/status/${requestId}`,
    STREAM: (taskId: string) => `/roadmaps/tasks/${taskId}/stream`,
    VERSIONS: '/roadmaps/versions',
    LIFECYCLE_EVENTS: '/lifecycle-events',
    LIFECYCLE_EVENT_DETAIL: (id: string) => `/lifecycle-events/${id}`,
  },
};

// 타임아웃 설정
export const TIMEOUT_CONFIG = {
  DEFAULT: 30000,  // 30초
  UPLOAD: 60000,   // 60초
  DOWNLOAD: 60000, // 60초
};

// 재시도 설정
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1초
};
