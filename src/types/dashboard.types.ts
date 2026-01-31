// 대시보드 관련 타입 정의

export interface FinancialSummary {
  totalAssets: number; // 총 자산
  totalLoans: number; // 총 대출
  netAssets: number; // 순자산 (자산 - 대출)
  monthlyAvailableFunds: number; // 월 가용자금 (월소득 - 월지출)
}

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  path: string;
  adminOnly?: boolean;
}

export interface RecentHousing {
  id: number;
  housingName: string;
  housingType: string;
  price: number;
  fullAddress: string;
  isGoal: boolean;
  createdAt: string;
}

export interface RecentCalculation {
  id: string;
  housingName: string;
  loanProductName: string;
  status: string;
  monthlyAvailableFunds: number;
  calculatedAt: string;
}

export interface DashboardData {
  financialSummary: FinancialSummary;
  recentHousings: RecentHousing[];
  recentCalculations: RecentCalculation[];
}
