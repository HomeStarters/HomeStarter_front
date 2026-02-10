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
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
// Checkbox와 FormControlLabel은 이미 import됨
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { openSnackbar } from '../../store/slices/uiSlice';
import { assetApi, type AssetItem, type AssetUpdateRequest } from '../../services/asset/assetApi';

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

// 금액 포맷 함수
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

// 금액 파싱 함수 (콤마 제거)
const parseAmount = (value: string): number => {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
};

const SpouseAssetInput = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // 배우자 없음 체크박스 상태
  const [noSpouse, setNoSpouse] = useState(false);

  // Asset ID (API에서 조회된 자산 정보의 고유 ID)
  const [assetId, setAssetId] = useState<number | null>(null);

  // 자산 데이터
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loans, setLoans] = useState<AssetItem[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<AssetItem[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState<AssetItem[]>([]);

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

  // 기존 배우자 자산정보 로드 (GET /api/v1/assets?ownerType=SPOUSE)
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await assetApi.getAssets();
        if (response && response.assets) {
          // assets 배열에서 ownerType이 'SPOUSE'인 데이터 찾기
          const spouseData = response.assets.find(
            (asset: { ownerType?: string }) => asset.ownerType === 'SPOUSE'
          );

          if (spouseData) {
            // Asset ID 저장
            if (spouseData.assetId) {
              setAssetId(spouseData.assetId);
            }
            setAssets(spouseData.assets || []);
            setLoans(spouseData.loans || []);
            setMonthlyIncome(spouseData.monthlyIncomes || []);
            setMonthlyExpense(spouseData.monthlyExpenses || []);

            // 모든 데이터가 비어있으면 배우자 없음으로 간주하지 않음
            // (사용자가 명시적으로 체크해야 함)
          }
        }
      } catch (error) {
        console.error('배우자 자산정보 로드 실패:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadAssets();
  }, []);

  // 배우자 없음 체크박스 변경 핸들러
  const handleNoSpouseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setNoSpouse(checked);

    if (checked) {
      // 배우자 없음 선택 시 모든 데이터 초기화
      setAssets([]);
      setLoans([]);
      setMonthlyIncome([]);
      setMonthlyExpense([]);
    }
  };

  // 현재 탭의 데이터 가져오기
  const getCurrentData = (): AssetItem[] => {
    switch (TAB_CONFIG[activeTab].key) {
      case 'assets':
        return assets;
      case 'loans':
        return loans;
      case 'monthlyIncome':
        return monthlyIncome;
      case 'monthlyExpense':
        return monthlyExpense;
      default:
        return [];
    }
  };

  // 현재 탭의 데이터 설정하기
  const setCurrentData = (data: AssetItem[]) => {
    switch (TAB_CONFIG[activeTab].key) {
      case 'assets':
        setAssets(data);
        break;
      case 'loans':
        setLoans(data);
        break;
      case 'monthlyIncome':
        setMonthlyIncome(data);
        break;
      case 'monthlyExpense':
        setMonthlyExpense(data);
        break;
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
  };

  // 항목 저장 (추가/수정)
  const handleSaveItem = () => {
    if (!inputName.trim() || !inputAmount) {
      dispatch(
        openSnackbar({
          message: '이름과 금액을 입력해주세요',
          severity: 'warning',
        })
      );
      return;
    }

    const amount = parseAmount(inputAmount);
    const currentData = getCurrentData();

    const isLoanTab = TAB_CONFIG[activeTab].key === 'loans';

    if (sheetMode === 'add') {
      // 새 항목 추가
      const newItem: AssetItem = {
        id: `temp_${Date.now()}`,
        name: inputName.trim(),
        amount,
        ...(isLoanTab && {
          interestRate: inputInterestRate ? parseFloat(inputInterestRate) : undefined,
          repaymentType: inputRepaymentType || undefined,
          expirationDate: inputExpirationDate || undefined,
          isExcludingCalculation: inputIsExcludingCalculation,
        }),
      };
      setCurrentData([...currentData, newItem]);
    } else if (sheetMode === 'edit' && editingItem) {
      // 기존 항목 수정
      const updatedData = currentData.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: inputName.trim(),
              amount,
              ...(isLoanTab && {
                interestRate: inputInterestRate ? parseFloat(inputInterestRate) : undefined,
                repaymentType: inputRepaymentType || undefined,
                expirationDate: inputExpirationDate || undefined,
                isExcludingCalculation: inputIsExcludingCalculation,
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
    try {
      const assetType = TAB_CONFIG[activeTab].key;
      await assetApi.deleteAssetItem(assetType, itemId);

      // 성공하면 로컬 상태 업데이트
      const currentData = getCurrentData();
      const updatedData = currentData.filter((item) => item.id !== itemId);
      setCurrentData(updatedData);

      dispatch(
        openSnackbar({
          message: '항목이 삭제되었습니다',
          severity: 'success',
        })
      );
    } catch (error) {
      console.error('항목 삭제 실패:', error);
      dispatch(
        openSnackbar({
          message: '항목 삭제 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
    }
  };

  // 금액 입력 핸들러 (숫자만 허용, 콤마 포맷)
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
      // 배우자 없음인 경우 빈 데이터로 저장
      const requestData: AssetUpdateRequest = noSpouse
        ? {
            assets: [],
            loans: [],
            monthlyIncomes: [],
            monthlyExpenses: [],
          }
        : {
            assets,
            loans,
            monthlyIncomes: monthlyIncome,
            monthlyExpenses: monthlyExpense,
          };

      let response;

      if (assetId) {
        // 기존 자산정보가 있으면 수정 API 호출
        response = await assetApi.updateAssets(assetId, requestData);
      } else {
        // 기존 자산정보가 없으면 직접 입력 API 호출
        if (!user?.userId) {
          dispatch(
            openSnackbar({
              message: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
              severity: 'error',
            })
          );
          setLoading(false);
          return;
        }
        response = await assetApi.createAssetsByUserId(user.userId, 'SPOUSE', requestData);
      }

      if (response) {
        alert('저장되었습니다');

        // 대시보드로 이동
        navigate('/dashboard');
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '자산정보 저장 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
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

  return (
    <Box sx={{ pb: 18 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          배우자 자산정보 입력
        </Typography>
        <Typography variant="body2" color="text.secondary">
          배우자의 자산, 대출, 월소득, 월지출을 입력해주세요
        </Typography>
      </Box>

      {/* 배우자 없음 체크박스 */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          bgcolor: 'grey.100',
          borderRadius: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={noSpouse}
              onChange={handleNoSpouseChange}
              color="primary"
            />
          }
          label="배우자 없음 (입력 건너뛰기)"
          sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
        />
      </Box>

      {/* 배우자 있음일 때만 입력 영역 표시 */}
      {!noSpouse && (
        <>
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
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddSheet}
                >
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                            {formatAmount(item.amount)}원
                          </Typography>
                          {TAB_CONFIG[activeTab].key === 'loans' && (
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
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditSheet(item)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem(item.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
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
            sx={{
              position: 'fixed',
              bottom: 160,
              right: 16,
              zIndex: 101,
            }}
          >
            <AddIcon />
          </Fab>
        </>
      )}

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
        {/* 총액 표시 (배우자 있음일 때만) */}
        {!noSpouse && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'grey.100',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                총 {currentConfig.label}
              </Typography>
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                {formatAmount(currentTotal)}원
              </Typography>
            </Box>
          </Box>
        )}

        {/* 저장 버튼 */}
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
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              이름
            </Typography>
            <TextField
              fullWidth
              placeholder={`예: ${currentConfig.key === 'assets' ? '예금, 주식, 부동산' : currentConfig.key === 'loans' ? '주택담보대출, 신용대출' : currentConfig.key === 'monthlyIncome' ? '급여, 부업' : '생활비, 보험료'}`}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              금액 (원)
            </Typography>
            <TextField
              fullWidth
              placeholder="0"
              value={inputAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              inputProps={{ inputMode: 'numeric' }}
              sx={{ mb: currentConfig.key === 'loans' ? 2 : 0 }}
            />

            {/* 대출 탭 전용 필드 */}
            {currentConfig.key === 'loans' && (
              <>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  금리 (%)
                </Typography>
                <TextField
                  fullWidth
                  placeholder="예: 3.5"
                  value={inputInterestRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) {
                      setInputInterestRate(val);
                    }
                  }}
                  inputProps={{ inputMode: 'decimal' }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  상환 유형
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={inputRepaymentType}
                    onChange={(e) => setInputRepaymentType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      상환 유형 선택
                    </MenuItem>
                    {REPAYMENT_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  만기일
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={inputExpirationDate}
                  onChange={(e) => setInputExpirationDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
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
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          지출계산 제외
                        </Typography>
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
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSaveItem}
            sx={{ py: 1.5 }}
          >
            {sheetMode === 'add' ? '추가' : '수정'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SpouseAssetInput;
