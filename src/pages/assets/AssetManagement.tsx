import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import {
  assetApi,
  type HouseholdAssetResponse,
  type HouseholdMemberAsset,
  type AssetInfo,
  type AssetItem,
  type CombinedSummary,
} from '../../services/asset/assetApi';

// 카테고리 설정
const CATEGORY_CONFIG = [
  { key: 'assets' as const, label: '자산', icon: <SavingsIcon fontSize="small" />, color: 'primary' as const },
  { key: 'loans' as const, label: '대출', icon: <AccountBalanceIcon fontSize="small" />, color: 'error' as const },
  { key: 'monthlyIncomes' as const, label: '월소득', icon: <TrendingUpIcon fontSize="small" />, color: 'success' as const },
  { key: 'monthlyExpenses' as const, label: '월지출', icon: <TrendingDownIcon fontSize="small" />, color: 'warning' as const },
];

// 상환 유형 라벨
const REPAYMENT_TYPE_LABELS: Record<string, string> = {
  EP: '원금균등',
  EPI: '원리금균등',
  MDT: '만기일시',
  GG: '체증식',
};

// 금액 포맷
const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

// 역할 라벨
const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'OWNER': return '가구장';
    case 'MEMBER': return '가구원';
    default: return role;
  }
};

// 카테고리별 항목 목록 컴포넌트
const CategorySection = ({
  categoryKey,
  label,
  icon,
  color,
  items,
  total,
}: {
  categoryKey: string;
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'error' | 'success' | 'warning';
  items: AssetItem[];
  total: number;
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* 카테고리 헤더 */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: `${color}.main`, display: 'flex' }}>{icon}</Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <Chip
              label={`${items.length}건`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {formatCurrency(total)}
            </Typography>
            <IconButton size="small">
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        {/* 항목 목록 */}
        <Collapse in={expanded}>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center', py: 1 }}>
              등록된 {label}이(가) 없습니다
            </Typography>
          ) : (
            <Box sx={{ mt: 1.5 }}>
              {items.map((item, index) => (
                <Box key={item.id}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color={`${color}.main`} sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.amount)}
                    </Typography>
                    {/* 대출 추가 정보 */}
                    {categoryKey === 'loans' && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {item.interestRate != null && (
                          <Chip label={`${item.interestRate}%`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                        {item.repaymentType && (
                          <Chip
                            label={REPAYMENT_TYPE_LABELS[item.repaymentType] || item.repaymentType}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                        {item.expirationDate && (
                          <Chip label={`만기 ${item.expirationDate}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                        {item.isExcludingCalculation && (
                          <Chip label="계산제외" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// 재무 요약 컴포넌트
const FinancialSummarySection = ({ summary, title }: { summary: CombinedSummary; title: string }) => {
  const items = [
    { label: '총 자산', value: summary.totalAssets, color: 'primary.main' },
    { label: '총 대출', value: summary.totalLoans, color: 'error.main' },
    { label: '순자산', value: summary.netAssets, color: 'success.main', subtitle: '자산 - 대출' },
    { label: '월소득', value: summary.totalMonthlyIncome, color: 'info.main' },
    { label: '월지출', value: summary.totalMonthlyExpense, color: 'warning.main' },
    { label: '월 가용자금', value: summary.monthlyAvailableFunds, color: 'success.dark', subtitle: '월소득 - 월지출' },
  ];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          {title}
        </Typography>
        <Grid container spacing={1.5}>
          {items.map((item, index) => (
            <Grid item xs={4} key={index}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>
                  {formatCurrency(item.value)}
                </Typography>
                {item.subtitle && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                    {item.subtitle}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// 개인 자산 상세 컴포넌트
const MemberAssetDetail = ({
  assetInfo,
  ownerTypeLabel,
  editable,
  onEdit,
}: {
  assetInfo: AssetInfo | null;
  ownerTypeLabel: string;
  editable: boolean;
  onEdit: () => void;
}) => {
  if (!assetInfo) {
    if (!editable) {
      return (
        <EmptyState message={`${ownerTypeLabel} 자산정보가 없습니다`} />
      );
    }
    return (
      <EmptyState
        message={`${ownerTypeLabel} 자산정보가 없습니다`}
        actionLabel={`${ownerTypeLabel} 자산 등록하기`}
        onAction={onEdit}
      />
    );
  }

  return (
    <Box>
      {/* 개인 재무 요약 */}
      <Card variant="outlined" sx={{ mb: 2, bgcolor: 'grey.50' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">순자산</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatCurrency(assetInfo.netAssets || 0)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">월 가용자금</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'info.main' }}>
                {formatCurrency(assetInfo.monthlyAvailableFunds || 0)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 카테고리별 목록 */}
      {CATEGORY_CONFIG.map((config) => {
        const items = assetInfo[config.key] || [];
        const totalMap: Record<string, number> = {
          assets: assetInfo.totalAssets,
          loans: assetInfo.totalLoans,
          monthlyIncomes: assetInfo.totalMonthlyIncome,
          monthlyExpenses: assetInfo.totalMonthlyExpense,
        };

        return (
          <CategorySection
            key={config.key}
            categoryKey={config.key}
            label={config.label}
            icon={config.icon}
            color={config.color}
            items={items}
            total={totalMap[config.key] || 0}
          />
        );
      })}

      {/* 수정 버튼 */}
      {editable && (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ mt: 1 }}
        >
          {ownerTypeLabel} 자산정보 수정
        </Button>
      )}

      {/* 최근 수정일 */}
      {assetInfo.updatedAt && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          최근 수정: {assetInfo.updatedAt}
        </Typography>
      )}
    </Box>
  );
};

const AssetManagement = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HouseholdAssetResponse | null>(null);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);

  // 가구원 전체 자산정보 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assetApi.getHouseholdAssets();
      setData(response);
    } catch (error) {
      console.error('가구원 자산정보 로드 실패:', error);
      dispatch(openSnackbar({ message: '자산정보를 불러오는데 실패했습니다', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 수정 화면 이동
  const handleEditSelf = () => navigate('/assets/self');

  if (loading) {
    return <Loading message="자산정보를 불러오는 중..." />;
  }

  if (!data || !data.members || data.members.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <EmptyState
          message="등록된 자산정보가 없습니다"
          actionLabel="자산정보 등록하기"
          onAction={() => navigate('/assets/self')}
        />
      </Box>
    );
  }

  const currentMember: HouseholdMemberAsset = data.members[selectedMemberIndex];
  const memberAssets = currentMember?.assets?.assets || [];

  // 본인(SELF) 데이터 추출
  const selfAsset: AssetInfo | null = memberAssets.find((a) => a.ownerType === 'SELF') || null;

  const hasMultipleMembers = data.members.length > 1;
  const isSelfTab = currentMember?.userId === user?.userId;

  return (
    <Box sx={{ pb: 10 }}>
      {/* 가구 재무 요약 */}
      <FinancialSummarySection summary={data.householdSummary} title="가구 전체 재무 현황" />

      {/* 가구원이 여러 명이면 가구원 탭 표시 */}
      {hasMultipleMembers && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={selectedMemberIndex}
            onChange={(_e, v) => setSelectedMemberIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {data.members.map((member) => {
              const isSelf = member.userId === user?.userId;
              return (
                <Tab
                  key={member.userId}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">{member.userName || member.userId}</Typography>
                      {isSelf
                        ? <Chip label="본인" color="primary" size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                        : <Chip label={getRoleLabel(member.role)} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                      }
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>
      )}

      {/* 개인 재무 요약 (가구원의 combinedSummary) */}
      {currentMember?.assets?.combinedSummary && hasMultipleMembers && (
        <FinancialSummarySection
          summary={currentMember.assets.combinedSummary}
          title={`${currentMember.userName || currentMember.userId} 재무 현황`}
        />
      )}

      {/* 본인 자산 상세 */}
      <MemberAssetDetail
        assetInfo={selfAsset}
        ownerTypeLabel="본인"
        editable={isSelfTab}
        onEdit={handleEditSelf}
      />
    </Box>
  );
};

export default AssetManagement;
