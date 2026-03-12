import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  TextField,
  CircularProgress,
  Fab,
  Drawer,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/Calculate';
import LinkIcon from '@mui/icons-material/Link';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { openSnackbar } from '../../store/slices/uiSlice';
import { assetApi, type AssetItem, type AssetUpdateRequest, type LoanType } from '../../services/asset/assetApi';

// 탭 타입
type TabType = 'assets' | 'loans' | 'monthlyIncome' | 'monthlyExpense';

// 탭 설정
const TAB_CONFIG: { key: TabType; label: string; addLabel: string }[] = [
  { key: 'assets', label: '자산', addLabel: '자산 추가' },
  { key: 'loans', label: '대출', addLabel: '대출 추가' },
  { key: 'monthlyIncome', label: '월소득', addLabel: '월소득 추가' },
  { key: 'monthlyExpense', label: '월지출', addLabel: '월지출 추가' },
];

// 바텀시트 모드
type SheetMode = 'add' | 'edit';

// 상환 유형 옵션
const REPAYMENT_TYPE_OPTIONS = [
  { value: 'EP', label: '원금균등 (EP)' },
  { value: 'EPI', label: '원리금균등 (EPI)' },
  { value: 'MDT', label: '만기일시 (MDT)' },
  { value: 'GG', label: '체증식 (GG)' },
];

// 상환 유형 라벨 변환
const getRepaymentTypeLabel = (type: string): string => {
  const option = REPAYMENT_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option ? option.label : type;
};

// 대출 유형 옵션
const LOAN_TYPE_OPTIONS = [
  { value: 'MORTGAGE', label: '주택담보대출' },
  { value: 'JEONSE', label: '전세대출' },
  { value: 'CREDIT', label: '신용대출' },
  { value: 'OTHER', label: '기타대출' },
];

// 대출 유형 라벨 변환
const getLoanTypeLabel = (type: string): string => {
  const option = LOAN_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option ? option.label : type;
};

// 금액 포맷 함수
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

// 금액 파싱 함수 (콤마 제거)
const parseAmount = (value: string): number => {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
};

const SelfAssetInput = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Asset ID (API에서 조회된 자산 정보의 고유 ID)
  const [assetId, setAssetId] = useState<number | null>(null);

  // 자산 데이터
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loans, setLoans] = useState<AssetItem[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<AssetItem[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState<AssetItem[]>([]);

  // 월지출 자동 등록 토글
  const [autoRegisterExpense, setAutoRegisterExpense] = useState(true);

  // 월지출 등록 Confirm 다이얼로그
  const [showExpenseConfirm, setShowExpenseConfirm] = useState(false);
  const [expenseRegisterLoading, setExpenseRegisterLoading] = useState(false);

  // 바텀시트 상태
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>('add');
  const [editingItem, setEditingItem] = useState<AssetItem | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputInterestRate, setInputInterestRate] = useState('');
  const [inputRepaymentType, setInputRepaymentType] = useState('');
  const [inputExpirationDate, setInputExpirationDate] = useState('');
  const [inputIsExcludingCalculation, setInputIsExcludingCalculation] = useState(false);
  const [inputExecutedAmount, setInputExecutedAmount] = useState('');
  const [inputRepaymentPeriod, setInputRepaymentPeriod] = useState('');
  const [inputLoanType, setInputLoanType] = useState('');
  const [inputGracePeriod, setInputGracePeriod] = useState('');

  // 유효성 검증 에러 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 자산정보 로드 (공통 함수)
  const loadAssetsData = async () => {
    try {
      const response = await assetApi.getAssets();
      console.log(response);
      if (response?.assets) {
        const selfData = response.assets.find(
          (asset: { ownerType?: string }) => asset.ownerType === 'SELF'
        );
        if (selfData) {
          if (selfData.assetId) setAssetId(selfData.assetId);
          const loadedLoans = selfData.loans || [];
          const loadedExpenses = selfData.monthlyExpenses || [];
          setAssets(selfData.assets || []);
          setLoans(loadedLoans);
          setMonthlyIncome(selfData.monthlyIncomes || []);
          setMonthlyExpense(loadedExpenses);
          return { loans: loadedLoans, monthlyExpenses: loadedExpenses };
        }
      }
    } catch (error) {
      console.error('자산정보 로드 실패:', error);
    }
    return null;
  };

  // 초기 로드
  useEffect(() => {
    loadAssetsData().finally(() => setInitialLoading(false));
  }, []);

  // 특정 대출에 연결된 월지출 항목 조회
  const getLoanLinkedExpense = (loanId: string): AssetItem | undefined => {
    return monthlyExpense.find((e) => e.loanItemId === loanId);
  };

  // 서버에 저장된 대출 중 월지출이 없는 항목 목록
  const getLoansWithoutLinkedExpense = (
    currentLoans: AssetItem[],
    currentExpenses: AssetItem[]
  ): AssetItem[] => {
    const linkedLoanIds = currentExpenses
      .filter((e) => e.loanItemId)
      .map((e) => e.loanItemId!);
    return currentLoans.filter(
      (loan) => !loan.id.startsWith('temp_') && !linkedLoanIds.includes(loan.id)
    );
  };

  // 현재 탭의 데이터 가져오기
  const getCurrentData = (): AssetItem[] => {
    switch (TAB_CONFIG[activeTab].key) {
      case 'assets': return assets;
      case 'loans': return loans;
      case 'monthlyIncome': return monthlyIncome;
      case 'monthlyExpense': return monthlyExpense;
      default: return [];
    }
  };

  // 현재 탭의 데이터 설정하기
  const setCurrentData = (data: AssetItem[]) => {
    switch (TAB_CONFIG[activeTab].key) {
      case 'assets': setAssets(data); break;
      case 'loans': setLoans(data); break;
      case 'monthlyIncome': setMonthlyIncome(data); break;
      case 'monthlyExpense': setMonthlyExpense(data); break;
    }
  };

  // 총액 계산
  const calculateTotal = (items: AssetItem[]): number => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  // 탭 변경
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 항목 추가 시트 열기
  const handleOpenAddSheet = () => {
    setSheetMode('add');
    setEditingItem(null);
    setInputName('');
    setInputAmount('');
    setInputInterestRate('');
    setInputRepaymentType('');
    setInputExpirationDate('');
    setInputIsExcludingCalculation(false);
    setInputExecutedAmount('');
    setInputRepaymentPeriod('');
    setInputLoanType('');
    setInputGracePeriod('');
    setErrors({});
    setSheetOpen(true);
  };

  // 항목 수정 시트 열기
  const handleOpenEditSheet = (item: AssetItem) => {
    setSheetMode('edit');
    setEditingItem(item);
    setInputName(item.name);
    setInputAmount(formatAmount(item.amount));
    setInputInterestRate(item.interestRate != null ? String(item.interestRate) : '');
    setInputRepaymentType(item.repaymentType || '');
    setInputExpirationDate(item.expirationDate || '');
    setInputIsExcludingCalculation(item.isExcludingCalculation || false);
    setInputExecutedAmount(item.executedAmount != null ? formatAmount(item.executedAmount) : '');
    setInputRepaymentPeriod(item.repaymentPeriod != null ? String(item.repaymentPeriod) : '');
    setInputLoanType(item.loanType || '');
    setInputGracePeriod(item.gracePeriod != null ? String(item.gracePeriod) : '');
    setErrors({});
    setSheetOpen(true);
  };

  // 시트 닫기
  const handleCloseSheet = () => {
    setSheetOpen(false);
    setEditingItem(null);
    setInputName('');
    setInputAmount('');
    setInputInterestRate('');
    setInputRepaymentType('');
    setInputExpirationDate('');
    setInputIsExcludingCalculation(false);
    setInputExecutedAmount('');
    setInputRepaymentPeriod('');
    setInputLoanType('');
    setInputGracePeriod('');
    setErrors({});
  };

  // 대출 탭 유효성 검증
  const validateLoanFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!inputName.trim()) newErrors.name = '이름을 입력해주세요';
    if (!inputAmount) newErrors.amount = '금액을 입력해주세요';
    if (!inputInterestRate) newErrors.interestRate = '금리를 입력해주세요';
    if (!inputRepaymentType) newErrors.repaymentType = '상환 유형을 선택해주세요';
    if (!inputExecutedAmount) newErrors.executedAmount = '대출실행 금액을 입력해주세요';
    if (!inputRepaymentPeriod) newErrors.repaymentPeriod = '상환기간을 입력해주세요';
    if (!inputLoanType) newErrors.loanType = '대출유형을 선택해주세요';
    if (!inputExpirationDate) newErrors.expirationDate = '만기일을 입력해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 항목 저장 (추가/수정)
  const handleSaveItem = () => {
    const isLoanTab = TAB_CONFIG[activeTab].key === 'loans';

    if (isLoanTab) {
      if (!validateLoanFields()) {
        dispatch(openSnackbar({ message: '모든 항목을 입력해주세요', severity: 'warning' }));
        return;
      }
    } else if (!inputName.trim() || !inputAmount) {
      dispatch(openSnackbar({ message: '이름과 금액을 입력해주세요', severity: 'warning' }));
      return;
    }

    const amount = parseAmount(inputAmount);
    const currentData = getCurrentData();

    if (sheetMode === 'add') {
      const newItem: AssetItem = {
        id: `temp_${Date.now()}`,
        name: inputName.trim(),
        amount,
        ...(isLoanTab && {
          interestRate: inputInterestRate ? parseFloat(inputInterestRate) : undefined,
          loanType: (inputLoanType as LoanType) || undefined,
          repaymentType: inputRepaymentType || undefined,
          expirationDate: inputExpirationDate || undefined,
          isExcludingCalculation: inputIsExcludingCalculation,
          executedAmount: inputExecutedAmount ? parseAmount(inputExecutedAmount) : undefined,
          repaymentPeriod: inputRepaymentPeriod ? parseInt(inputRepaymentPeriod, 10) : undefined,
          gracePeriod: inputGracePeriod ? parseInt(inputGracePeriod, 10) : undefined,
        }),
      };
      setCurrentData([...currentData, newItem]);
    } else if (sheetMode === 'edit' && editingItem) {
      const updatedData = currentData.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: inputName.trim(),
              amount,
              ...(isLoanTab && {
                interestRate: inputInterestRate ? parseFloat(inputInterestRate) : undefined,
                loanType: (inputLoanType as LoanType) || undefined,
                repaymentType: inputRepaymentType || undefined,
                expirationDate: inputExpirationDate || undefined,
                isExcludingCalculation: inputIsExcludingCalculation,
                executedAmount: inputExecutedAmount ? parseAmount(inputExecutedAmount) : undefined,
                repaymentPeriod: inputRepaymentPeriod ? parseInt(inputRepaymentPeriod, 10) : undefined,
                gracePeriod: inputGracePeriod ? parseInt(inputGracePeriod, 10) : undefined,
              }),
            }
          : item
      );
      setCurrentData(updatedData);
    }

    handleCloseSheet();
  };

  // 항목 삭제
  const handleDeleteItem = async (itemId: string) => {
    const isLoanTab = TAB_CONFIG[activeTab].key === 'loans';

    // 임시 ID는 로컬에서만 삭제
    if (itemId.startsWith('temp_')) {
      const updatedData = getCurrentData().filter((item) => item.id !== itemId);
      setCurrentData(updatedData);
      return;
    }

    try {
      if (confirm('삭제 하시겠습니까?')) {
        const assetType = TAB_CONFIG[activeTab].key;
        await assetApi.deleteAssetItem(assetType, itemId);

        // 대출 삭제 시 서버에서 연결된 월지출도 삭제되므로 전체 리로드
        if (isLoanTab) {
          await loadAssetsData();
        } else {
          const updatedData = getCurrentData().filter((item) => item.id !== itemId);
          setCurrentData(updatedData);
        }

        dispatch(openSnackbar({ message: '항목이 삭제되었습니다', severity: 'success' }));
      }
    } catch (error) {
      console.error('항목 삭제 실패:', error);
      dispatch(openSnackbar({ message: '항목 삭제 중 오류가 발생했습니다', severity: 'error' }));
    }
  };

  // 대출 항목별 월지출 자동계산 버튼 핸들러
  const handleLoanAutoCalculate = async (loan: AssetItem) => {
    console.log(loan);
    if (loan.id.startsWith('temp_')) {
      dispatch(openSnackbar({ message: '먼저 자산정보를 저장해주세요', severity: 'warning' }));
      return;
    }

    const linked = getLoanLinkedExpense(loan.id);
    if (linked) {
      dispatch(openSnackbar({ message: '이미 월지출이 등록되어 있습니다', severity: 'info' }));
      return;
    }

    try {
      await assetApi.registerLoanExpense(loan.id);
      await loadAssetsData();
      dispatch(openSnackbar({ message: `'${loan.name} 상환' 월지출이 등록되었습니다`, severity: 'success' }));
    } catch (error) {
      console.error('월지출 자동 등록 실패:', error);
      dispatch(openSnackbar({ message: '월지출 자동 등록 중 오류가 발생했습니다', severity: 'error' }));
    }
  };

  // 월지출 Confirm - 확인
  const handleConfirmExpenseRegister = async () => {
    setExpenseRegisterLoading(true);
    try {
      const loansToRegister = getLoansWithoutLinkedExpense(loans, monthlyExpense);
      if (loansToRegister.length > 0) {
        await Promise.all(loansToRegister.map((loan) => assetApi.registerLoanExpense(loan.id)));
        await loadAssetsData();
        dispatch(openSnackbar({ message: '월지출이 자동 등록되었습니다', severity: 'success' }));
      }
    } catch (error) {
      console.error('월지출 자동 등록 실패:', error);
      dispatch(openSnackbar({ message: '월지출 자동 등록 중 오류가 발생했습니다', severity: 'error' }));
    } finally {
      setExpenseRegisterLoading(false);
      setShowExpenseConfirm(false);
      navigate('/dashboard');
    }
  };

  // 월지출 Confirm - 취소
  const handleCancelExpenseRegister = () => {
    setShowExpenseConfirm(false);
    navigate('/dashboard');
  };

  // 금액 입력 핸들러
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setInputAmount(formatAmount(parseInt(numericValue, 10)));
    } else {
      setInputAmount('');
    }
  };

  // 폼 제출
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const requestData: AssetUpdateRequest = {
        assets,
        loans,
        monthlyIncomes: monthlyIncome,
        monthlyExpenses: monthlyExpense,
      };

      let response;

      if (assetId) {
        if (confirm('수정 하시겠습니까?')) {
          response = await assetApi.updateAssets(assetId, requestData);
        }
      } else {
        if (!user?.userId) {
          dispatch(openSnackbar({ message: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.', severity: 'error' }));
          setLoading(false);
          return;
        }
        if (confirm('등록 하시겠습니까?')) {
          response = await assetApi.createAssetsByUserId(user.userId, 'SELF', requestData);
        }
      }

      if (response) {
        dispatch(openSnackbar({ message: '본인 자산정보가 저장되었습니다', severity: 'success' }));

        // 저장 후 최신 데이터 리로드 (서버 ID 확보)
        const reloaded = await loadAssetsData();

        // 대출 항목이 있고 토글이 ON이면 월지출 등록 Confirm 표시
        if (reloaded && reloaded.loans.length > 0 && autoRegisterExpense) {
          const unlinked = getLoansWithoutLinkedExpense(reloaded.loans, reloaded.monthlyExpenses);
          if (unlinked.length > 0) {
            setShowExpenseConfirm(true);
            return; // 다이얼로그에서 navigate 처리
          }
        }

        navigate('/dashboard');
      }
    } catch (error) {
      dispatch(openSnackbar({ message: '자산정보 저장 중 오류가 발생했습니다', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentData = getCurrentData();
  const currentTotal = calculateTotal(currentData);
  const currentConfig = TAB_CONFIG[activeTab];
  const isLoanTab = currentConfig.key === 'loans';
  const isExpenseTab = currentConfig.key === 'monthlyExpense';

  return (
    <Box sx={{ pb: 18 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          본인 자산정보 입력
        </Typography>
        <Typography variant="body2" color="text.secondary">
          본인의 자산, 대출, 월소득, 월지출을 입력해주세요
        </Typography>
      </Box>

      {/* 탭 */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {TAB_CONFIG.map((config) => (
          <Tab key={config.key} label={config.label} />
        ))}
      </Tabs>

      {/* 대출 탭: 월지출 자동 등록 토글 */}
      {isLoanTab && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 1,
            mb: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              월지출 자동 등록
            </Typography>
            <Typography variant="caption" color="text.secondary">
              저장 시 월 상환액을 월지출로 자동 등록합니다
            </Typography>
          </Box>
          <Switch
            checked={autoRegisterExpense}
            onChange={(e) => setAutoRegisterExpense(e.target.checked)}
            color="primary"
          />
        </Box>
      )}

      {/* 항목 목록 */}
      <Box sx={{ minHeight: '40vh' }}>
        {currentData.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              등록된 {currentConfig.label}이(가) 없습니다
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddSheet}>
              {currentConfig.addLabel}
            </Button>
          </Box>
        ) : (
          <Box>
            {currentData.map((item) => (
              <Card key={item.id} sx={{ mb: 1.5 }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      {/* 월지출 탭: 대출 연결 표시 */}
                      {isExpenseTab && item.loanItemId && (
                        <Chip
                          icon={<LinkIcon />}
                          label="대출연결"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 0.5, height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                        {formatAmount(item.amount)}원
                      </Typography>

                      {/* 대출 탭: 상세 정보 */}
                      {isLoanTab && (
                        <Box sx={{ mt: 0.5 }}>
                          {item.interestRate != null && (
                            <Typography variant="caption" color="text.secondary">
                              금리: {item.interestRate}%
                            </Typography>
                          )}
                          {item.repaymentType && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: item.interestRate != null ? 1.5 : 0 }}>
                              상환: {getRepaymentTypeLabel(item.repaymentType)}
                            </Typography>
                          )}
                          {item.loanType && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              대출유형: {getLoanTypeLabel(item.loanType)}
                            </Typography>
                          )}
                          {item.executedAmount != null && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              대출실행금액: {formatAmount(item.executedAmount)}원
                            </Typography>
                          )}
                          {item.repaymentPeriod != null && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              상환기간: {item.repaymentPeriod}개월
                            </Typography>
                          )}
                          {item.gracePeriod != null && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              거치기간: {item.gracePeriod}개월
                            </Typography>
                          )}
                          {item.expirationDate && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              만기일: {item.expirationDate}
                            </Typography>
                          )}
                          {item.isExcludingCalculation && (
                            <Typography variant="caption" color="warning.main" display="block" sx={{ fontWeight: 500 }}>
                              ⚠️ 지출계산 제외
                            </Typography>
                          )}
                          {/* 월지출 연결 상태 */}
                          {!item.id.startsWith('temp_') && (
                            <Box sx={{ mt: 0.5 }}>
                              {getLoanLinkedExpense(item.id) ? (
                                <Chip
                                  icon={<LinkIcon />}
                                  label="월지출 연결됨"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              ) : (
                                <Chip
                                  label="월지출 미연결"
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* 버튼 영역 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenEditSheet(item)} sx={{ mr: 0.5 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteItem(item.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {/* 대출 탭: 항목별 월지출 자동계산 버튼 */}
                      {isLoanTab && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CalculateIcon fontSize="small" />}
                          onClick={() => handleLoanAutoCalculate(item)}
                          sx={{ fontSize: '0.65rem', py: 0.3, px: 0.8, whiteSpace: 'nowrap' }}
                        >
                          월지출 자동계산
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* FAB 버튼 */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenAddSheet}
        sx={{ position: 'fixed', bottom: 160, right: 16, zIndex: 101 }}
      >
        <AddIcon />
      </Fab>

      {/* 하단 고정 영역: 총액 + 저장 버튼 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          zIndex: 100,
        }}
      >
        <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              총 {currentConfig.label}
            </Typography>
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
              {formatAmount(currentTotal)}원
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 2, pb: 8 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            onClick={handleSubmit}
            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '저장'}
          </Button>
        </Box>
      </Box>

      {/* 월지출 자동 등록 Confirm 다이얼로그 */}
      <Dialog open={showExpenseConfirm} onClose={handleCancelExpenseRegister}>
        <DialogTitle>월 지출 자동 등록</DialogTitle>
        <DialogContent>
          <DialogContentText>
            월 지출도 등록하시겠습니까?
            <br />
            <Typography variant="caption" color="text.secondary">
              대출 정보를 기반으로 월 상환액을 계산하여 월지출로 자동 등록합니다.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelExpenseRegister} color="inherit" disabled={expenseRegisterLoading}>
            취소
          </Button>
          <Button
            onClick={handleConfirmExpenseRegister}
            variant="contained"
            disabled={expenseRegisterLoading}
            startIcon={expenseRegisterLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 바텀시트 (항목 추가/수정) */}
      <Drawer
        anchor="bottom"
        open={sheetOpen}
        onClose={handleCloseSheet}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* 시트 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {sheetMode === 'add' ? currentConfig.addLabel : `${currentConfig.label} 수정`}
            </Typography>
            <IconButton onClick={handleCloseSheet} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 입력 폼 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>이름</Typography>
            <TextField
              fullWidth
              placeholder={`예: ${currentConfig.key === 'assets' ? '예금, 주식, 부동산' : currentConfig.key === 'loans' ? '주택담보대출, 신용대출' : currentConfig.key === 'monthlyIncome' ? '급여, 부업' : '생활비, 보험료'}`}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>금액 (원)</Typography>
            <TextField
              fullWidth
              placeholder="0"
              value={inputAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              inputProps={{ inputMode: 'numeric' }}
              error={!!errors.amount}
              helperText={errors.amount}
              sx={{ mb: currentConfig.key === 'loans' ? 2 : 0 }}
            />

            {/* 대출 탭 전용 필드 */}
            {currentConfig.key === 'loans' && (
              <>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>금리 (%)</Typography>
                <TextField
                  fullWidth
                  placeholder="예: 3.5"
                  value={inputInterestRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) setInputInterestRate(val);
                  }}
                  inputProps={{ inputMode: 'decimal' }}
                  error={!!errors.interestRate}
                  helperText={errors.interestRate}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>상환 유형</Typography>
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.repaymentType}>
                  <Select
                    value={inputRepaymentType}
                    onChange={(e) => setInputRepaymentType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>상환 유형 선택</MenuItem>
                    {REPAYMENT_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                  {errors.repaymentType && <FormHelperText>{errors.repaymentType}</FormHelperText>}
                </FormControl>

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>대출유형</Typography>
                <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.loanType}>
                  <Select
                    value={inputLoanType}
                    onChange={(e) => setInputLoanType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>대출유형 선택</MenuItem>
                    {LOAN_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                  {errors.loanType && <FormHelperText>{errors.loanType}</FormHelperText>}
                </FormControl>

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>대출실행 금액 (원)</Typography>
                <TextField
                  fullWidth
                  placeholder="0"
                  value={inputExecutedAmount}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    setInputExecutedAmount(numericValue ? formatAmount(parseInt(numericValue, 10)) : '');
                  }}
                  inputProps={{ inputMode: 'numeric' }}
                  error={!!errors.executedAmount}
                  helperText={errors.executedAmount}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>상환기간 (개월)</Typography>
                <TextField
                  fullWidth
                  placeholder="예: 360"
                  value={inputRepaymentPeriod}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setInputRepaymentPeriod(e.target.value);
                  }}
                  inputProps={{ inputMode: 'numeric' }}
                  error={!!errors.repaymentPeriod}
                  helperText={errors.repaymentPeriod}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>거치기간 (개월)</Typography>
                <TextField
                  fullWidth
                  placeholder="예: 12"
                  value={inputGracePeriod}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setInputGracePeriod(e.target.value);
                  }}
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>만기일</Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={inputExpirationDate}
                  onChange={(e) => setInputExpirationDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.expirationDate}
                  helperText={errors.expirationDate}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inputIsExcludingCalculation}
                        onChange={(e) => setInputIsExcludingCalculation(e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>지출계산 제외</Typography>
                        <Typography variant="caption" color="text.secondary">
                          DSR 계산 시 이 대출을 제외합니다
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </>
            )}
          </Box>

          {/* 저장 버튼 */}
          <Button variant="contained" size="large" fullWidth onClick={handleSaveItem} sx={{ py: 1.5 }}>
            {sheetMode === 'add' ? '추가' : '수정'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SelfAssetInput;
