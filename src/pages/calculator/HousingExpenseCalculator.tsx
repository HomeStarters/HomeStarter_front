import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Backdrop,
  InputAdornment,
  Chip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import { housingApi } from '../../services/housing/housingApi';
import { loanApi } from '../../services/loan/loanApi';
import { calculatorApi } from '../../services/calculator/calculatorApi';
import type { HousingListItem } from '../../services/housing/housingApi';
import type { LoanProductDTO } from '../../services/loan/loanApi';

// 금액 포맷 (만원 단위)
const formatCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
};

const HousingExpenseCalculator = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // 데이터 로딩 상태
  const [pageLoading, setPageLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // 목록 데이터
  const [housings, setHousings] = useState<HousingListItem[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProductDTO[]>([]);

  // 폼 상태
  const [selectedHousingId, setSelectedHousingId] = useState<string>('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('360');

  // 선택된 대출상품 정보
  const selectedLoan = loanProducts.find((l) => String(l.id) === selectedLoanId);

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setPageLoading(true);
      const [housingRes, loanRes] = await Promise.all([
        housingApi.getHousings({ page: 0, size: 100, sort: 'createdAt', direction: 'DESC' }),
        loanApi.getLoanProducts({ page: 0, size: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      if (housingRes.success && housingRes.data?.housings) {
        setHousings(housingRes.data.housings);
      }

      if (loanRes.success && loanRes.data?.content) {
        // 활성화된 대출상품만 필터링
        setLoanProducts(loanRes.data.content.filter((l) => l.active));
      }
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 주택 선택 핸들러
  const handleHousingChange = (e: SelectChangeEvent<string>) => {
    setSelectedHousingId(e.target.value);
  };

  // 대출상품 선택 핸들러
  const handleLoanChange = (e: SelectChangeEvent<string>) => {
    setSelectedLoanId(e.target.value);
    // 대출상품 선택 시 대출한도를 기본 대출금액으로 설정
    const loan = loanProducts.find((l) => String(l.id) === e.target.value);
    if (loan) {
      setLoanAmount(String(loan.loanLimit));
    }
  };

  // 대출금액 변경 핸들러
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setLoanAmount(value);
  };

  // 대출기간 변경 핸들러
  const handleLoanTermChange = (e: SelectChangeEvent<string>) => {
    setLoanTerm(e.target.value);
  };

  // 폼 유효성 검사
  const isFormValid = selectedHousingId && selectedLoanId && loanAmount && Number(loanAmount) > 0 && loanTerm;

  // 계산 실행
  const handleCalculate = async () => {
    if (!isFormValid) return;

    try {
      setCalculating(true);

      const response = await calculatorApi.calculateHousingExpenses({
        housingId: selectedHousingId,
        loanProductId: selectedLoanId,
        loanAmount: Number(loanAmount),
        loanTerm: Number(loanTerm),
      });

      if (response) {
        const result = response;
        const eligibleText = result.loanAnalysis.isEligible
          ? '✅ 대출 기준을 충족합니다.'
          : '❌ 대출 기준을 충족하지 못합니다.';

        const reasons = result.loanAnalysis.ineligibilityReasons?.length
          ? `\n사유: ${result.loanAnalysis.ineligibilityReasons.join(', ')}`
          : '';

        alert(
          `계산이 완료되었습니다.\n\n` +
          `[재무 현황]\n` +
          `- 예상자산: ${formatCurrency(result.financialStatus.estimatedAssets)}\n` +
          `- 대출필요 금액: ${formatCurrency(result.financialStatus.loanRequired)}\n\n` +
          `[대출 분석]\n` +
          `- LTV: ${result.loanAnalysis.ltv.toFixed(1)}% / ${result.loanAnalysis.ltvLimit}%\n` +
          `- DTI: ${result.loanAnalysis.dti.toFixed(1)}% / ${result.loanAnalysis.dtiLimit}%\n` +
          `- DSR: ${result.loanAnalysis.dsr.toFixed(1)}% / ${result.loanAnalysis.dsrLimit}%\n` +
          `- ${eligibleText}${reasons}\n\n` +
          `[입주 후 예상]\n` +
          `- 예상 자산: ${formatCurrency(result.afterMoveIn.assets)}\n` +
          `- 예상 월지출: ${formatCurrency(result.afterMoveIn.monthlyExpenses)}\n` +
          `- 월 여유자금: ${formatCurrency(result.afterMoveIn.monthlyAvailableFunds)}`
        );

        navigate('/calculator/results');
      } else {
        dispatch(
          openSnackbar({
            message: response || '계산에 실패했습니다.',
            severity: 'error',
          })
        );
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || '계산 중 오류가 발생했습니다.';
      dispatch(
        openSnackbar({
          message: errorMessage,
          severity: 'error',
        })
      );
    } finally {
      setCalculating(false);
    }
  };

  if (pageLoading) {
    return <Loading message="데이터를 불러오는 중..." />;
  }

  return (
    <Box sx={{ pb: 12 }}>
      {/* 페이지 부제목 */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', mb: 3 }}
      >
        입주 후 지출 계산
      </Typography>

      {/* 입력 섹션 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          대출 조건 입력
        </Typography>

        {/* 주택 선택 */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="housing-select-label">주택 선택 *</InputLabel>
          <Select
            labelId="housing-select-label"
            value={selectedHousingId}
            label="주택 선택 *"
            onChange={handleHousingChange}
          >
            {housings.map((housing) => (
              <MenuItem key={housing.id} value={String(housing.id)}>
                {housing.housingName} - {formatCurrency(housing.price)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 대출상품 선택 */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="loan-select-label">대출상품 선택 *</InputLabel>
          <Select
            labelId="loan-select-label"
            value={selectedLoanId}
            label="대출상품 선택 *"
            onChange={handleLoanChange}
          >
            {loanProducts.map((loan) => (
              <MenuItem key={loan.id} value={String(loan.id)}>
                {loan.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 선택된 대출상품 요약 */}
        {selectedLoan && (
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {selectedLoan.name}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  대출한도
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatCurrency(selectedLoan.loanLimit)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  금리
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedLoan.interestRate}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  기준 적용
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {selectedLoan.isApplyLtv && (
                    <Chip label="LTV" size="small" color="primary" variant="outlined" />
                  )}
                  {selectedLoan.isApplyDti && (
                    <Chip label="DTI" size="small" color="primary" variant="outlined" />
                  )}
                  {selectedLoan.isApplyDsr && (
                    <Chip label="DSR" size="small" color="primary" variant="outlined" />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* 대출금액 입력 */}
        <TextField
          fullWidth
          label="대출금액 (원) *"
          value={loanAmount ? Number(loanAmount).toLocaleString() : ''}
          onChange={handleLoanAmountChange}
          placeholder="대출 희망 금액을 입력하세요"
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">원</InputAdornment>,
          }}
          helperText={
            loanAmount && Number(loanAmount) > 0
              ? formatCurrency(Number(loanAmount))
              : ''
          }
        />

        {/* 대출기간 선택 */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="loan-term-label">대출기간 *</InputLabel>
          <Select
            labelId="loan-term-label"
            value={loanTerm}
            label="대출기간 *"
            onChange={handleLoanTermChange}
          >
            <MenuItem value="120">10년 (120개월)</MenuItem>
            <MenuItem value="180">15년 (180개월)</MenuItem>
            <MenuItem value="240">20년 (240개월)</MenuItem>
            <MenuItem value="300">25년 (300개월)</MenuItem>
            <MenuItem value="360">30년 (360개월)</MenuItem>
            <MenuItem value="420">35년 (420개월)</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* 계산하기 버튼 */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!isFormValid || calculating}
          onClick={handleCalculate}
          sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem' }}
        >
          {calculating ? '계산 중...' : '계산하기'}
        </Button>
      </Paper>

      {/* 계산 중 오버레이 */}
      <Backdrop
        open={calculating}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', gap: 2 }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body1" color="inherit">
          최적의 대출 조건을 분석하고 있습니다...
        </Typography>
      </Backdrop>
    </Box>
  );
};

export default HousingExpenseCalculator;
