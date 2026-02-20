import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  AccountBalance as LoanIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import { calculatorApi } from '../../services/calculator/calculatorApi';
import type { CalculationResultResponse } from '../../services/calculator/calculatorApi';

const CalculationResultDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CalculationResultResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 계산 결과 상세 조회
  const loadResult = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await calculatorApi.getResult(id);
      if (response) {
        setResult(response);
      }
    } catch (error) {
      console.error('계산 결과 조회 실패:', error);
      dispatch(
        openSnackbar({
          message: '계산 결과를 불러오는데 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      if (confirm("삭제 하시겠습니까?")) {
        await calculatorApi.deleteResult(id);
        dispatch(
          openSnackbar({
            message: '계산 결과가 삭제되었습니다',
            severity: 'success',
          })
        );
        navigate('/calculator/results', { replace: true });
      }
    } catch (error) {
      console.error('계산 결과 삭제 실패:', error);
      dispatch(
        openSnackbar({
          message: '계산 결과 삭제에 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // 금액 포맷
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ko-KR')}원`;
  };

  // 날짜 포맷
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 비율 포맷
  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // LTV/DTI/DSR 진행률 바 색상
  const getProgressColor = (value: number, limit: number): 'success' | 'warning' | 'error' => {
    const ratio = value / limit;
    if (ratio <= 0.7) return 'success';
    if (ratio <= 1.0) return 'warning';
    return 'error';
  };

  if (loading) {
    return <Loading message="계산 결과를 불러오는 중..." />;
  }

  if (!result) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          계산 결과를 찾을 수 없습니다
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/calculator/results')}
        >
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  const { financialStatus, loanAnalysis, afterMoveIn } = result;
  const isEligible = result.status;
  // const isEligible = result.status === 'ELIGIBLE';

  return (
    <Box sx={{ pb: 12 }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            계산 결과 상세
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ color: 'text.secondary' }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* 주택 정보 및 충족여부 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {result.housingName}
              </Typography>
            </Box>
            <Chip
              icon={isEligible === "ELIGIBLE" ? <CheckIcon /> : <CancelIcon />}
              label={isEligible === "ELIGIBLE" ? '적격' : '부적격'}
              color={isEligible === "ELIGIBLE" ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          {result.moveInDate && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              입주일: {new Date(result.moveInDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            계산일: {formatDate(result.calculatedAt)}
          </Typography>
        </CardContent>
      </Card>

      {/* 계산 참여 가구원 */}
      {result.includedHouseholdMembers && result.includedHouseholdMembers.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PeopleIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                계산 참여 가구원
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {result.includedHouseholdMembers.map((member) => (
                <Chip
                  key={member.userId}
                  label={member.userName}
                  variant="outlined"
                  size="small"
                  color="primary"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 재무 현황 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUpIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              재무 현황
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                현재 순자산
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(financialStatus.currentAssets)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                입주 시점 예상자산
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(financialStatus.estimatedAssets)}
              </Typography>
            </Box>

            <Divider />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                대출필요 금액
              </Typography>
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: 700 }}
              >
                {formatCurrency(financialStatus.loanRequired)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 대출 분석 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LoanIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              대출 분석
            </Typography>
          </Box>

          {/* 대출상품명 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              실행 대출상품
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {result.loanProductName}
            </Typography>
          </Box>

          {/* 실행 대출금액 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              실행 대출금액
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatCurrency(result.loanAmount)}
            </Typography>
          </Box>

          {/* 월 상환액 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              월 상환액
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatCurrency(loanAnalysis.monthlyPayment)}
            </Typography>
          </Box>

          {/* LTV */}
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                LTV
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPercent(loanAnalysis.ltv)} / 한도 {formatPercent(loanAnalysis.ltvLimit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((loanAnalysis.ltv / loanAnalysis.ltvLimit) * 100, 100)}
              color={getProgressColor(loanAnalysis.ltv, loanAnalysis.ltvLimit)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {loanAnalysis.ltv > loanAnalysis.ltvLimit && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                한도 초과
              </Typography>
            )}
          </Box>

          {/* DTI */}
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                DTI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPercent(loanAnalysis.dti)} / 한도 {formatPercent(loanAnalysis.dtiLimit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((loanAnalysis.dti / loanAnalysis.dtiLimit) * 100, 100)}
              color={getProgressColor(loanAnalysis.dti, loanAnalysis.dtiLimit)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {loanAnalysis.dti > loanAnalysis.dtiLimit && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                한도 초과
              </Typography>
            )}
          </Box>

          {/* DSR */}
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                DSR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPercent(loanAnalysis.dsr)} / 한도 {formatPercent(loanAnalysis.dsrLimit)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((loanAnalysis.dsr / loanAnalysis.dsrLimit) * 100, 100)}
              color={getProgressColor(loanAnalysis.dsr, loanAnalysis.dsrLimit)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            {loanAnalysis.dsr > loanAnalysis.dsrLimit && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                한도 초과
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              mt: 1,
              mb: 2,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ※ DSR은 대출자산의 대출실행 금액 및 상환기간 기준 원리금균등상환으로 가정하여 진행됩니다.<br/>
              ※ DTI/DSR은 프로필 수정 화면에서 입력된 원천징수소득 기준으로 계산됩니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 충족여부 메시지 */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isEligible === "ELIGIBLE" ? 'success.50' : 'error.50',
              backgroundColor: isEligible
                ? 'rgba(46, 125, 50, 0.08)'
                : 'rgba(211, 47, 47, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {isEligible === "ELIGIBLE" ? (
                <CheckIcon color="success" fontSize="small" />
              ) : (
                <WarningIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body1"
                color={isEligible === "ELIGIBLE" ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 600 }}
              >
                {isEligible === "ELIGIBLE"
                  ? '이 대출상품을 이용할 수 있습니다'
                  : '이 대출상품 기준을 충족하지 못합니다'}
              </Typography>
            </Box>

            {/* 미충족 사유 목록 */}
            {!(isEligible === "ELIGIBLE") &&
              loanAnalysis.ineligibilityReasons &&
              loanAnalysis.ineligibilityReasons.length > 0 && (
                <Box sx={{ mt: 1, pl: 3.5 }}>
                  {loanAnalysis.ineligibilityReasons.map((reason, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="error.main"
                      sx={{ mb: 0.5 }}
                    >
                      • {reason}
                    </Typography>
                  ))}
                </Box>
              )}
          </Box>
        </CardContent>
      </Card>

      {/* 입주 후 재무상태 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HomeIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              입주 후 재무상태
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                입주 후 예상 자산
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(afterMoveIn.assets)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                월 소득
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(afterMoveIn.monthlyIncome)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                월 지출 (대출상환 포함)
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatCurrency(afterMoveIn.monthlyExpenses)}
              </Typography>
            </Box>

            <Divider />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                월 여유자금
              </Typography>
              <Typography
                variant="h6"
                color={
                  afterMoveIn.monthlyAvailableFunds >= 0
                    ? 'success.main'
                    : 'error.main'
                }
                sx={{ fontWeight: 700 }}
              >
                {formatCurrency(afterMoveIn.monthlyAvailableFunds)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 하단 버튼 영역 */}
      {/* <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 100,
          maxWidth: 800,
          mx: 'auto',
        }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<RefreshIcon />}
          onClick={() => navigate('/calculator')}
        >
          다른 조건으로 계산하기
        </Button>
      </Box> */}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>계산 결과 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 계산 결과를 삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalculationResultDetail;
