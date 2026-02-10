import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import {
  housingApi,
  type HousingType,
  type TransportType,
  type TransportationRequest,
  type SunlightLevel,
  type NoiseLevel,
  type HousingCreateRequest,
  type HousingUpdateRequest,
  type RegionCode,
} from '../../services/housing/housingApi';
import Loading from '../../components/common/Loading';

// 주택 유형 옵션
const HOUSING_TYPE_OPTIONS: { value: HousingType; label: string }[] = [
  { value: 'APARTMENT', label: '아파트' },
  { value: 'OFFICETEL', label: '오피스텔' },
  { value: 'VILLA', label: '빌라' },
  { value: 'HOUSE', label: '주택' },
];

// 교통수단 유형 옵션
const TRANSPORT_TYPE_OPTIONS: { value: TransportType; label: string }[] = [
  { value: 'SUBWAY', label: '지하철' },
  { value: 'BUS', label: '버스' },
  { value: 'TRAIN', label: '기차' },
];

// 채광 레벨 옵션
const SUNLIGHT_OPTIONS: { value: SunlightLevel; label: string }[] = [
  { value: 'VERY_GOOD', label: '매우 좋음' },
  { value: 'GOOD', label: '좋음' },
  { value: 'AVERAGE', label: '보통' },
  { value: 'POOR', label: '나쁨' },
];

// 소음 레벨 옵션
const NOISE_OPTIONS: { value: NoiseLevel; label: string }[] = [
  { value: 'VERY_QUIET', label: '매우 조용' },
  { value: 'QUIET', label: '조용' },
  { value: 'NORMAL', label: '보통' },
  { value: 'NOISY', label: '시끄러움' },
];

// 지역 코드 옵션
const REGION_CODE_OPTIONS: { value: RegionCode; label: string }[] = [
  { value: 'OHA', label: '투기과열지구' },
  { value: 'LTPZ', label: '토지거래허가구역' },
  { value: 'AA', label: '조정대상지역' },
  { value: 'G', label: '비규제지역' },
];

// 금액 포맷 함수
const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

// 금액 파싱 함수
const parseAmount = (value: string): number => {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
};

// 기본정보 폼 데이터
interface BasicFormData {
  housingType: HousingType | '';
  moveInDate: string;
  housingName: string;
  address: string;
  regionCode: RegionCode;
  completionDate: string;
  price: string;
  houseArea: string;
}

// 상세정보 폼 데이터
interface DetailFormData {
  transportations: TransportationRequest[];
  complexCount: string;
  totalHouseholds: string;
  sunlightLevel: SunlightLevel | '';
  noiseLevel: NoiseLevel | '';
}

// 교통정보 입력 폼 데이터
interface TransportFormData {
  transportType: TransportType | '';
  lineName: string;
  stationName: string;
  selfBefore9am: string;
  selfAfter6pm: string;
  spouseBefore9am: string;
  spouseAfter6pm: string;
}

const HousingInput = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const isEditMode = !!editId;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  // 기본정보 상태
  const [basicForm, setBasicForm] = useState<BasicFormData>({
    housingType: '',
    moveInDate: '',
    housingName: '',
    address: '',
    regionCode: '',
    completionDate: '',
    price: '',
    houseArea: '',
  });

  // 상세정보 상태
  const [detailForm, setDetailForm] = useState<DetailFormData>({
    transportations: [],
    complexCount: '',
    totalHouseholds: '',
    sunlightLevel: '',
    noiseLevel: '',
  });

  // 수정 모드일 때 기존 데이터 로드
  const loadHousingData = useCallback(async () => {
    if (!editId) return;

    try {
      setPageLoading(true);
      const response = await housingApi.getHousing(Number(editId));
      if (response.success && response.data) {
        const housing = response.data;
        console.log(response);

        // 기본정보 세팅
        setBasicForm({
          housingType: housing.housingType,
          moveInDate: housing.moveInDate || '',
          housingName: housing.housingName,
          address: typeof housing.address === 'string' ? housing.address : housing.address?.fullAddress || '',
          regionCode: housing.regionalCharacteristic?.regionCode || '',
          completionDate: housing.completionDate || '',
          price: housing.price ? formatAmount(housing.price) : '',
          houseArea: housing.complexInfo?.houseArea?.toString() || '',
        });

        // 상세정보 세팅
        setDetailForm({
          transportations: housing.transportations?.map((t) => ({
            transportType: t.transportType,
            lineName: t.lineName,
            stationName: t.stationName,
            distance: t.distance,
            walkingTime: t.walkingTime,
            commuteTime: t.commuteTime,
          })) || [],
          complexCount: housing.complexInfo?.totalDong?.toString() || '',
          totalHouseholds: housing.complexInfo?.totalHouseholds?.toString() || '',
          sunlightLevel: housing.livingEnvironment?.sunlightLevel || '',
          noiseLevel: housing.livingEnvironment?.noiseLevel || '',
        });
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
      setPageLoading(false);
    }
  }, [editId, dispatch, navigate]);

  useEffect(() => {
    if (isEditMode) {
      loadHousingData();
    }
  }, [isEditMode, loadHousingData]);

  // 상세정보 다이얼로그 상태
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 교통정보 바텀시트 상태
  const [transportSheetOpen, setTransportSheetOpen] = useState(false);
  const [editingTransportIndex, setEditingTransportIndex] = useState<number | null>(null);
  const [transportForm, setTransportForm] = useState<TransportFormData>({
    transportType: '',
    lineName: '',
    stationName: '',
    selfBefore9am: '',
    selfAfter6pm: '',
    spouseBefore9am: '',
    spouseAfter6pm: '',
  });

  // 기본정보 입력 핸들러
  const handleBasicChange = (field: keyof BasicFormData, value: string) => {
    if (field === 'price') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setBasicForm((prev) => ({
        ...prev,
        [field]: numericValue ? formatAmount(parseInt(numericValue, 10)) : '',
      }));
    } else {
      setBasicForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // 상세정보 입력 핸들러
  const handleDetailChange = (field: keyof DetailFormData, value: string) => {
    setDetailForm((prev) => ({ ...prev, [field]: value }));
  };

  // 교통정보 추가 시트 열기
  const handleOpenTransportSheet = (index: number | null = null) => {
    if (index !== null) {
      const transport = detailForm.transportations[index];
      setTransportForm({
        transportType: transport.transportType,
        lineName: transport.lineName || '',
        stationName: transport.stationName,
        selfBefore9am: transport.commuteTime?.selfBefore9am?.toString() || '',
        selfAfter6pm: transport.commuteTime?.selfAfter6pm?.toString() || '',
        spouseBefore9am: transport.commuteTime?.spouseBefore9am?.toString() || '',
        spouseAfter6pm: transport.commuteTime?.spouseAfter6pm?.toString() || '',
      });
      setEditingTransportIndex(index);
    } else {
      setTransportForm({
        transportType: '',
        lineName: '',
        stationName: '',
        selfBefore9am: '',
        selfAfter6pm: '',
        spouseBefore9am: '',
        spouseAfter6pm: '',
      });
      setEditingTransportIndex(null);
    }
    setTransportSheetOpen(true);
  };

  // 교통정보 시트 닫기
  const handleCloseTransportSheet = () => {
    setTransportSheetOpen(false);
    setEditingTransportIndex(null);
  };

  // 교통정보 저장
  const handleSaveTransport = () => {
    if (!transportForm.transportType || !transportForm.stationName) {
      dispatch(
        openSnackbar({
          message: '교통수단 유형과 역/정류장명을 입력해주세요',
          severity: 'warning',
        })
      );
      return;
    }

    const newTransport: TransportationRequest = {
      transportType: transportForm.transportType as TransportType,
      lineName: transportForm.lineName || undefined,
      stationName: transportForm.stationName,
      commuteTime: {
        selfBefore9am: transportForm.selfBefore9am ? parseInt(transportForm.selfBefore9am, 10) : undefined,
        selfAfter6pm: transportForm.selfAfter6pm ? parseInt(transportForm.selfAfter6pm, 10) : undefined,
        spouseBefore9am: transportForm.spouseBefore9am ? parseInt(transportForm.spouseBefore9am, 10) : undefined,
        spouseAfter6pm: transportForm.spouseAfter6pm ? parseInt(transportForm.spouseAfter6pm, 10) : undefined,
      },
    };

    setDetailForm((prev) => {
      const updatedTransportations = [...prev.transportations];
      if (editingTransportIndex !== null) {
        updatedTransportations[editingTransportIndex] = newTransport;
      } else {
        updatedTransportations.push(newTransport);
      }
      return { ...prev, transportations: updatedTransportations };
    });

    handleCloseTransportSheet();
  };

  // 교통정보 삭제
  const handleDeleteTransport = (index: number) => {
    setDetailForm((prev) => ({
      ...prev,
      transportations: prev.transportations.filter((_, i) => i !== index),
    }));
  };

  // 기본정보 유효성 검사
  const isBasicFormValid = (): boolean => {
    return (
      basicForm.housingType !== '' &&
      basicForm.moveInDate !== '' &&
      basicForm.housingName.trim().length > 0 &&
      basicForm.address.trim().length > 0 &&
      basicForm.completionDate !== '' &&
      basicForm.price !== ''
    );
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!isBasicFormValid()) {
      dispatch(
        openSnackbar({
          message: '필수 항목을 모두 입력해주세요',
          severity: 'warning',
        })
      );
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && editId) {
        // 수정 모드
        const requestData: HousingUpdateRequest = {
          housingName: basicForm.housingName.trim(),
          housingType: basicForm.housingType as HousingType,
          price: parseAmount(basicForm.price),
          moveInDate: basicForm.moveInDate,
          completionDate: basicForm.completionDate,
          address: basicForm.address.trim(),
          regionCode: basicForm.regionCode || undefined,
          complexInfo: {
            houseArea: basicForm.houseArea ? parseFloat(basicForm.houseArea) : undefined,
            totalHouseholds: detailForm.totalHouseholds ? parseInt(detailForm.totalHouseholds, 10) : undefined,
            totalDong: detailForm.complexCount ? parseInt(detailForm.complexCount, 10) : undefined,
          },
          livingEnvironment: {
            sunlightLevel: detailForm.sunlightLevel || undefined,
            noiseLevel: detailForm.noiseLevel || undefined,
          },
          transportations: detailForm.transportations.length > 0 ? detailForm.transportations : undefined,
        };

        const response = await housingApi.updateHousing(Number(editId), requestData);

        if (response.success) {
          alert('주택정보가 수정되었습니다');
          navigate(`/housings/${editId}`);
        }
      } else {
        // 생성 모드
        const requestData: HousingCreateRequest = {
          housingName: basicForm.housingName.trim(),
          housingType: basicForm.housingType as HousingType,
          price: parseAmount(basicForm.price),
          moveInDate: basicForm.moveInDate,
          completionDate: basicForm.completionDate,
          address: basicForm.address.trim(),
          regionCode: basicForm.regionCode || undefined,
          complexInfo: {
            houseArea: basicForm.houseArea ? parseFloat(basicForm.houseArea) : undefined,
            totalHouseholds: detailForm.totalHouseholds ? parseInt(detailForm.totalHouseholds, 10) : undefined,
            totalDong: detailForm.complexCount ? parseInt(detailForm.complexCount, 10) : undefined,
          },
          livingEnvironment: {
            sunlightLevel: detailForm.sunlightLevel || undefined,
            noiseLevel: detailForm.noiseLevel || undefined,
          },
          transportations: detailForm.transportations.length > 0 ? detailForm.transportations : undefined,
        };

        const response = await housingApi.createHousing(requestData);

        if (response.success) {
          alert('주택정보가 저장되었습니다');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: isEditMode ? '주택정보 수정 중 오류가 발생했습니다' : '주택정보 저장 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Loading message="주택 정보를 불러오는 중..." />;
  }

  return (
    <Box sx={{ pb: 18 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEditMode ? '주택 수정' : '주택 등록'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isEditMode ? '주택 정보를 수정해주세요' : '입주를 희망하는 주택 정보를 입력해주세요'}
        </Typography>
      </Box>

      {/* 기본정보 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            기본정보
          </Typography>

          {/* 주택유형 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              주택유형 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <ToggleButtonGroup
              value={basicForm.housingType}
              exclusive
              onChange={(_, value) => value && handleBasicChange('housingType', value)}
              fullWidth
            >
              {HOUSING_TYPE_OPTIONS.map((option) => (
                <ToggleButton key={option.value} value={option.value} sx={{ flex: 1, py: 1.5 }}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* 입주희망년월 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              입주희망년월 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              type="month"
              fullWidth
              value={basicForm.moveInDate}
              onChange={(e) => handleBasicChange('moveInDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* 주택이름 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              주택이름 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 래미안 강남 포레스트"
              value={basicForm.housingName}
              onChange={(e) => handleBasicChange('housingName', e.target.value)}
              inputProps={{ maxLength: 50 }}
              helperText={`${basicForm.housingName.length}/50`}
            />
          </Box>

          {/* 위치 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              위치 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 서울특별시 강남구 테헤란로 123"
              value={basicForm.address}
              onChange={(e) => handleBasicChange('address', e.target.value)}
            />
          </Box>

          {/* 지역 구분 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              지역 구분{' '}
              <Typography component="span" variant="body2" color="text.secondary">
                (LTV/DTI 계산용)
              </Typography>
            </Typography>
            <FormControl fullWidth>
              <Select
                value={basicForm.regionCode}
                onChange={(e) => handleBasicChange('regionCode', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">선택안함</MenuItem>
                {REGION_CODE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 준공년월 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              준공년월 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={basicForm.completionDate}
              onChange={(e) => handleBasicChange('completionDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* 가격 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              가격 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="0"
              value={basicForm.price}
              onChange={(e) => handleBasicChange('price', e.target.value)}
              InputProps={{
                endAdornment: <Typography color="text.secondary">원</Typography>,
              }}
              inputProps={{ inputMode: 'numeric' }}
            />
          </Box>

          {/* 면적 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              면적
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 84"
              value={basicForm.houseArea}
              onChange={(e) => handleBasicChange('houseArea', e.target.value)}
              InputProps={{
                endAdornment: <Typography color="text.secondary">m²</Typography>,
              }}
              inputProps={{ inputMode: 'decimal' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 상세정보 등록 버튼 */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setDetailDialogOpen(true)}
          sx={{ py: 1.5 }}
        >
          상세정보 등록 {detailForm.transportations.length > 0 && `(교통정보 ${detailForm.transportations.length}건)`}
        </Button>
      </Box>

      {/* 하단 고정 영역 */}
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
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!isBasicFormValid() || loading}
          onClick={handleSubmit}
          sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : isEditMode ? '수정' : '저장'}
        </Button>
      </Box>

      {/* 상세정보 다이얼로그 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            상세정보 등록
          </Typography>
          <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* 교통정보 섹션 */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                교통정보
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTransportSheet(null)}
              >
                추가
              </Button>
            </Box>

            {detailForm.transportations.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  교통정보를 추가해주세요
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {detailForm.transportations.map((transport, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {transport.lineName ? `${transport.lineName} ` : ''}
                            {transport.stationName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {TRANSPORT_TYPE_OPTIONS.find((o) => o.value === transport.transportType)?.label}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => handleOpenTransportSheet(index)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteTransport(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {transport.commuteTime && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
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
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* 단지정보 섹션 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              단지정보
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="단지 수"
                placeholder="예: 3"
                value={detailForm.complexCount}
                onChange={(e) => handleDetailChange('complexCount', e.target.value)}
                inputProps={{ inputMode: 'numeric' }}
              />
              <TextField
                fullWidth
                label="총 세대수"
                placeholder="예: 1000"
                value={detailForm.totalHouseholds}
                onChange={(e) => handleDetailChange('totalHouseholds', e.target.value)}
                inputProps={{ inputMode: 'numeric' }}
              />
            </Box>
          </Box>

          {/* 주거환경 섹션 */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              주거환경
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>채광</InputLabel>
                <Select
                  value={detailForm.sunlightLevel}
                  label="채광"
                  onChange={(e) => handleDetailChange('sunlightLevel', e.target.value)}
                >
                  <MenuItem value="">선택안함</MenuItem>
                  {SUNLIGHT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>소음</InputLabel>
              <Select
                value={detailForm.noiseLevel}
                label="소음"
                onChange={(e) => handleDetailChange('noiseLevel', e.target.value)}
              >
                <MenuItem value="">선택안함</MenuItem>
                {NOISE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" fullWidth onClick={() => setDetailDialogOpen(false)}>
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* 교통정보 바텀시트 */}
      <Drawer
        anchor="bottom"
        open={transportSheetOpen}
        onClose={handleCloseTransportSheet}
        sx={{
          zIndex: 1400, // Dialog(1300)보다 높게 설정하여 다이얼로그 위에 표시
        }}
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
              {editingTransportIndex !== null ? '교통정보 수정' : '교통정보 추가'}
            </Typography>
            <IconButton onClick={handleCloseTransportSheet} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 입력 폼 */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>교통수단 유형 *</InputLabel>
              <Select
                value={transportForm.transportType}
                label="교통수단 유형 *"
                onChange={(e) => setTransportForm((prev) => ({ ...prev, transportType: e.target.value as TransportType }))}
                MenuProps={{
                  sx: { zIndex: 1500 }, // Drawer(1400)보다 높게 설정
                }}
              >
                <MenuItem value="">선택안함</MenuItem>
                {TRANSPORT_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="노선명"
              placeholder="예: 2호선, 간선 152"
              value={transportForm.lineName}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, lineName: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="역/정류장명 *"
              placeholder="예: 강남역"
              value={transportForm.stationName}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, stationName: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              출퇴근 시간 (분)
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="본인 출근 (9시 전)"
                placeholder="0"
                value={transportForm.selfBefore9am}
                onChange={(e) => setTransportForm((prev) => ({ ...prev, selfBefore9am: e.target.value }))}
                inputProps={{ inputMode: 'numeric' }}
              />
              <TextField
                fullWidth
                label="본인 퇴근 (6시 후)"
                placeholder="0"
                value={transportForm.selfAfter6pm}
                onChange={(e) => setTransportForm((prev) => ({ ...prev, selfAfter6pm: e.target.value }))}
                inputProps={{ inputMode: 'numeric' }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="배우자 출근 (9시 전)"
                placeholder="0"
                value={transportForm.spouseBefore9am}
                onChange={(e) => setTransportForm((prev) => ({ ...prev, spouseBefore9am: e.target.value }))}
                inputProps={{ inputMode: 'numeric' }}
              />
              <TextField
                fullWidth
                label="배우자 퇴근 (6시 후)"
                placeholder="0"
                value={transportForm.spouseAfter6pm}
                onChange={(e) => setTransportForm((prev) => ({ ...prev, spouseAfter6pm: e.target.value }))}
                inputProps={{ inputMode: 'numeric' }}
              />
            </Box>
          </Box>

          {/* 저장 버튼 */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSaveTransport}
            sx={{ py: 1.5 }}
          >
            {editingTransportIndex !== null ? '수정' : '추가'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default HousingInput;
