# 스타일 가이드

## 1. 브랜드 아이덴티티

### 1.1 디자인 컨셉
**내집마련 도우미 - 신뢰할 수 있는 재무 파트너**

- **핵심 가치**: 신뢰성, 전문성, 접근성
- **디자인 철학**:
  - 깔끔하고 전문적인 금융 서비스 이미지
  - 사용하기 쉬운 모바일 우선 인터페이스
  - 데이터 중심의 명확한 정보 전달
- **브랜드 성격**:
  - 신뢰할 수 있는 (Trustworthy)
  - 전문적인 (Professional)
  - 친근한 (Friendly)
  - 명확한 (Clear)

### 1.2 브랜드 메시지
- **메인 슬로건**: "당신의 내집마련, 함께 시작합니다"
- **서브 슬로건**: "체계적인 계획으로 꿈을 현실로"

## 2. 디자인 원칙

### 2.1 명료성 (Clarity)
- 복잡한 재무 정보를 명확하게 전달
- 핵심 정보 우선 배치
- 간결한 텍스트와 명확한 레이블

### 2.2 일관성 (Consistency)
- 동일한 컴포넌트는 동일한 방식으로 작동
- 통일된 색상, 타이포그래피, 간격 시스템
- 예측 가능한 사용자 경험

### 2.3 접근성 (Accessibility)
- WCAG 2.1 AA 레벨 준수
- 충분한 색상 대비
- 키보드 및 스크린 리더 지원

### 2.4 효율성 (Efficiency)
- 최소한의 클릭으로 목표 달성
- 자동 완성 및 기본값 제공
- 빠른 로딩과 부드러운 전환

### 2.5 신뢰성 (Trustworthiness)
- 정확한 데이터 표시
- 명확한 에러 메시지
- 안전한 데이터 처리 강조

## 3. 컬러 시스템

### 3.1 Primary Colors

#### Primary Main - #1976D2 (파란색)
- **용도**: 주요 액션 버튼, 링크, 활성 상태
- **의미**: 신뢰, 전문성, 안정성
- **변형**:
  - Light: #42A5F5
  - Dark: #1565C0
  - Contrast Text: #FFFFFF

#### Secondary - #FF6F00 (오렌지)
- **용도**: 보조 액션, 강조, 알림
- **의미**: 따뜻함, 긍정, 에너지
- **변형**:
  - Light: #FF9800
  - Dark: #E65100
  - Contrast Text: #FFFFFF

### 3.2 Semantic Colors

#### Success - #2E7D32 (녹색)
- **용도**: 성공 메시지, 긍정적 상태, 적격 표시
- **Light**: #4CAF50
- **Dark**: #1B5E20

#### Warning - #ED6C02 (주황색)
- **용도**: 경고 메시지, 주의 필요 상태
- **Light**: #FF9800
- **Dark**: #E65100

#### Error - #D32F2F (빨간색)
- **용도**: 에러 메시지, 삭제 버튼, 부적격 표시
- **Light**: #EF5350
- **Dark**: #C62828

#### Info - #0288D1 (하늘색)
- **용도**: 정보 메시지, 안내
- **Light**: #03A9F4
- **Dark**: #01579B

### 3.3 Neutral Colors

#### Background
- **Default**: #FFFFFF (흰색)
- **Paper**: #F5F5F5 (연한 회색)
- **Dark**: #121212 (다크 모드)

#### Text
- **Primary**: rgba(0, 0, 0, 0.87)
- **Secondary**: rgba(0, 0, 0, 0.6)
- **Disabled**: rgba(0, 0, 0, 0.38)

#### Divider
- **Default**: rgba(0, 0, 0, 0.12)

### 3.4 Financial Data Colors

#### 자산 관련
- **총 자산**: #1976D2 (파란색)
- **순자산**: #2E7D32 (녹색)
- **총 대출**: #D32F2F (빨간색)
- **가용자금**: #FF6F00 (오렌지)

#### 상태 표시
- **적격**: #2E7D32 (녹색)
- **부적격**: #D32F2F (빨간색)
- **처리중**: #0288D1 (하늘색)
- **대기**: #ED6C02 (주황색)

### 3.5 접근성 대비 비율
모든 텍스트-배경 조합은 최소 대비 비율 준수:
- **일반 텍스트**: 4.5:1 이상
- **대형 텍스트** (18pt+ 또는 14pt+ 굵게): 3:1 이상
- **UI 컴포넌트**: 3:1 이상

## 4. 타이포그래피

### 4.1 폰트 패밀리

#### 한글 + 영문
```css
font-family: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
             'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

#### 숫자 (금액 표시)
```css
font-family: 'Roboto', 'Pretendard', sans-serif;
font-variant-numeric: tabular-nums;
```

### 4.2 타이포그래피 스케일

#### h1 - 페이지 타이틀
- **크기**: 32px (2rem)
- **무게**: 700 (Bold)
- **행간**: 1.2
- **Letter Spacing**: -0.01562em
- **용도**: 주요 페이지 제목 (로그인 페이지 등)

#### h2 - 섹션 타이틀
- **크기**: 24px (1.5rem)
- **무게**: 600 (Semi-Bold)
- **행간**: 1.3
- **Letter Spacing**: -0.00833em
- **용도**: 섹션 제목 (대시보드 카드 제목)

#### h3 - 카드 타이틀
- **크기**: 20px (1.25rem)
- **무게**: 600 (Semi-Bold)
- **행간**: 1.4
- **Letter Spacing**: 0em
- **용도**: 카드 내부 제목

#### h4 - 서브 타이틀
- **크기**: 18px (1.125rem)
- **무게**: 500 (Medium)
- **행간**: 1.4
- **Letter Spacing**: 0.00735em
- **용도**: 서브 섹션 제목

#### body1 - 본문
- **크기**: 16px (1rem)
- **무게**: 400 (Regular)
- **행간**: 1.5
- **Letter Spacing**: 0.00938em
- **용도**: 일반 본문 텍스트

#### body2 - 작은 본문
- **크기**: 14px (0.875rem)
- **무게**: 400 (Regular)
- **행간**: 1.43
- **Letter Spacing**: 0.01071em
- **용도**: 보조 설명, 메타 정보

#### caption - 캡션
- **크기**: 12px (0.75rem)
- **무게**: 400 (Regular)
- **행간**: 1.66
- **Letter Spacing**: 0.03333em
- **용도**: 주석, 날짜, 시간 표시

#### button - 버튼 텍스트
- **크기**: 14px (0.875rem)
- **무게**: 500 (Medium)
- **행간**: 1.75
- **Letter Spacing**: 0.02857em
- **텍스트 변환**: uppercase (영문만)
- **용도**: 버튼 레이블

### 4.3 금액 표시 스타일
```css
.amount {
  font-family: 'Roboto', 'Pretendard', sans-serif;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.amount-large {
  font-size: 28px;
  font-weight: 700;
}

.amount-medium {
  font-size: 20px;
  font-weight: 600;
}

.amount-small {
  font-size: 16px;
  font-weight: 500;
}
```

### 4.4 반응형 타이포그래피
```css
/* Mobile (xs, sm) */
@media (max-width: 599px) {
  h1 { font-size: 28px; }
  h2 { font-size: 22px; }
  h3 { font-size: 18px; }
}

/* Tablet (md) */
@media (min-width: 600px) and (max-width: 959px) {
  h1 { font-size: 30px; }
  h2 { font-size: 23px; }
}

/* Desktop (lg+) */
@media (min-width: 960px) {
  h1 { font-size: 32px; }
  h2 { font-size: 24px; }
}
```

## 5. 간격 시스템

### 5.1 기본 간격 단위
**Base Unit**: 8px

### 5.2 Spacing Scale
- **xs**: 4px (0.5 unit)
- **sm**: 8px (1 unit)
- **md**: 16px (2 units)
- **lg**: 24px (3 units)
- **xl**: 32px (4 units)
- **xxl**: 48px (6 units)

### 5.3 컴포넌트별 간격

#### 페이지 레이아웃
- **Page Padding**: 16px (모바일), 24px (태블릿), 32px (데스크톱)
- **Section Margin**: 32px (섹션 간)
- **Card Margin**: 16px (카드 간)

#### 카드 내부
- **Card Padding**: 16px
- **Card Title Margin**: 0 0 12px 0
- **Card Content Spacing**: 8px (항목 간)

#### 폼
- **Field Margin**: 16px (필드 간)
- **Field Group Margin**: 24px (그룹 간)
- **Label Margin**: 0 0 4px 0
- **Helper Text Margin**: 4px 0 0 0

#### 버튼
- **Button Padding**: 8px 16px (작은), 10px 20px (중간), 12px 24px (큰)
- **Button Group Spacing**: 8px (버튼 간)

#### 리스트
- **List Item Padding**: 12px 16px
- **List Item Spacing**: 8px (밀집), 16px (일반)

### 5.4 그리드 시스템
- **Columns**: 12
- **Gutter**: 16px (모바일), 24px (태블릿+)
- **Container Max Width**: 1200px

## 6. 컴포넌트 스타일

### 6.1 버튼

#### Primary Button
```css
background: #1976D2;
color: #FFFFFF;
padding: 10px 20px;
border-radius: 4px;
font-weight: 500;
text-transform: none;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);

:hover {
  background: #1565C0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

#### Secondary Button
```css
background: transparent;
color: #1976D2;
border: 1px solid rgba(25, 118, 210, 0.5);
padding: 10px 20px;
border-radius: 4px;
```

#### Text Button
```css
background: transparent;
color: #1976D2;
padding: 8px 12px;
```

#### FAB (Floating Action Button)
```css
width: 56px;
height: 56px;
border-radius: 50%;
background: #FF6F00;
color: #FFFFFF;
box-shadow: 0 4px 8px rgba(0,0,0,0.2);
position: fixed;
bottom: 80px;
right: 16px;
```

### 6.2 TextField (입력 필드)

#### Outlined Variant
```css
border: 1px solid rgba(0, 0, 0, 0.23);
border-radius: 4px;
padding: 14px 12px;
font-size: 16px;

:focus {
  border-color: #1976D2;
  border-width: 2px;
}

:error {
  border-color: #D32F2F;
}
```

#### Helper Text
```css
font-size: 12px;
color: rgba(0, 0, 0, 0.6);
margin-top: 4px;

:error {
  color: #D32F2F;
}
```

### 6.3 Card

#### Default Card
```css
background: #FFFFFF;
border-radius: 8px;
padding: 16px;
box-shadow: 0 1px 3px rgba(0,0,0,0.12),
            0 1px 2px rgba(0,0,0,0.08);
```

#### Elevated Card (hover)
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.15),
            0 2px 6px rgba(0,0,0,0.1);
transition: box-shadow 0.3s ease;
```

### 6.4 AppBar

```css
background: #1976D2;
color: #FFFFFF;
height: 56px;
padding: 0 16px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
position: sticky;
top: 0;
z-index: 1100;
```

### 6.5 BottomNavigation

```css
background: #FFFFFF;
height: 56px;
border-top: 1px solid rgba(0, 0, 0, 0.12);
box-shadow: 0 -2px 4px rgba(0,0,0,0.05);
position: fixed;
bottom: 0;
width: 100%;
z-index: 1100;
```

### 6.6 Chip

#### Default
```css
background: #E0E0E0;
color: rgba(0, 0, 0, 0.87);
border-radius: 16px;
padding: 6px 12px;
font-size: 14px;
```

#### Success (적격)
```css
background: #E8F5E9;
color: #2E7D32;
```

#### Error (부적격)
```css
background: #FFEBEE;
color: #D32F2F;
```

#### Primary (최종목표)
```css
background: #E3F2FD;
color: #1976D2;
```

### 6.7 Dialog

```css
border-radius: 8px;
padding: 24px;
max-width: 600px;
box-shadow: 0 11px 15px rgba(0,0,0,0.2);
```

### 6.8 Snackbar (알림)

```css
background: #323232;
color: #FFFFFF;
border-radius: 4px;
padding: 12px 16px;
min-width: 288px;
max-width: 568px;
box-shadow: 0 3px 6px rgba(0,0,0,0.16);
```

### 6.9 Skeleton (로딩)

```css
background: linear-gradient(
  90deg,
  rgba(0,0,0,0.06) 25%,
  rgba(0,0,0,0.1) 50%,
  rgba(0,0,0,0.06) 75%
);
animation: skeleton-loading 1.5s ease-in-out infinite;
border-radius: 4px;
```

## 7. 반응형 브레이크포인트

```javascript
const breakpoints = {
  values: {
    xs: 0,    // 모바일
    sm: 600,  // 태블릿 세로
    md: 960,  // 태블릿 가로
    lg: 1280, // 데스크톱
    xl: 1920, // 대형 데스크톱
  },
};
```

### 화면별 레이아웃
- **xs (0-599px)**: 1열, BottomNavigation
- **sm (600-959px)**: 1-2열, BottomNavigation
- **md (960-1279px)**: 2-3열, Drawer 옵션
- **lg (1280-1919px)**: 3열, 고정 Drawer
- **xl (1920px+)**: 3-4열, 고정 Drawer, 넓은 여백

## 8. 대상 서비스 특화 컴포넌트

### 8.1 금액 표시 컴포넌트 (AmountDisplay)
```tsx
interface AmountDisplayProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
  positive?: boolean;
  unit?: string;
}
```

**스타일**:
- 천단위 콤마 자동 추가
- 양수: 기본 색상 또는 녹색
- 음수: 빨간색
- 단위: 원, 만원, 억원 자동 변환 옵션

### 8.2 재무 현황 카드 (FinancialSummaryCard)
```tsx
interface FinancialSummaryProps {
  totalAssets: number;
  totalLoans: number;
  netAssets: number;
  monthlyAvailableFunds: number;
}
```

**스타일**:
- 4분할 그리드
- 각 항목: 레이블 + 금액
- 아이콘: 자산(↑), 대출(↓), 순자산(=), 가용자금(💰)
- 색상 구분

### 8.3 주소 입력 컴포넌트 (AddressInput)
```tsx
interface AddressInputProps {
  value: Address;
  onChange: (address: Address) => void;
  required?: boolean;
}
```

**기능**:
- 카카오 주소 검색 API 연동
- 도로명/지번 주소 자동 입력
- 위도/경도 자동 설정

### 8.4 적격성 뱃지 (EligibilityBadge)
```tsx
interface EligibilityBadgeProps {
  eligible: boolean;
  reasons?: string[];
}
```

**스타일**:
- 적격: 녹색 배경, "적격" 텍스트
- 부적격: 빨간색 배경, "부적격" 텍스트
- Tooltip: 사유 표시

### 8.5 로드맵 스텝퍼 (RoadmapStepper)
```tsx
interface RoadmapStepperProps {
  stages: RoadmapStage[];
  currentStage?: number;
}
```

**스타일**:
- 수평 스텝퍼
- 각 단계: 아이콘 + 이름 + 날짜
- 완료/진행중/대기 상태 구분
- 모바일: 세로 스텝퍼

### 8.6 대출 조건 표 (LoanConditionsTable)
```tsx
interface LoanConditionsTableProps {
  ltv: number;
  dti: number;
  dsr: number;
  ltvLimit: number;
  dtiLimit: number;
  dsrLimit: number;
}
```

**스타일**:
- 3행 2열 표
- 조건명 | 값 / 한도
- 초과: 빨간색 강조
- 적정: 녹색 표시

## 9. 인터랙션 패턴

### 9.1 애니메이션 타이밍
```javascript
const transitions = {
  duration: {
    shortest: 150,   // 토글, 스위치
    shorter: 200,    // 메뉴, 드롭다운
    short: 250,      // 페이드, 슬라이드
    standard: 300,   // 대부분의 전환
    complex: 375,    // 복잡한 애니메이션
    enteringScreen: 225,  // 모달 진입
    leavingScreen: 195,   // 모달 퇴장
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};
```

### 9.2 호버 효과
```css
/* 버튼 */
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

/* 카드 */
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: box-shadow 0.3s ease;
}

/* 링크 */
.link:hover {
  color: #1565C0;
  text-decoration: underline;
  transition: color 0.2s ease;
}
```

### 9.3 포커스 스타일
```css
:focus-visible {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}
```

### 9.4 리플 효과
MUI의 기본 리플 효과 사용:
- 클릭 시 원형 파장 애니메이션
- Primary: #1976D2 (30% 투명도)
- Secondary: #FF6F00 (30% 투명도)

### 9.5 페이지 전환
- **Slide**: 페이지 간 이동 (좌↔우)
- **Fade**: 모달, 다이얼로그
- **Grow**: Snackbar, Tooltip
- **Collapse**: Accordion, 리스트 확장

## 10. 아이콘 시스템

### 10.1 아이콘 라이브러리
**Material Icons** 사용
- Outlined 스타일 우선
- Filled 스타일: 강조 필요 시
- Rounded 스타일: 부드러운 느낌 필요 시

### 10.2 주요 아이콘 매핑

#### 네비게이션
- **대시보드**: Dashboard
- **주택**: Home
- **계산**: Calculate
- **로드맵**: Timeline
- **프로필**: Person
- **설정**: Settings
- **로그아웃**: Logout
- **뒤로가기**: ArrowBack
- **알림**: Notifications

#### 액션
- **추가**: Add
- **수정**: Edit
- **삭제**: Delete
- **저장**: Save
- **검색**: Search
- **필터**: FilterList
- **정렬**: Sort
- **새로고침**: Refresh
- **다운로드**: Download
- **업로드**: Upload

#### 상태
- **성공**: CheckCircle
- **에러**: Error
- **경고**: Warning
- **정보**: Info
- **도움말**: HelpOutline

#### 재무
- **자산**: TrendingUp
- **대출**: TrendingDown
- **금액**: AttachMoney
- **저축**: Savings
- **계산**: Calculate

### 10.3 아이콘 크기
- **Small**: 18px
- **Medium**: 24px (기본)
- **Large**: 36px
- **XLarge**: 48px

## 11. 다크 모드 (향후 고려사항)

### 11.1 다크 모드 색상 (참고)
```javascript
const darkPalette = {
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  primary: {
    main: '#90CAF9',  // 밝은 파란색
  },
  secondary: {
    main: '#FFB74D',  // 밝은 오렌지
  },
};
```

## 12. 에셋 가이드라인

### 12.1 이미지
- **로고**: SVG 포맷, 최소 2x 해상도
- **일러스트**: SVG 또는 WebP
- **사진**: WebP (폴백: JPEG)
- **아이콘**: SVG

### 12.2 이미지 최적화
- **모바일**: 최대 800px 너비
- **태블릿**: 최대 1200px 너비
- **데스크톱**: 최대 1920px 너비
- **압축**: 75-85% 품질

## 13. 스타일 구현 방법

### 13.1 MUI Theme 설정
```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976D2' },
    secondary: { main: '#FF6F00' },
    // ... 기타 색상
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    // ... 타이포그래피 설정
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920,
    },
  },
  components: {
    // 컴포넌트별 기본 스타일 오버라이드
  },
});
```

### 13.2 CSS-in-JS
Emotion 또는 styled-components 사용

### 13.3 글로벌 스타일
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
}

body {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
