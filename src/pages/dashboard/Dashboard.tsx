import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Tabs, Tab, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import FinancialSummaryCard from '../../components/cards/FinancialSummaryCard';
import QuickActionCard from '../../components/cards/QuickActionCard';
import HousingCard from '../../components/cards/HousingCard';
import CalculationResultCard from '../../components/cards/CalculationResultCard';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { assetApi } from '../../services/asset/assetApi';
import { housingApi } from '../../services/housing/housingApi';
import { calculatorApi } from '../../services/calculator/calculatorApi';
import type { QuickAction, DashboardData, RecentHousing, RecentCalculation, FinancialSummary } from '../../types/dashboard.types';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // 빠른 작업 목록
  const quickActions: QuickAction[] = [
    {
      id: 'basic-info',
      icon: '📝',
      title: '기본정보 및 자산 등록',
      description: '기본정보와 자산정보를 입력하세요',
      path: '/profile/basic-info',
    },
    {
      id: 'housing-register',
      icon: '🏠',
      title: '주택 등록하기',
      description: '관심 주택을 등록하세요',
      path: '/housings/new',
    },
    {
      id: 'calculator',
      icon: '💰',
      title: '지출 계산하기',
      description: '입주 후 재무 상태를 확인하세요',
      path: '/calculator',
    },
    {
      id: 'roadmap',
      icon: '🗺️',
      title: '로드맵 보기',
      description: '장기주거 계획을 확인하세요',
      path: '/roadmap',
    },
    {
      id: 'loan-management',
      icon: '🏦',
      title: '대출상품 관리',
      description: '대출상품을 관리하세요',
      path: '/admin/loans',
      adminOnly: true,
    },
  ];

  // 사용자 권한에 따라 빠른 작업 필터링
  const filteredQuickActions = quickActions.filter(
    (action) => !action.adminOnly || user?.isAdmin
  );

  // 재무 현황 데이터 로드
  const loadFinancialSummary = useCallback(async (): Promise<FinancialSummary> => {
    try {
      const response = await assetApi.getAssets();
      console.log(response);
      if (response && response.combinedSummary) {
        return assetApi.calculateFinancialSummary(response);
      }
    } catch (error) {
      console.error('재무 현황 로드 실패:', error);
    }
    // 기본값 반환
    return {
      totalAssets: 0,
      totalLoans: 0,
      netAssets: 0,
      monthlyAvailableFunds: 0,
    };
  }, []);

  // 최근 주택 목록 로드
  const loadRecentHousings = useCallback(async (): Promise<RecentHousing[]> => {
    try {
      const response = await housingApi.getHousings({
        page: 0,
        size: 3,
        sort: 'createdAt',
        direction: 'DESC',
      });
      if (response.success && response.data?.housings) {
        return response.data.housings.map((housing) => ({
          id: housing.id,
          housingName: housing.housingName,
          housingType: housing.housingType,
          price: housing.price,
          fullAddress: housing.fullAddress,
          isGoal: housing.isGoal,
          createdAt: housing.createdAt,
        }));
      }
    } catch (error) {
      console.error('주택 목록 로드 실패:', error);
    }
    return [];
  }, []);

  // 최근 계산 결과 로드
  const loadRecentCalculations = useCallback(async (): Promise<RecentCalculation[]> => {
    try {
      const response = await calculatorApi.getResults({
        page: 0,
        size: 3,
        sortBy: 'calculatedAt',
        sortOrder: 'desc',
      });
      if (response && response.results) {
        return response.results.map((result) => ({
          id: result.id,
          housingName: result.housingName,
          loanProductName: result.loanProductName,
          status: result.status,
          monthlyAvailableFunds: result.monthlyAvailableFunds,
          calculatedAt: result.calculatedAt,
        }));
      }
      // if (response && response.results) {
      //   return response.results.map((result) => ({
      //     id: result.id,
      //     housingName: result.housingName,
      //     loanProductName: result.loanProductName,
      //     isEligible: result.isEligible,
      //     surplusFunds: result.surplusFunds,
      //     calculatedAt: result.calculatedAt,
      //   }));
      // }
    } catch (error) {
      console.error('계산 결과 로드 실패:', error);
    }
    return [];
  }, []);

  // 대시보드 데이터 로드
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // 병렬로 모든 데이터 로드
      const [financialSummary, recentHousings, recentCalculations] = await Promise.all([
        loadFinancialSummary(),
        loadRecentHousings(),
        loadRecentCalculations(),
      ]);

      setDashboardData({
        financialSummary,
        recentHousings,
        recentCalculations,
      });
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '대시보드 데이터를 불러오는데 실패했습니다',
          severity: 'error',
        })
      );
      // 에러 발생 시에도 기본값 설정
      setDashboardData({
        financialSummary: {
          totalAssets: 0,
          totalLoans: 0,
          netAssets: 0,
          monthlyAvailableFunds: 0,
        },
        recentHousings: [],
        recentCalculations: [],
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, loadFinancialSummary, loadRecentHousings, loadRecentCalculations]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleFinancialSummaryClick = () => {
    navigate('/assets');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <Loading message="대시보드를 불러오는 중..." />;
  }

  if (!dashboardData) {
    return (
      <EmptyState
        message="데이터를 불러올 수 없습니다"
        actionLabel="다시 시도"
        onAction={loadDashboardData}
      />
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* 재무 현황 */}
      <FinancialSummaryCard
        data={dashboardData.financialSummary}
        onClick={handleFinancialSummaryClick}
      />

      {/* 빠른 작업 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          빠른 작업
        </Typography>
        <Grid container spacing={2}>
          {filteredQuickActions.map((action) => (
            <Grid item xs={6} key={action.id}>
              <QuickActionCard action={action} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 최근 활동 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          최근 활동
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ flex: 1 }}
          >
            <Tab label="등록한 주택" />
            <Tab label="계산 결과" />
          </Tabs>
          {activeTab === 0 && dashboardData.recentHousings.length > 0 && (
            <Button
              size="small"
              onClick={() => navigate('/housings')}
              sx={{ whiteSpace: 'nowrap', mr: 1 }}
            >
              더보기
            </Button>
          )}
          {activeTab === 1 && dashboardData.recentCalculations.length > 0 && (
            <Button
              size="small"
              onClick={() => navigate('/calculator/results')}
              sx={{ whiteSpace: 'nowrap', mr: 1 }}
            >
              더보기
            </Button>
          )}
        </Box>

        {/* 등록한 주택 탭 */}
        {activeTab === 0 && (
          <Box>
            {dashboardData.recentHousings.length > 0 ? (
              dashboardData.recentHousings.map((housing) => (
                <HousingCard key={housing.id} housing={housing} />
              ))
            ) : (
              <EmptyState
                message="아직 등록한 주택이 없습니다"
                actionLabel="주택 등록하기"
                onAction={() => navigate('/housings/new')}
              />
            )}
          </Box>
        )}

        {/* 계산 결과 탭 */}
        {activeTab === 1 && (
          <Box>
            {dashboardData.recentCalculations.length > 0 ? (
              dashboardData.recentCalculations.map((calculation) => (
                <CalculationResultCard key={calculation.id} calculation={calculation} />
              ))
            ) : (
              <EmptyState
                message="아직 계산 결과가 없습니다"
                actionLabel="지출 계산하기"
                onAction={() => navigate('/calculator')}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
