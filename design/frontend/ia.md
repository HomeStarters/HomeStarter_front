# 정보 아키텍처 (Information Architecture)

## 1. 사이트맵

```
내집마련 도우미 플랫폼
│
├─ 인증 (Public)
│  ├─ /login - 로그인
│  └─ /register - 회원가입
│
├─ 대시보드 (Protected)
│  └─ /dashboard - 메인 대시보드
│
├─ 프로필 관리 (Protected)
│  ├─ /profile/basic-info - 기본정보 입력/수정
│  └─ /profile/edit - 프로필 편집
│
├─ 자산 관리 (Protected)
│  ├─ /assets - 자산정보 관리 (조회/수정)
│  ├─ /assets/self - 본인 자산정보 입력
│  └─ /assets/spouse - 배우자 자산정보 입력
│
├─ 대출상품 (Protected)
│  ├─ /loans - 대출상품 목록
│  ├─ /loans/:id - 대출상품 상세
│  └─ /admin/loans - 대출상품 관리 (관리자 전용)
│
├─ 주택 관리 (Protected)
│  ├─ /housings - 입주희망주택 목록
│  ├─ /housings/:id - 입주희망주택 상세
│  ├─ /housings/new/basic - 주택 등록 - 기본정보
│  └─ /housings/new/detail - 주택 등록 - 상세정보
│
├─ 계산 및 분석 (Protected)
│  ├─ /calculator - 입주 후 지출 계산
│  └─ /calculator/results - 계산결과 목록
│     └─ /calculator/results/:id - 계산결과 상세 (Dialog)
│
└─ 로드맵 (Protected)
   ├─ /lifecycle-events - 생애주기 이벤트 관리
   └─ /roadmap - 장기주거 로드맵 조회
      └─ /roadmap?version={n} - 특정 버전 조회
```

## 2. 네비게이션 구조

### 2.1 Primary Navigation (BottomNavigation)

**모바일 및 태블릿**
```
┌─────────────────────────────────────────┐
│  🏠 대시보드  │  🏠 주택  │  💰 계산  │  🗺️ 로드맵  │
└─────────────────────────────────────────┘
```

- **대시보드**: `/dashboard`
- **주택**: `/housings`
- **계산**: `/calculator`
- **로드맵**: `/roadmap`

**데스크톱 (Drawer Navigation)**
```
┌─ Navigation Drawer ──┐
│ 🏠 대시보드          │
│ 👤 프로필            │
│ 💰 자산관리          │
│ 🏦 대출상품          │
│ 🏠 주택관리          │
│ 🧮 지출계산          │
│ 📅 생애주기이벤트     │
│ 🗺️ 로드맵           │
│ ─────────────────   │
│ 관리자 (조건부)      │
│ 🏦 대출상품관리      │
│ ─────────────────   │
│ ⚙️ 설정             │
│ 🚪 로그아웃          │
└─────────────────────┘
```

### 2.2 Secondary Navigation

#### AppBar Actions
- **Back Button**: 이전 페이지 또는 상위 계층
- **Search Icon**: 검색 기능 (대출상품, 주택 목록)
- **Add Button**: 새 항목 추가
- **Menu Icon**: 더보기 메뉴 (수정, 삭제 등)

#### Breadcrumbs (데스크톱)
```
홈 > 주택관리 > 주택 상세
홈 > 계산 > 계산결과 목록
```

### 2.3 Navigation Flow

#### 신규 사용자 온보딩
```
회원가입 → 로그인 → 기본정보입력 → 본인자산입력 → 배우자자산입력 → 대시보드
```

#### 주택 탐색 플로우
```
대시보드 → 주택목록 → 주택등록(기본) → 주택등록(상세) → 주택상세 → 지출계산 → 계산결과
```

#### 로드맵 생성 플로우
```
대시보드 → 생애주기이벤트관리 → 로드맵조회 → 로드맵생성요청 → 진행상황스트리밍 → 로드맵결과
```

## 3. 프로젝트 구조

### 3.1 디렉토리 구조

```
home_starter-front/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── runtime-env.js          # 런타임 환경 설정
│   └── assets/
│       ├── images/
│       └── icons/
│
├── src/
│   ├── main.tsx                # 애플리케이션 진입점
│   ├── App.tsx                 # 루트 컴포넌트
│   ├── vite-env.d.ts
│   │
│   ├── config/                 # 설정 파일
│   │   ├── api.config.ts       # API 엔드포인트 설정
│   │   ├── theme.ts            # MUI 테마 설정
│   │   └── constants.ts        # 상수 정의
│   │
│   ├── routes/                 # 라우팅 설정
│   │   ├── index.tsx           # 라우터 설정
│   │   ├── ProtectedRoute.tsx  # 인증 라우트 가드
│   │   └── AdminRoute.tsx      # 관리자 라우트 가드
│   │
│   ├── layouts/                # 레이아웃 컴포넌트
│   │   ├── MainLayout.tsx      # 메인 레이아웃 (AppBar + BottomNav)
│   │   ├── AuthLayout.tsx      # 인증 레이아웃
│   │   └── AdminLayout.tsx     # 관리자 레이아웃
│   │
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── BasicInfo.tsx
│   │   │   └── EditProfile.tsx
│   │   │
│   │   ├── assets/
│   │   │   ├── AssetManagement.tsx
│   │   │   ├── SelfAssetInput.tsx
│   │   │   └── SpouseAssetInput.tsx
│   │   │
│   │   ├── loans/
│   │   │   ├── LoanList.tsx
│   │   │   ├── LoanDetail.tsx
│   │   │   └── admin/
│   │   │       └── LoanManagement.tsx
│   │   │
│   │   ├── housings/
│   │   │   ├── HousingList.tsx
│   │   │   ├── HousingDetail.tsx
│   │   │   └── new/
│   │   │       ├── BasicInfo.tsx
│   │   │       └── DetailInfo.tsx
│   │   │
│   │   ├── calculator/
│   │   │   ├── Calculator.tsx
│   │   │   └── ResultList.tsx
│   │   │
│   │   └── roadmap/
│   │       ├── LifecycleEvents.tsx
│   │       └── Roadmap.tsx
│   │
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── AppBar.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── forms/              # 폼 컴포넌트
│   │   │   ├── AddressInput.tsx
│   │   │   ├── AmountInput.tsx
│   │   │   ├── DateInput.tsx
│   │   │   └── AssetItemList.tsx
│   │   │
│   │   ├── cards/              # 카드 컴포넌트
│   │   │   ├── FinancialSummaryCard.tsx
│   │   │   ├── QuickActionCard.tsx
│   │   │   ├── LoanProductCard.tsx
│   │   │   ├── HousingCard.tsx
│   │   │   └── CalculationResultCard.tsx
│   │   │
│   │   ├── display/            # 표시 컴포넌트
│   │   │   ├── AmountDisplay.tsx
│   │   │   ├── EligibilityBadge.tsx
│   │   │   ├── LoanConditionsTable.tsx
│   │   │   └── RoadmapStepper.tsx
│   │   │
│   │   └── feedback/           # 피드백 컴포넌트
│   │       ├── Snackbar.tsx
│   │       └── ProgressIndicator.tsx
│   │
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useAuth.ts          # 인증 훅
│   │   ├── useApi.ts           # API 호출 훅
│   │   ├── useForm.ts          # 폼 관리 훅
│   │   └── useLocalStorage.ts  # 로컬 스토리지 훅
│   │
│   ├── services/               # API 서비스
│   │   ├── api.ts              # Axios 인스턴스
│   │   ├── auth.service.ts     # 인증 API
│   │   ├── user.service.ts     # 사용자 API
│   │   ├── asset.service.ts    # 자산 API
│   │   ├── housing.service.ts  # 주택 API
│   │   ├── loan.service.ts     # 대출 API
│   │   ├── calculator.service.ts # 계산 API
│   │   └── roadmap.service.ts  # 로드맵 API
│   │
│   ├── store/                  # 상태 관리 (선택사항)
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   └── appSlice.ts
│   │
│   ├── types/                  # TypeScript 타입 정의
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── asset.types.ts
│   │   ├── housing.types.ts
│   │   ├── loan.types.ts
│   │   ├── calculator.types.ts
│   │   ├── roadmap.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── format.ts           # 포맷팅 (금액, 날짜 등)
│   │   ├── validation.ts       # 입력 검증
│   │   ├── storage.ts          # 로컬/세션 스토리지
│   │   └── helpers.ts          # 기타 헬퍼 함수
│   │
│   └── styles/                 # 전역 스타일
│       ├── global.css
│       └── variables.css
│
├── .env.development            # 개발 환경 변수
├── .env.production             # 운영 환경 변수
├── .eslintrc.json              # ESLint 설정
├── .prettierrc                 # Prettier 설정
├── tsconfig.json               # TypeScript 설정
├── vite.config.ts              # Vite 설정
├── package.json
└── README.md
```

### 3.2 주요 파일 설명

#### 3.2.1 진입점 (src/main.tsx)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import theme from './config/theme'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
```

#### 3.2.2 루트 컴포넌트 (src/App.tsx)
```typescript
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Routes from './routes'
import ErrorBoundary from './components/common/ErrorBoundary'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
```

#### 3.2.3 라우터 설정 (src/routes/index.tsx)
```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'

// Pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/dashboard/Dashboard'
// ... 기타 페이지 import

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/basic-info" element={<BasicInfo />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          {/* ... 기타 라우트 */}
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/loans" element={<LoanManagement />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
```

#### 3.2.4 API 설정 (src/config/api.config.ts)
```typescript
export const API_CONFIG = {
  API_GROUP: window.__runtime_config__?.API_GROUP || '/api/v1',
  USER_HOST: window.__runtime_config__?.USER_HOST || 'http://localhost:8081',
  ASSET_HOST: window.__runtime_config__?.ASSET_HOST || 'http://localhost:8082',
  HOUSING_HOST: window.__runtime_config__?.HOUSING_HOST || 'http://localhost:8084',
  LOAN_HOST: window.__runtime_config__?.LOAN_HOST || 'http://localhost:8083',
  CALCULATOR_HOST: window.__runtime_config__?.CALCULATOR_HOST || 'http://localhost:8085',
  ROADMAP_HOST: window.__runtime_config__?.ROADMAP_HOST || 'http://localhost:8086',
}

export const getApiUrl = (host: string, path: string) => {
  return `${host}${path}`
}
```

#### 3.2.5 런타임 환경 설정 (public/runtime-env.js)
```javascript
window.__runtime_config__ = {
  API_GROUP: "/api/v1",
  USER_HOST: "http://localhost:8081",
  ASSET_HOST: "http://localhost:8082",
  HOUSING_HOST: "http://localhost:8084",
  LOAN_HOST: "http://localhost:8083",
  CALCULATOR_HOST: "http://localhost:8085",
  ROADMAP_HOST: "http://localhost:8086"
}
```

#### 3.2.6 테마 설정 (src/config/theme.ts)
```typescript
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    secondary: {
      main: '#FF6F00',
      light: '#FF9800',
      dark: '#E65100',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

export default theme
```

#### 3.2.7 API 서비스 (src/services/api.ts)
```typescript
import axios, { AxiosInstance } from 'axios'
import { API_CONFIG } from '@/config/api.config'

// Axios 인스턴스 생성
export const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // 로그아웃 처리
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// 각 서비스별 인스턴스
export const userApi = createApiInstance(API_CONFIG.USER_HOST)
export const assetApi = createApiInstance(API_CONFIG.ASSET_HOST)
export const housingApi = createApiInstance(API_CONFIG.HOUSING_HOST)
export const loanApi = createApiInstance(API_CONFIG.LOAN_HOST)
export const calculatorApi = createApiInstance(API_CONFIG.CALCULATOR_HOST)
export const roadmapApi = createApiInstance(API_CONFIG.ROADMAP_HOST)
```

## 4. 컴포넌트 계층 구조

### 4.1 페이지별 컴포넌트 트리

#### 대시보드
```
Dashboard
├── AppBar
│   ├── UserProfile
│   └── NotificationIcon
├── FinancialSummaryCard
│   └── AmountDisplay × 4
├── QuickActionGrid
│   └── QuickActionCard × 5
└── RecentActivityTabs
    ├── HousingListTab
    │   └── HousingCard × N
    └── ResultListTab
        └── CalculationResultCard × N
```

#### 주택 등록 (기본정보)
```
HousingBasicInfo
├── AppBar
├── Stepper (1/2)
├── Form
│   ├── TextField (주택명)
│   ├── RadioGroup (주택유형)
│   ├── AmountInput (가격)
│   ├── DateInput (입주희망년월)
│   └── AddressInput
│       ├── TextField (도로명)
│       ├── TextField (지번)
│       ├── TextField (우편번호)
│       └── Button (주소 검색)
└── Button (다음)
```

#### 로드맵 조회
```
Roadmap
├── AppBar
│   └── Menu (버전 선택)
├── GoalHousingCard
├── RoadmapStepper
│   └── RoadmapStage × N
│       ├── HousingCharacteristics
│       ├── FinancialGoals
│       ├── Strategy
│       └── TipsList
├── ExecutionGuide
│   ├── MonthlySavingsPlanTable
│   ├── WarningsAlert
│   └── TipsList
└── Button (생성/재설계)
```

## 5. 상태 관리 전략

### 5.1 전역 상태 (Context API 또는 Redux)
- **인증 상태**: 로그인 여부, 사용자 정보, 토큰
- **애플리케이션 상태**: 로딩, 에러, 알림

### 5.2 서버 상태 (React Query)
- **캐싱**: API 응답 데이터
- **Prefetching**: 예상 페이지 데이터
- **Optimistic Updates**: 낙관적 업데이트

### 5.3 로컬 상태 (useState, useReducer)
- **폼 상태**: 입력값, 검증 에러
- **UI 상태**: 모달 열림/닫힘, 탭 선택

### 5.4 URL 상태 (React Router)
- **페이지 상태**: 현재 페이지, 파라미터
- **필터/정렬**: 검색어, 필터, 정렬 기준

## 6. 데이터 플로우

### 6.1 인증 플로우
```
로그인 페이지
  ↓ (아이디/비밀번호 제출)
User Service API
  ↓ (JWT 토큰 발급)
로컬 스토리지 저장
  ↓
전역 인증 상태 업데이트
  ↓
대시보드로 리디렉션
```

### 6.2 자산 정보 입력 플로우
```
본인 자산정보 입력 페이지
  ↓ (항목 추가/수정)
로컬 상태 업데이트
  ↓ (저장 버튼 클릭)
Asset Service API
  ↓ (성공 응답)
React Query 캐시 갱신
  ↓
대시보드로 이동
  ↓
대시보드에서 최신 데이터 표시
```

### 6.3 로드맵 생성 플로우
```
로드맵 조회 페이지
  ↓ (생성 버튼 클릭)
Roadmap Service API (POST /roadmaps)
  ↓ (202 Accepted, taskId 반환)
SSE 연결 (GET /roadmaps/tasks/{taskId}/stream)
  ↓ (진행상황 스트리밍)
진행률 표시 (LinearProgress)
  ↓ (COMPLETED)
로드맵 데이터 조회 및 표시
```

## 7. 접근 제어

### 7.1 인증 레벨
- **Public**: 로그인, 회원가입
- **Protected**: 대시보드, 프로필, 자산, 주택, 계산, 로드맵
- **Admin**: 대출상품 관리

### 7.2 권한 확인
```typescript
// ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

```typescript
// AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
```

## 8. 에러 처리 및 로딩 상태

### 8.1 에러 바운더리
```
App
└── ErrorBoundary (전역)
    └── Routes
        └── ErrorBoundary (페이지별)
            └── Page Component
```

### 8.2 로딩 상태
- **전체 페이지**: Suspense + Lazy Loading
- **데이터 로딩**: React Query의 isLoading
- **부분 로딩**: Skeleton 또는 CircularProgress

### 8.3 에러 표시
- **네트워크 에러**: Snackbar 알림
- **입력 검증 에러**: 필드별 에러 메시지
- **페이지 에러**: ErrorBoundary Fallback UI

## 9. SEO 및 메타데이터

### 9.1 페이지별 타이틀
```typescript
useEffect(() => {
  document.title = '대시보드 - 내집마련 도우미'
}, [])
```

### 9.2 메타 태그
```html
<meta name="description" content="내집마련을 위한 체계적인 재무 계획 도우미" />
<meta name="keywords" content="내집마련, 주택, 대출, 재무계획" />
```

## 10. 성능 최적화

### 10.1 코드 스플리팅
```typescript
const Dashboard = React.lazy(() => import('@/pages/dashboard/Dashboard'))
const HousingList = React.lazy(() => import('@/pages/housings/HousingList'))
// ... 기타 페이지
```

### 10.2 이미지 최적화
- WebP 포맷 사용
- Lazy Loading (Intersection Observer)
- 반응형 이미지 (srcset)

### 10.3 번들 최적화
- Tree Shaking
- Gzip/Brotli 압축
- 불필요한 라이브러리 제거

## 11. 접근성 (A11y)

### 11.1 시맨틱 HTML
- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`
- `<h1>`~`<h6>` 계층 구조

### 11.2 ARIA 속성
- `aria-label`, `aria-labelledby`
- `aria-describedby`
- `role` 속성

### 11.3 키보드 네비게이션
- Tab 순서
- Focus Management
- 단축키 (선택사항)

## 12. 국제화 (i18n) - 향후 고려사항

### 12.1 다국어 지원
- react-i18next 라이브러리
- 언어 파일: `src/locales/ko.json`, `src/locales/en.json`

### 12.2 숫자/날짜 포맷
- 지역별 형식 지원
- Intl.NumberFormat, Intl.DateTimeFormat
