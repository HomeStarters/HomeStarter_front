import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Calculate as CalculateIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import {
  housingApi,
  type HousingResponse,
  type HousingType,
  type TransportType,
  type SunlightLevel,
  type NoiseLevel,
  REGION_CODE_LABELS,
} from '../../services/housing/housingApi';
import { calculatorApi, type CalculationRequest } from '../../services/calculator/calculatorApi';
import { loanApi, type LoanProduct } from '../../services/loan/loanApi';
import { householdApi } from '../../services/household/householdApi';
import type { HouseholdMember } from '../../types/household.types';

// 주택 유형 라벨
const HOUSING_TYPE_LABELS: Record<HousingType, string> = {
  APARTMENT: '아파트',
  OFFICETEL: '오피스텔',
  VILLA: '빌라',
  HOUSE: '주택',
};

// 교통수단 유형 라벨
const TRANSPORT_TYPE_LABELS: Record<TransportType, string> = {
  SUBWAY: '지하철',
  BUS: '버스',
  TRAIN: '기차',
};

// 채광 레벨 라벨
const SUNLIGHT_LABELS: Record<SunlightLevel, string> = {
  VERY_GOOD: '매우 좋음',
  GOOD: '좋음',
  AVERAGE: '보통',
  POOR: '나쁨',
};

// 소음 레벨 라벨
const NOISE_LABELS: Record<NoiseLevel, string> = {
  VERY_QUIET: '매우 조용',
  QUIET: '조용',
  NORMAL: '보통',
  NOISY: '시끄러움',
};

// 금액 포맷 함수
const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

const HousingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [housing, setHousing] = useState<HousingResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);

  // 계산하기 다이얼로그 상태
  const [calcDialogOpen, setCalcDialogOpen] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [loanProductsLoading, setLoanProductsLoading] = useState(false);
  const [selectedLoanProductId, setSelectedLoanProductId] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('360');

  // 가구원 관련 상태
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // 주택 상세 정보 로드
  const loadHousingDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await housingApi.getHousing(Number(id));
      if (response.success && response.data) {
        setHousing(response.data);
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '주택 정보를 불러오는데 실패했습니다',
          severity: 'error',
        })
      );
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, dispatch, navigate]);

  // 대출상품 목록 로드
  const loadLoanProducts = useCallback(async () => {
    try {
      setLoanProductsLoading(true);
      const response = await loanApi.getLoans({ size: 100 });
      if (response.success && response.data?.content) {
        setLoanProducts(response.data.content.filter((l) => l.active));
      }
    } catch (error) {
      console.error('대출상품 목록 로드 실패:', error);
      // 대출상품 로드 실패는 조용히 처리 (계산하기 다이얼로그에서 에러 메시지 표시)
    } finally {
      setLoanProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHousingDetail();
  }, [loadHousingDetail]);

  // 수정 버튼 클릭 핸들러
  const handleEdit = () => {
    navigate(`/housings/new?editId=${id}`);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      const response = await housingApi.deleteHousing(Number(id));
      if (response) {
        alert('주택이 삭제되었습니다');
        navigate('/dashboard');
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '주택 삭제 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // 최종목표 설정 토글 핸들러
  const handleGoalToggle = async () => {
    if (!id || !housing) return;

    try {
      setGoalLoading(true);
      const response = await housingApi.setGoalHousing(Number(id));
      if (response.success) {
        alert(response.data?.message || '최종목표 주택이 설정되었습니다');
        // 상태 업데이트
        setHousing({ ...housing, isGoal: !housing.isGoal });
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '최종목표 설정 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
    } finally {
      setGoalLoading(false);
    }
  };

  // 가구원 목록 로드 (본인 제외)
  const loadHouseholdMembers = useCallback(async () => {
    try {
      const response = await householdApi.getMembers();
      if (response.success && response.data?.members) {
        const others = response.data.members.filter(
          (m) => m.userId !== currentUser?.userId
        );
        setHouseholdMembers(others);
        // 기본적으로 모든 가구원 선택
        setSelectedMemberIds(others.map((m) => m.userId));
      }
    } catch (error) {
      console.error('가구원 목록 로드 실패:', error);
    }
  }, [currentUser?.userId]);

  // 가구원 선택 토글
  const handleMemberToggle = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // 계산하기 다이얼로그 열기
  const handleOpenCalcDialog = () => {
    loadLoanProducts();
    loadHouseholdMembers();
    setCalcDialogOpen(true);
  };

  // 계산하기 다이얼로그 닫기
  const handleCloseCalcDialog = () => {
    setCalcDialogOpen(false);
    setSelectedLoanProductId('');
    setLoanAmount('');
    setLoanTerm('360');
    setSelectedMemberIds([]);
  };

  // 계산하기 실행
  const handleCalculate = async () => {
    if (!id || !selectedLoanProductId || !loanAmount || !loanTerm) {
      dispatch(
        openSnackbar({
          message: '모든 필수 항목을 입력해주세요',
          severity: 'warning',
        })
      );
      return;
    }

    try {
      setCalcLoading(true);
      if (confirm("계산 하시겠습니까?")) {
        const requestData: CalculationRequest = {
          housingId: id,
          loanProductId: selectedLoanProductId,
          loanAmount: parseInt(loanAmount.replace(/,/g, ''), 10),
          loanTerm: parseInt(loanTerm, 10),
          householdMemberIds: selectedMemberIds,
        };

        const response = await calculatorApi.calculateHousingExpenses(requestData);
        if (response) {
          alert('계산이 완료되었습니다');
          handleCloseCalcDialog();
          // 계산결과 목록 조회 화면으로 이동
          navigate(`/calculator/results`);
        }
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '지출 계산 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
    } finally {
      setCalcLoading(false);
    }
  };

  // 금액 입력 핸들러
  const handleLoanAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setLoanAmount(parseInt(numericValue, 10).toLocaleString('ko-KR'));
    } else {
      setLoanAmount('');
    }
  };

  if (loading) {
    return <Loading message="주택 정보를 불러오는 중..." />;
  }

  if (!housing) {
    return null;
  }

  return (
    <Box sx={{ pb: 18 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          주택 상세정보
        </Typography>
      </Box>

      {/* 주택 이름 및 최종목표 표시 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {housing.housingName}
          </Typography>
          <Chip
            label={HOUSING_TYPE_LABELS[housing.housingType]}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
        {housing.isGoal && (
          <Chip
            icon={<StarIcon />}
            label="최종목표"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {/* 가격 */}
      <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
        {formatCurrency(housing.price)}
      </Typography>

      {/* 기본정보 섹션 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            기본정보
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">위치</Typography>
              <Typography sx={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
                {typeof housing.address === 'string' ? housing.address : housing.address?.fullAddress || '-'}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">지역 구분</Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {housing.regionalCharacteristic?.regionCode ? REGION_CODE_LABELS[housing.regionalCharacteristic.regionCode] || housing.regionalCharacteristic.regionCode : '-'}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">입주희망년월</Typography>
              <Typography sx={{ fontWeight: 500 }}>{housing.moveInDate || '-'}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">준공년월</Typography>
              <Typography sx={{ fontWeight: 500 }}>{housing.completionDate || '-'}</Typography>
            </Box>
            {housing.complexInfo?.houseArea && (
              <>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">면적</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{housing.complexInfo.houseArea}㎡</Typography>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 교통정보 섹션 */}
      {housing.transportations && housing.transportations.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              교통정보
            </Typography>
            {housing.transportations.map((transport, index) => (
              <Box key={transport.id || index} sx={{ mb: index < housing.transportations!.length - 1 ? 3 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={TRANSPORT_TYPE_LABELS[transport.transportType]}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Typography sx={{ fontWeight: 600 }}>
                    {transport.lineName ? `${transport.lineName} ` : ''}
                    {transport.stationName}
                  </Typography>
                </Box>
                {transport.commuteTime && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell align="center">출근 (9시 전)</TableCell>
                          <TableCell align="center">퇴근 (6시 후)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>본인</TableCell>
                          <TableCell align="center">
                            {transport.commuteTime.selfBefore9am ? `${transport.commuteTime.selfBefore9am}분` : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {transport.commuteTime.selfAfter6pm ? `${transport.commuteTime.selfAfter6pm}분` : '-'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>배우자</TableCell>
                          <TableCell align="center">
                            {transport.commuteTime.spouseBefore9am ? `${transport.commuteTime.spouseBefore9am}분` : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {transport.commuteTime.spouseAfter6pm ? `${transport.commuteTime.spouseAfter6pm}분` : '-'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 단지정보 섹션 */}
      {housing.complexInfo && (housing.complexInfo.totalDong || housing.complexInfo.totalHouseholds) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              단지정보
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {housing.complexInfo.totalDong && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">단지 수</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{housing.complexInfo.totalDong}개</Typography>
                  </Box>
                  <Divider />
                </>
              )}
              {housing.complexInfo.totalHouseholds && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">총 세대수</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{housing.complexInfo.totalHouseholds}세대</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 주거환경 섹션 */}
      {housing.livingEnvironment && (housing.livingEnvironment.sunlightLevel || housing.livingEnvironment.noiseLevel) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              주거환경
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {housing.livingEnvironment.sunlightLevel && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">채광</Typography>
                    <Typography sx={{ fontWeight: 500 }}>
                      {SUNLIGHT_LABELS[housing.livingEnvironment.sunlightLevel]}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}
              {housing.livingEnvironment.noiseLevel && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">소음</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {NOISE_LABELS[housing.livingEnvironment.noiseLevel]}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 최종목표 설정 토글 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              최종목표 주택 설정
            </Typography>
            <Typography variant="body2" color="text.secondary">
              장기주거 로드맵의 목표로 설정합니다
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={housing.isGoal}
                onChange={handleGoalToggle}
                disabled={goalLoading}
                color="warning"
              />
            }
            label=""
          />
        </CardContent>
      </Card>

      {/* 하단 고정 버튼 영역 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          pb: 8,
          bgcolor: 'background.paper',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          zIndex: 100,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ flex: 1 }}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ flex: 1 }}
          >
            삭제
          </Button>
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<CalculateIcon />}
          onClick={handleOpenCalcDialog}
          sx={{ py: 1.5, fontWeight: 600 }}
        >
          계산하기
        </Button>
      </Box>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>주택 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            "{housing.housingName}"을(를) 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            삭제된 데이터는 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            취소
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 계산하기 다이얼로그 */}
      <Dialog
        open={calcDialogOpen}
        onClose={handleCloseCalcDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          입주 후 지출 계산
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            대출상품을 선택하고 대출 정보를 입력하여 입주 후 지출을 계산합니다.
          </Typography>

          {/* 가구원 선택 */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PeopleIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                계산 참여 가구원
              </Typography>
            </Box>
            {householdMembers.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 1 }}>
                <List dense disablePadding>
                  {householdMembers.map((member) => (
                    <ListItem
                      key={member.userId}
                      disablePadding
                      sx={{ px: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={selectedMemberIds.includes(member.userId)}
                          onChange={() => handleMemberToggle(member.userId)}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={member.name}
                        secondary={member.role === 'OWNER' ? '가구장' : '가구원'}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                등록된 가구원이 없습니다
              </Typography>
            )}
          </Box>

          {/* 대출상품 선택 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>대출상품 선택 *</InputLabel>
            <Select
              value={selectedLoanProductId}
              label="대출상품 선택 *"
              onChange={(e) => setSelectedLoanProductId(e.target.value)}
              disabled={loanProductsLoading}
            >
              {loanProductsLoading ? (
                <MenuItem value="">로딩 중...</MenuItem>
              ) : loanProducts.length === 0 ? (
                <MenuItem value="">대출상품이 없습니다</MenuItem>
              ) : (
                loanProducts.map((loan) => (
                  <MenuItem key={loan.id} value={String(loan.id)}>
                    {loan.name} (금리 {loan.interestRate}%)
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* 대출금액 */}
          <TextField
            fullWidth
            label="대출금액 *"
            placeholder="0"
            value={loanAmount}
            onChange={(e) => handleLoanAmountChange(e.target.value)}
            InputProps={{
              endAdornment: <Typography color="text.secondary">원</Typography>,
            }}
            inputProps={{ inputMode: 'numeric' }}
            sx={{ mb: 3 }}
          />

          {/* 대출기간 */}
          <FormControl fullWidth>
            <InputLabel>대출기간 *</InputLabel>
            <Select
              value={loanTerm}
              label="대출기간 *"
              onChange={(e) => setLoanTerm(e.target.value)}
            >
              <MenuItem value="120">10년 (120개월)</MenuItem>
              <MenuItem value="180">15년 (180개월)</MenuItem>
              <MenuItem value="240">20년 (240개월)</MenuItem>
              <MenuItem value="300">25년 (300개월)</MenuItem>
              <MenuItem value="360">30년 (360개월)</MenuItem>
              <MenuItem value="420">35년 (420개월)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCalcDialog} disabled={calcLoading}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleCalculate}
            disabled={calcLoading || !selectedLoanProductId || !loanAmount}
            startIcon={calcLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
          >
            계산하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HousingDetail;
