# API 매핑 설계서

## 1. API 경로 매핑

### 1.1 런타임 환경 설정 (public/runtime-env.js)

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

### 1.2 서비스별 호스트 매핑

| 서비스 | 호스트 변수 | 개발 환경 | 운영 환경 (예시) |
|--------|-------------|-----------|------------------|
| User Service | USER_HOST | http://localhost:8081 | https://user.homestarter.com |
| Asset Service | ASSET_HOST | http://localhost:8082 | https://asset.homestarter.com |
| Housing Service | HOUSING_HOST | http://localhost:8084 | https://housing.homestarter.com |
| Loan Service | LOAN_HOST | http://localhost:8083 | https://loan.homestarter.com |
| Calculator Service | CALCULATOR_HOST | http://localhost:8085 | https://calculator.homestarter.com |
| Roadmap Service | ROADMAP_HOST | http://localhost:8086 | https://roadmap.homestarter.com |

## 2. API와 화면 기능 매핑

### 2.1 인증 관련 (User Service)

#### 01. 로그인 화면

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 로그인 | User Service | /users/login | POST | 로그인 및 JWT 토큰 발급 |

**요청 데이터 구조:**
```typescript
interface UserLoginRequest {
  userId: string;        // 아이디 (필수)
  password: string;      // 비밀번호 (필수)
  rememberMe?: boolean;  // 로그인 유지 (선택)
}
```

**요청 데이터 예시:**
```json
{
  "userId": "user123",
  "password": "password1234!",
  "rememberMe": true
}
```

**응답 데이터 구조:**
```typescript
interface ApiResponseUserLoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;      // JWT 액세스 토큰
    refreshToken: string;     // JWT 리프레시 토큰
    tokenType: string;        // "Bearer"
    expiresIn: number;        // 만료 시간 (초)
    user: {
      userId: string;
      name: string;
      email: string;
    };
  };
}
```

**응답 데이터 예시:**
```json
{
  "success": true,
  "message": "로그인에 성공했습니다",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "userId": "user123",
      "name": "김민준",
      "email": "user123@example.com"
    }
  }
}
```

#### 02. 회원가입 화면

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 회원가입 | User Service | /users/register | POST | 신규 사용자 회원가입 |

**요청 데이터 구조:**
```typescript
interface UserRegisterRequest {
  name: string;             // 이름 (2-50자, 필수)
  email: string;            // 이메일 (필수)
  phoneNumber: string;      // 전화번호 (01X-XXXX-XXXX, 필수)
  userId: string;           // 아이디 (5-20자, 영문+숫자, 필수)
  password: string;         // 비밀번호 (8자 이상, 필수)
  passwordConfirm: string;  // 비밀번호 확인 (필수)
  agreeTerms: boolean;      // 약관 동의 (필수)
}
```

**요청 데이터 예시:**
```json
{
  "name": "김민준",
  "email": "user123@example.com",
  "phoneNumber": "01012345678",
  "userId": "user123",
  "password": "password1234!",
  "passwordConfirm": "password1234!",
  "agreeTerms": true
}
```

**응답 데이터 구조:**
```typescript
interface ApiResponseUserRegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
  };
}
```

**응답 데이터 예시:**
```json
{
  "success": true,
  "message": "회원가입에 성공했습니다",
  "data": {
    "userId": "user123",
    "email": "user123@example.com"
  }
}
```

#### 로그아웃 (공통)

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 로그아웃 | User Service | /users/logout | POST | 로그아웃 및 토큰 무효화 |

**요청 데이터:** 없음 (Header에 JWT 토큰 필요)

**응답 데이터 구조:**
```typescript
interface ApiResponseVoid {
  success: boolean;
  message: string;
  data: null;
}
```

**응답 데이터 예시:**
```json
{
  "success": true,
  "message": "로그아웃되었습니다",
  "data": null
}
```

### 2.2 프로필 관리 (User Service)

#### 03. 기본정보 입력 화면

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 기본정보 조회 | User Service | /users/profile | GET | 사용자 기본정보 조회 |
| 기본정보 수정 | User Service | /users/profile | PUT | 사용자 기본정보 수정 |

**요청 데이터 구조 (수정):**
```typescript
interface UserProfileUpdateRequest {
  currentAddress?: {
    roadAddress: string;
    jibunAddress: string;
    postalCode: string;      // 5자리 우편번호
    latitude: number;
    longitude: number;
  };
  userWorkplaceAddress?: {
    roadAddress: string;
    jibunAddress: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  spouseWorkplaceAddress?: {
    roadAddress: string;
    jibunAddress: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  investmentPropensity?: 'HIGH' | 'MEDIUM' | 'LOW';
}
```

**요청 데이터 예시:**
```json
{
  "currentAddress": {
    "roadAddress": "서울특별시 강남구 테헤란로 123",
    "jibunAddress": "서울특별시 강남구 역삼동 123-45",
    "postalCode": "06234",
    "latitude": 37.5012345,
    "longitude": 127.0398765
  },
  "userWorkplaceAddress": {
    "roadAddress": "서울특별시 강남구 강남대로 456",
    "jibunAddress": "서울특별시 강남구 역삼동 456-78",
    "postalCode": "06235",
    "latitude": 37.5023456,
    "longitude": 127.0412345
  },
  "investmentPropensity": "MEDIUM"
}
```

**응답 데이터 구조:**
```typescript
interface ApiResponseUserProfileResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    birthDate: string;          // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE';
    currentAddress: AddressResponse;
    userWorkplaceAddress: AddressResponse;
    spouseWorkplaceAddress: AddressResponse;
    investmentPropensity: 'HIGH' | 'MEDIUM' | 'LOW';
    createdAt: string;          // ISO 8601
    updatedAt: string;          // ISO 8601
  };
}
```

**응답 데이터 예시:**
```json
{
  "success": true,
  "message": "기본정보가 저장되었습니다",
  "data": {
    "userId": "user123",
    "name": "김민준",
    "email": "user123@example.com",
    "phoneNumber": "01012345678",
    "birthDate": "1990-05-15",
    "gender": "MALE",
    "currentAddress": {
      "roadAddress": "서울특별시 강남구 테헤란로 123",
      "jibunAddress": "서울특별시 강남구 역삼동 123-45",
      "postalCode": "06234",
      "latitude": 37.5012345,
      "longitude": 127.0398765
    },
    "userWorkplaceAddress": {
      "roadAddress": "서울특별시 강남구 강남대로 456",
      "jibunAddress": "서울특별시 강남구 역삼동 456-78",
      "postalCode": "06235",
      "latitude": 37.5023456,
      "longitude": 127.0412345
    },
    "spouseWorkplaceAddress": null,
    "investmentPropensity": "MEDIUM",
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-04T14:30:00Z"
  }
}
```

#### 04. 프로필 편집 화면

**기본정보 조회/수정과 동일한 API 사용**

### 2.3 자산 관리 (Asset Service)

#### 05. 본인 자산정보 입력

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 본인 자산정보 입력 | Asset Service | /api/v1/assets/self | POST | 본인 자산정보 등록 |

**요청 데이터 구조:**
```typescript
interface CreateAssetRequest {
  assets?: Array<{
    name: string;    // 항목명
    amount: number;  // 금액
  }>;
  loans?: Array<{
    name: string;
    amount: number;
  }>;
  monthlyIncomes?: Array<{
    name: string;
    amount: number;
  }>;
  monthlyExpenses?: Array<{
    name: string;
    amount: number;
  }>;
}
```

**요청 데이터 예시:**
```json
{
  "assets": [
    {"name": "예금", "amount": 50000000},
    {"name": "적금", "amount": 30000000}
  ],
  "loans": [
    {"name": "신용대출", "amount": 10000000}
  ],
  "monthlyIncomes": [
    {"name": "급여", "amount": 5000000}
  ],
  "monthlyExpenses": [
    {"name": "생활비", "amount": 2000000},
    {"name": "교통비", "amount": 300000}
  ]
}
```

**응답 데이터 구조:**
```typescript
interface AssetResponse {
  userId: string;
  ownerType: 'SELF' | 'SPOUSE';
  assets: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  loans: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  monthlyIncomes: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  monthlyExpenses: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  totalAssets: number;           // 총 자산
  totalLoans: number;            // 총 대출
  totalMonthlyIncome: number;    // 월 소득
  totalMonthlyExpense: number;   // 월 지출
  netAssets: number;             // 순자산 (자산 - 대출)
  monthlyAvailableFunds: number; // 월 가용자금 (월소득 - 월지출)
  createdAt: string;
  updatedAt: string;
}
```

**응답 데이터 예시:**
```json
{
  "userId": "user123",
  "ownerType": "SELF",
  "assets": [
    {"id": "a1", "name": "예금", "amount": 50000000},
    {"id": "a2", "name": "적금", "amount": 30000000}
  ],
  "loans": [
    {"id": "l1", "name": "신용대출", "amount": 10000000}
  ],
  "monthlyIncomes": [
    {"id": "i1", "name": "급여", "amount": 5000000}
  ],
  "monthlyExpenses": [
    {"id": "e1", "name": "생활비", "amount": 2000000},
    {"id": "e2", "name": "교통비", "amount": 300000}
  ],
  "totalAssets": 80000000,
  "totalLoans": 10000000,
  "totalMonthlyIncome": 5000000,
  "totalMonthlyExpense": 2300000,
  "netAssets": 70000000,
  "monthlyAvailableFunds": 2700000,
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T10:00:00Z"
}
```

#### 06. 배우자 자산정보 입력

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 배우자 자산정보 입력 | Asset Service | /api/v1/assets/spouse | POST | 배우자 자산정보 등록 |

**요청/응답 데이터 구조는 본인 자산정보와 동일 (ownerType만 'SPOUSE'로 다름)**

#### 07. 자산정보 관리

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 자산정보 조회 | Asset Service | /api/v1/assets | GET | 본인/배우자 자산정보 조회 |
| 자산정보 수정 | Asset Service | /api/v1/assets/{id} | PUT | 특정 자산정보 수정 |
| 자산정보 삭제 | Asset Service | /api/v1/assets/{id} | DELETE | 특정 자산정보 삭제 |

**조회 요청 파라미터:**
```
?ownerType=SELF  // 본인만 조회
?ownerType=SPOUSE  // 배우자만 조회
// 없으면 전체 조회
```

**응답 데이터 구조 (목록 조회):**
```typescript
interface AssetListResponse {
  assets: AssetResponse[];       // 자산 목록
  combinedSummary: {
    totalAssets: number;         // 합산 총 자산
    totalLoans: number;          // 합산 총 대출
    totalMonthlyIncome: number;  // 합산 월 소득
    totalMonthlyExpense: number; // 합산 월 지출
    netAssets: number;           // 합산 순자산
    monthlyAvailableFunds: number; // 합산 월 가용자금
  };
}
```

**응답 데이터 예시:**
```json
{
  "assets": [
    {
      "userId": "user123",
      "ownerType": "SELF",
      "totalAssets": 80000000,
      "totalLoans": 10000000,
      "netAssets": 70000000,
      "monthlyAvailableFunds": 2700000
    },
    {
      "userId": "user123",
      "ownerType": "SPOUSE",
      "totalAssets": 60000000,
      "totalLoans": 5000000,
      "netAssets": 55000000,
      "monthlyAvailableFunds": 2000000
    }
  ],
  "combinedSummary": {
    "totalAssets": 140000000,
    "totalLoans": 15000000,
    "totalMonthlyIncome": 9000000,
    "totalMonthlyExpense": 4300000,
    "netAssets": 125000000,
    "monthlyAvailableFunds": 4700000
  }
}
```

### 2.4 대출상품 관리 (Loan Service)

#### 08. 대출상품 목록

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 대출상품 목록 조회 | Loan Service | /api/v1/loans | GET | 대출상품 목록 조회 (필터/정렬/페이징) |

**요청 파라미터:**
```
?housingType=APARTMENT  // 주택유형 필터
&sortBy=interestRate    // 정렬 기준 (createdAt, interestRate, loanLimit)
&sortOrder=asc          // 정렬 순서 (asc, desc)
&keyword=주택담보        // 검색 키워드
&page=0                 // 페이지 번호 (0부터 시작)
&size=20                // 페이지 크기
```

**응답 데이터 구조:**
```typescript
interface LoanProductListResponse {
  success: boolean;
  data: {
    content: LoanProductDTO[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    };
  };
  message: string;
}

interface LoanProductDTO {
  id: number;
  name: string;              // 대출상품명
  loanLimit: number;         // 대출 한도
  ltvLimit: number;          // LTV 한도 (%)
  dtiLimit: number;          // DTI 한도 (%)
  dsrLimit: number;          // DSR 한도 (%)
  interestRate: number;      // 금리 (%)
  targetHousing: string;     // 대상 주택
  incomeRequirement: string; // 소득 요건
  applicantRequirement: string; // 신청자격
  remarks: string;           // 비고
  active: boolean;           // 활성화 여부
  createdAt: string;
  updatedAt: string;
}
```

**응답 데이터 예시:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "디딤돌 대출",
        "loanLimit": 600000000,
        "ltvLimit": 70.0,
        "dtiLimit": 60.0,
        "dsrLimit": 40.0,
        "interestRate": 3.5,
        "targetHousing": "전용면적 85㎡ 이하 주택",
        "incomeRequirement": "연소득 6천만원 이하",
        "applicantRequirement": "무주택 세대주",
        "remarks": "생애최초 구입 시 우대금리 적용",
        "active": true,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "totalElements": 15,
      "totalPages": 1
    }
  },
  "message": "대출상품 목록 조회 성공"
}
```

#### 09. 대출상품 상세

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 대출상품 상세 조회 | Loan Service | /api/v1/loans/{id} | GET | 대출상품 상세정보 조회 |

**응답 데이터 구조:**
```typescript
interface LoanProductResponse {
  success: boolean;
  data: LoanProductDTO;
  message: string;
}
```

#### 10. 대출상품 관리 (관리자)

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 대출상품 등록 | Loan Service | /api/v1/admin/loans | POST | 새 대출상품 등록 |
| 대출상품 수정 | Loan Service | /api/v1/admin/loans/{id} | PUT | 대출상품 수정 |
| 대출상품 삭제 | Loan Service | /api/v1/admin/loans/{id} | DELETE | 대출상품 삭제 |

**요청 데이터 구조 (등록/수정):**
```typescript
interface CreateLoanProductRequest {
  name: string;              // 대출상품명 (최대 100자, 필수)
  loanLimit: number;         // 대출 한도 (0 이상, 필수)
  ltvLimit: number;          // LTV 한도 (0-100%, 필수)
  dtiLimit: number;          // DTI 한도 (0-100%, 필수)
  dsrLimit: number;          // DSR 한도 (0-100%, 필수)
  interestRate: number;      // 금리 (0-100%, 필수)
  targetHousing: string;     // 대상 주택 (최대 200자, 필수)
  incomeRequirement?: string; // 소득 요건 (최대 200자)
  applicantRequirement?: string; // 신청자격 (최대 200자)
  remarks?: string;          // 비고
}
```

**요청 데이터 예시:**
```json
{
  "name": "버팀목 전세자금 대출",
  "loanLimit": 300000000,
  "ltvLimit": 80.0,
  "dtiLimit": 50.0,
  "dsrLimit": 40.0,
  "interestRate": 2.5,
  "targetHousing": "전세 보증금 5억원 이하",
  "incomeRequirement": "연소득 5천만원 이하",
  "applicantRequirement": "무주택 세대주",
  "remarks": "신혼부부 우대금리 0.5%p 추가"
}
```

### 2.5 주택 관리 (Housing Service)

#### 11. 입주희망주택 입력 - 기본정보 / 12. 상세정보

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 주택 등록 | Housing Service | /housings | POST | 새 주택 등록 |

**요청 데이터 구조:**
```typescript
interface HousingCreateRequest {
  housingName: string;       // 주택명 (필수)
  housingType: 'APARTMENT' | 'OFFICETEL' | 'VILLA' | 'HOUSE'; // 주택유형 (필수)
  price: number;             // 가격 (1 이상, 필수)
  moveInDate: string;        // 입주희망년월 (YYYY-MM, 필수)
  completionDate?: string;   // 준공일 (YYYY-MM-DD)
  address: {
    fullAddress: string;     // 전체 주소 (필수)
    roadAddress?: string;
    jibunAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  complexInfo?: {
    complexName?: string;    // 단지명
    totalHouseholds?: number; // 총 세대수
    totalDong?: number;      // 총 동수
    totalFloors?: number;    // 총 층수
    parkingCount?: number;   // 주차대수
    moveInDate?: string;     // 입주일
    constructionCompany?: string; // 시공사
    houseArea?: number;      // 주거전용면적
    exclusiveArea?: number;  // 공급면적
    floor?: number;          // 층
    direction?: string;      // 향
  };
  livingEnvironment?: {
    sunlightLevel?: 'VERY_GOOD' | 'GOOD' | 'AVERAGE' | 'POOR';
    noiseLevel?: 'VERY_QUIET' | 'QUIET' | 'NORMAL' | 'NOISY';
    nearbySchools?: string[];
    nearbyMarts?: string[];
    nearbyHospitals?: string[];
  };
  transportations?: Array<{
    transportType: 'SUBWAY' | 'BUS' | 'TRAIN'; // 교통수단 (필수)
    lineName?: string;       // 노선명
    stationName: string;     // 역/정류장명 (필수)
    distance?: number;       // 거리 (m)
    walkingTime?: number;    // 도보시간 (분)
    commuteTime?: {
      selfBefore9am?: number;    // 본인 출근시간 (분)
      selfAfter6pm?: number;     // 본인 퇴근시간 (분)
      spouseBefore9am?: number;  // 배우자 출근시간 (분)
      spouseAfter6pm?: number;   // 배우자 퇴근시간 (분)
    };
  }>;
}
```

**요청 데이터 예시:**
```json
{
  "housingName": "래미안 강남 포레스트",
  "housingType": "APARTMENT",
  "price": 850000000,
  "moveInDate": "2025-03",
  "completionDate": "2024-12-31",
  "address": {
    "fullAddress": "서울특별시 강남구 테헤란로 123",
    "roadAddress": "서울특별시 강남구 테헤란로 123",
    "jibunAddress": "서울특별시 강남구 역삼동 123-45",
    "latitude": 37.5012345,
    "longitude": 127.0398765
  },
  "complexInfo": {
    "complexName": "래미안 강남 포레스트",
    "totalHouseholds": 1500,
    "totalDong": 15,
    "totalFloors": 30,
    "parkingCount": 2000,
    "moveInDate": "2024-12",
    "constructionCompany": "삼성물산",
    "houseArea": 84.5,
    "exclusiveArea": 110.2,
    "floor": 15,
    "direction": "남향"
  },
  "livingEnvironment": {
    "sunlightLevel": "VERY_GOOD",
    "noiseLevel": "QUIET",
    "nearbySchools": ["○○초등학교", "△△중학교"],
    "nearbyMarts": ["이마트", "롯데마트"],
    "nearbyHospitals": ["□□병원"]
  },
  "transportations": [
    {
      "transportType": "SUBWAY",
      "lineName": "2호선",
      "stationName": "강남역",
      "distance": 500.5,
      "walkingTime": 7,
      "commuteTime": {
        "selfBefore9am": 45,
        "selfAfter6pm": 50,
        "spouseBefore9am": 40,
        "spouseAfter6pm": 45
      }
    }
  ]
}
```

**응답 데이터 구조:**
```typescript
interface ApiResponseHousingResponse {
  success: boolean;
  message: string;
  data: {
    id: number;              // 주택 ID
    housingName: string;
    housingType: string;
    price: number;
    moveInDate: string;
    completionDate: string;
    address: AddressResponse;
    complexInfo: ComplexInfo;
    livingEnvironment: LivingEnvironment;
    isGoal: boolean;         // 최종목표 주택 여부
    transportations: TransportationResponse[];
    createdAt: string;
    updatedAt: string;
  };
}
```

#### 13. 입주희망주택 목록

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 주택 목록 조회 | Housing Service | /housings | GET | 주택 목록 조회 (페이징/정렬) |

**요청 파라미터:**
```
?page=0                 // 페이지 번호 (0부터 시작)
&size=10                // 페이지 크기
&sort=createdAt         // 정렬 기준 (createdAt, price)
&direction=DESC         // 정렬 방향 (ASC, DESC)
```

**응답 데이터 구조:**
```typescript
interface ApiResponseHousingListResponse {
  success: boolean;
  message: string;
  data: {
    housings: Array<{
      id: number;
      housingName: string;
      housingType: string;
      price: number;
      fullAddress: string;
      isGoal: boolean;
      createdAt: string;
    }>;
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}
```

#### 14. 입주희망주택 상세

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 주택 상세 조회 | Housing Service | /housings/{id} | GET | 주택 상세정보 조회 |
| 주택 수정 | Housing Service | /housings/{id} | PUT | 주택 정보 수정 |
| 주택 삭제 | Housing Service | /housings/{id} | DELETE | 주택 삭제 |
| 최종목표 설정 | Housing Service | /housings/{id}/goal | PUT | 최종목표 주택 설정 |

**최종목표 설정 응답:**
```typescript
interface ApiResponseGoalHousingResponse {
  success: boolean;
  message: string;
  data: {
    housingId: number;
    housingName: string;
    message: string;
  };
}
```

### 2.6 계산 및 분석 (Calculator Service)

#### 15. 입주 후 지출 계산

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 지출 계산 | Calculator Service | /calculator/housing-expenses | POST | 입주 후 지출 계산 |

**요청 데이터 구조:**
```typescript
interface HousingExpensesRequest {
  housingId: string;      // 주택 ID (필수)
  loanProductId: string;  // 대출상품 ID (필수)
  loanAmount: number;     // 대출 금액 (0 이상, 필수)
  loanTerm: number;       // 대출 기간 (개월, 1 이상, 필수)
}
```

**요청 데이터 예시:**
```json
{
  "housingId": "550e8400-e29b-41d4-a716-446655440001",
  "loanProductId": "550e8400-e29b-41d4-a716-446655440002",
  "loanAmount": 300000000,
  "loanTerm": 360
}
```

**응답 데이터 구조:**
```typescript
interface CalculationResultResponse {
  id: string;             // 계산 결과 ID
  userId: string;
  housingId: string;
  housingName: string;
  loanProductId: string;
  loanProductName: string;
  calculatedAt: string;   // 계산 일시
  financialStatus: {
    currentAssets: number;      // 현재 순자산
    estimatedAssets: number;    // 예상자산
    loanRequired: number;       // 대출필요금액
  };
  loanAnalysis: {
    ltv: number;                // 계산된 LTV (%)
    dti: number;                // 계산된 DTI (%)
    dsr: number;                // 계산된 DSR (%)
    ltvLimit: number;           // LTV 한도 (%)
    dtiLimit: number;           // DTI 한도 (%)
    dsrLimit: number;           // DSR 한도 (%)
    isEligible: boolean;        // 적격 여부
    ineligibilityReasons: string[]; // 미충족 사유
    monthlyPayment: number;     // 월 상환액
  };
  afterMoveIn: {
    assets: number;             // 입주 후 자산
    monthlyExpenses: number;    // 월 지출
    monthlyIncome: number;      // 월 소득
    availableFunds: number;     // 여유 자금
  };
  status: 'ELIGIBLE' | 'INELIGIBLE';
}
```

**응답 데이터 예시:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "housingId": "550e8400-e29b-41d4-a716-446655440001",
  "housingName": "래미안 강남 포레스트",
  "loanProductId": "550e8400-e29b-41d4-a716-446655440002",
  "loanProductName": "디딤돌 대출",
  "calculatedAt": "2025-01-04T15:30:00Z",
  "financialStatus": {
    "currentAssets": 125000000,
    "estimatedAssets": 150000000,
    "loanRequired": 300000000
  },
  "loanAnalysis": {
    "ltv": 65.0,
    "dti": 35.0,
    "dsr": 32.0,
    "ltvLimit": 70.0,
    "dtiLimit": 60.0,
    "dsrLimit": 40.0,
    "isEligible": true,
    "ineligibilityReasons": [],
    "monthlyPayment": 1500000
  },
  "afterMoveIn": {
    "assets": 50000000,
    "monthlyExpenses": 3000000,
    "monthlyIncome": 5000000,
    "availableFunds": 2000000
  },
  "status": "ELIGIBLE"
}
```

#### 16. 계산결과 목록

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 계산결과 목록 조회 | Calculator Service | /calculator/results | GET | 계산결과 목록 조회 (필터/정렬/페이징) |
| 계산결과 상세 조회 | Calculator Service | /calculator/results/{id} | GET | 계산결과 상세 조회 |
| 계산결과 삭제 | Calculator Service | /calculator/results/{id} | DELETE | 계산결과 삭제 |

**목록 조회 요청 파라미터:**
```
?housingId=xxx          // 주택 ID 필터
&status=ELIGIBLE        // 상태 필터 (ELIGIBLE/INELIGIBLE)
&sortBy=calculatedAt    // 정렬 기준
&sortOrder=desc         // 정렬 순서
&page=0                 // 페이지 번호
&size=20                // 페이지 크기
```

**응답 데이터 구조:**
```typescript
interface CalculationResultListResponse {
  results: Array<{
    id: string;
    housingName: string;
    loanProductName: string;
    calculatedAt: string;
    status: 'ELIGIBLE' | 'INELIGIBLE';
    availableFunds: number;
  }>;
  page: number;
  size: number;
  total: number;
}
```

### 2.7 로드맵 (Roadmap Service)

#### 17. 생애주기 이벤트 관리

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 이벤트 목록 조회 | Roadmap Service | /lifecycle-events | GET | 생애주기 이벤트 목록 조회 |
| 이벤트 상세 조회 | Roadmap Service | /lifecycle-events/{id} | GET | 이벤트 상세 조회 |
| 이벤트 등록 | Roadmap Service | /lifecycle-events | POST | 새 이벤트 등록 |
| 이벤트 수정 | Roadmap Service | /lifecycle-events/{id} | PUT | 이벤트 수정 |
| 이벤트 삭제 | Roadmap Service | /lifecycle-events/{id} | DELETE | 이벤트 삭제 |

**이벤트 등록/수정 요청 데이터:**
```typescript
interface LifecycleEventRequest {
  name: string;          // 이벤트명 (최대 100자, 필수)
  eventType: 'MARRIAGE' | 'BIRTH' | 'CHILD_EDUCATION' | 'RETIREMENT' | 'OTHER'; // 필수
  eventDate: string;     // 날짜 (YYYY-MM, 필수)
  housingCriteria?: string; // 주거조건 (최대 200자)
}
```

**요청 데이터 예시:**
```json
{
  "name": "첫째 아이 출생",
  "eventType": "BIRTH",
  "eventDate": "2027-06",
  "housingCriteria": "3룸 이상, 학군 좋은 지역"
}
```

**응답 데이터 구조:**
```typescript
interface LifecycleEventResponse {
  id: string;
  userId: string;
  name: string;
  eventType: string;
  eventDate: string;
  housingCriteria: string;
  createdAt: string;
  updatedAt: string;
}
```

**목록 조회 응답:**
```typescript
interface LifecycleEventListResponse {
  events: LifecycleEventResponse[];
  total: number;
}
```

#### 18. 장기주거 로드맵 조회

| 기능 | 서비스 | API 경로 | 메소드 | 설명 |
|------|--------|----------|--------|------|
| 로드맵 조회 | Roadmap Service | /roadmaps | GET | 로드맵 조회 (버전 선택 가능) |
| 로드맵 생성 요청 | Roadmap Service | /roadmaps | POST | 로드맵 생성 요청 (비동기) |
| 로드맵 재설계 요청 | Roadmap Service | /roadmaps | PUT | 로드맵 재설계 요청 (비동기) |
| 로드맵 상태 조회 | Roadmap Service | /roadmaps/status/{requestId} | GET | 생성/재설계 상태 조회 |
| 진행상황 스트리밍 | Roadmap Service | /roadmaps/tasks/{taskId}/stream | GET | SSE 스트리밍 |
| 버전 이력 조회 | Roadmap Service | /roadmaps/versions | GET | 로드맵 버전 목록 |

**로드맵 조회 요청 파라미터:**
```
?version=1  // 특정 버전 조회 (생략 시 최신 버전)
```

**로드맵 생성/재설계 응답:**
```typescript
interface RoadmapTaskResponse {
  requestId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;      // 0-100
  message: string;
  estimatedCompletionTime: number; // 초
}
```

**로드맵 조회 응답:**
```typescript
interface RoadmapResponse {
  id: string;
  userId: string;
  version: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  goalHousing: {
    id: string;
    name: string;
    moveInDate: string;
    price: number;
  };
  stages: Array<{
    stageNumber: number;
    stageName: string;
    moveInDate: string;    // YYYY-MM
    duration: number;      // 개월
    housingCharacteristics: {
      estimatedPrice: number;
      location: string;
      type: string;
      features: string[];
    };
    financialGoals: {
      targetSavings: number;
      monthlySavings: number;
      loanAmount: number;
      loanProduct: string;
    };
    strategy: string;
    tips: string[];
  }>;
  executionGuide: {
    monthlySavingsPlan: Array<{
      period: string;      // 기간
      amount: number;      // 금액
      purpose: string;     // 목적
    }>;
    warnings: string[];
    tips: string[];
  };
  createdAt: string;
  updatedAt: string;
}
```

**응답 데이터 예시:**
```json
{
  "id": "roadmap-123",
  "userId": "user123",
  "version": 1,
  "status": "COMPLETED",
  "goalHousing": {
    "id": "housing-456",
    "name": "래미안 강남 포레스트",
    "moveInDate": "2030-03",
    "price": 850000000
  },
  "stages": [
    {
      "stageNumber": 1,
      "stageName": "신혼생활 시작",
      "moveInDate": "2025-06",
      "duration": 24,
      "housingCharacteristics": {
        "estimatedPrice": 300000000,
        "location": "직장 근처",
        "type": "오피스텔",
        "features": ["신축", "역세권", "소형평수"]
      },
      "financialGoals": {
        "targetSavings": 100000000,
        "monthlySavings": 3000000,
        "loanAmount": 200000000,
        "loanProduct": "버팀목 전세자금"
      },
      "strategy": "소형 주택으로 시작하여 자금을 모으는 단계",
      "tips": [
        "월 소득의 40% 이상 저축",
        "전세자금 대출 활용",
        "청약 통장 납입"
      ]
    }
  ],
  "executionGuide": {
    "monthlySavingsPlan": [
      {
        "period": "2025-01 ~ 2025-12",
        "amount": 3000000,
        "purpose": "1단계 주택 자금"
      }
    ],
    "warnings": [
      "금리 변동에 주의하세요",
      "예상치 못한 지출에 대비하세요"
    ],
    "tips": [
      "정기적으로 재무 상태를 점검하세요",
      "목표 달성을 위해 지출을 관리하세요"
    ]
  },
  "createdAt": "2025-01-04T10:00:00Z",
  "updatedAt": "2025-01-04T10:00:00Z"
}
```

## 3. 에러 응답 형식

### 3.1 공통 에러 응답
```typescript
interface ApiErrorResponse {
  success: false;
  message: string;       // 사용자에게 표시할 에러 메시지
  error?: {
    code: string;        // 에러 코드
    details?: any;       // 상세 정보
  };
}
```

### 3.2 HTTP 상태 코드별 처리
- **400 Bad Request**: 잘못된 요청 (입력 검증 실패)
- **401 Unauthorized**: 인증 실패 (토큰 없음 또는 만료)
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스를 찾을 수 없음
- **500 Internal Server Error**: 서버 오류

## 4. 인증 헤더

모든 Protected API 요청에는 JWT 토큰 포함:
```
Authorization: Bearer {accessToken}
```

## 5. 페이징 공통 형식

```typescript
interface PageInfo {
  pageNumber: number;      // 현재 페이지 (0부터 시작)
  pageSize: number;        // 페이지 크기
  totalElements: number;   // 전체 항목 수
  totalPages: number;      // 전체 페이지 수
}
```

## 6. API 호출 순서

### 6.1 초기 로딩 (대시보드)
```
1. GET /users/profile - 사용자 정보 조회
2. GET /api/v1/assets - 자산정보 조회
3. GET /housings?page=0&size=5 - 최근 주택 목록
4. GET /calculator/results?page=0&size=5 - 최근 계산 결과
```

### 6.2 주택 등록 플로우
```
1. POST /housings (기본정보 + 상세정보) - 주택 등록
2. PUT /housings/{id}/goal - 최종목표 설정 (선택)
3. POST /calculator/housing-expenses - 지출 계산 (선택)
```

### 6.3 로드맵 생성 플로우
```
1. POST /roadmaps - 로드맵 생성 요청
2. GET /roadmaps/tasks/{taskId}/stream - SSE 스트리밍 (진행상황)
3. GET /roadmaps - 완성된 로드맵 조회
```
