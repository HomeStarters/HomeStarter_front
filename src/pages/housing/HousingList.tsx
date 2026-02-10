import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { housingApi, REGION_CODE_LABELS } from '../../services/housing/housingApi';
import type { HousingListItem, HousingType } from '../../services/housing/housingApi';

type FilterType = 'all' | HousingType;
type SortType = 'recent' | 'moveInDate' | 'priceHigh' | 'priceLow';

// 주택유형 라벨 매핑
const housingTypeLabel: Record<string, string> = {
  APARTMENT: '아파트',
  OFFICETEL: '오피스텔',
  VILLA: '빌라',
  HOUSE: '주택',
};

const HousingList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [allHousings, setAllHousings] = useState<HousingListItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalTargetId, setGoalTargetId] = useState<number | null>(null);

  // 전체 주택 목록을 한 번에 조회 (마운트 시만 호출)
  const loadAllHousings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await housingApi.getHousings({
        page: 0,
        size: 100,
        sort: 'createdAt',
        direction: 'DESC',
      });
      if (response.success && response.data?.housings) {
        setAllHousings(response.data.housings);
      }
    } catch (error) {
      console.error('주택 목록 로드 실패:', error);
      dispatch(
        openSnackbar({
          message: '주택 목록을 불러오는데 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadAllHousings();
  }, [loadAllHousings]);

  // 클라이언트 측 필터링 + 정렬
  const filteredHousings = useMemo(() => {
    let result = [...allHousings];

    // 필터링
    if (activeFilter !== 'all') {
      result = result.filter((h) => h.housingType === activeFilter);
    }

    // 정렬
    switch (sortType) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'priceHigh':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'priceLow':
        result.sort((a, b) => a.price - b.price);
        break;
    }

    return result;
  }, [allHousings, activeFilter, sortType]);

  // 필터 변경
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // 정렬 변경
  const handleSortChange = (sort: SortType) => {
    setSortType(sort);
  };

  // 카드 클릭 - 상세 페이지 이동
  const handleCardClick = (id: number) => {
    navigate(`/housings/${id}`);
  };

  // 삭제 다이얼로그 열기
  const handleDeleteClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      await housingApi.deleteHousing(deleteTargetId);
      dispatch(
        openSnackbar({
          message: '주택이 삭제되었습니다',
          severity: 'success',
        })
      );
      loadAllHousings();
    } catch (error) {
      console.error('주택 삭제 실패:', error);
      dispatch(
        openSnackbar({
          message: '주택 삭제에 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  // 최종목표 설정/해제
  const handleGoalClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setGoalTargetId(id);
    setGoalDialogOpen(true);
  };

  const handleGoalConfirm = async () => {
    if (!goalTargetId) return;

    try {
      await housingApi.setGoalHousing(goalTargetId);
      dispatch(
        openSnackbar({
          message: '최종목표가 설정되었습니다',
          severity: 'success',
        })
      );
      loadAllHousings();
    } catch (error) {
      console.error('최종목표 설정 실패:', error);
      dispatch(
        openSnackbar({
          message: '최종목표 설정에 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setGoalDialogOpen(false);
      setGoalTargetId(null);
    }
  };

  // 금액 포맷
  const formatCurrency = (amount: number): string => {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const man = Math.floor((amount % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man.toLocaleString('ko-KR')}만원` : `${eok}억원`;
    }
    if (amount >= 10000) {
      return `${Math.floor(amount / 10000).toLocaleString('ko-KR')}만원`;
    }
    return `${amount.toLocaleString('ko-KR')}원`;
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: '전체', value: 'all' },
    { label: '아파트', value: 'APARTMENT' },
    { label: '오피스텔', value: 'OFFICETEL' },
    { label: '빌라', value: 'VILLA' },
    { label: '주택', value: 'HOUSE' },
  ];

  return (
    <Box sx={{ pb: 12 }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          내 주택 목록
        </Typography>
      </Box>

      {/* 필터 칩 */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 2,
          overflowX: 'auto',
          pb: 0.5,
        }}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.value}
            label={filter.label}
            onClick={() => handleFilterChange(filter.value)}
            color={activeFilter === filter.value ? 'primary' : 'default'}
            variant={activeFilter === filter.value ? 'filled' : 'outlined'}
            sx={{ fontWeight: activeFilter === filter.value ? 600 : 400 }}
          />
        ))}
      </Box>

      {/* 정렬 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          정렬:
        </Typography>
        <FormControl size="small" variant="outlined">
          <Select
            value={sortType}
            onChange={(e) => handleSortChange(e.target.value as SortType)}
            sx={{ fontSize: '0.875rem' }}
          >
            <MenuItem value="recent">최근 등록순</MenuItem>
            <MenuItem value="moveInDate">입주희망년월순</MenuItem>
            <MenuItem value="priceHigh">가격 높은 순</MenuItem>
            <MenuItem value="priceLow">가격 낮은 순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 주택 목록 */}
      {loading ? (
        <Loading message="주택 목록을 불러오는 중..." />
      ) : filteredHousings.length === 0 ? (
        <EmptyState
          message="아직 등록한 주택이 없습니다"
          description="첫 주택을 등록하고 계획을 시작하세요"
          actionLabel="주택 등록하기"
          onAction={() => navigate('/housings/new')}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredHousings.map((housing) => (
            <Card
              key={housing.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => handleCardClick(housing.id)}
            >
              <CardContent>
                {/* 카드 헤더 */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleGoalClick(housing.id, e)}
                      sx={{ color: housing.isGoal ? 'warning.main' : 'text.disabled', p: 0.5 }}
                    >
                      {housing.isGoal ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {housing.housingName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={housingTypeLabel[housing.housingType] || housing.housingType}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteClick(housing.id, e)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* 주소 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {housing.fullAddress}
                  </Typography>
                </Box>

                {/* 지역 구분 */}
                {housing.regionCode && (
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={REGION_CODE_LABELS[housing.regionCode] || housing.regionCode}
                      size="small"
                      variant="outlined"
                      color="info"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                )}

                {/* 가격 */}
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(housing.price)}
                </Typography>

                {/* 하단 정보 */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {housing.isGoal && (
                    <Chip
                      icon={<StarIcon />}
                      label="최종목표"
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                    등록일: {new Date(housing.createdAt).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

        </Box>
      )}

      {/* FAB - 주택 등록 */}
      <Fab
        color="primary"
        aria-label="주택 등록"
        onClick={() => navigate('/housings/new')}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 90,
        }}
      >
        <AddIcon />
      </Fab>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>주택 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 주택을 삭제하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 최종목표 설정 다이얼로그 */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)}>
        <DialogTitle>최종목표 설정</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 주택을 최종목표로 설정하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialogOpen(false)}>취소</Button>
          <Button onClick={handleGoalConfirm} color="primary" variant="contained">
            설정
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HousingList;
