import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { calculatorApi } from '../../services/calculator/calculatorApi';
import type { CalculationResultListItem } from '../../services/calculator/calculatorApi';

type FilterType = 'all' | 'ELIGIBLE' | 'INELIGIBLE';

const CalculationResultList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<CalculationResultListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  // 계산 결과 목록 조회
  const loadResults = useCallback(async (pageNum: number, filter: FilterType) => {
    try {
      setLoading(true);
      const params: any = {
        page: pageNum,
        size: PAGE_SIZE,
        sortBy: 'calculatedAt',
        sortOrder: 'desc' as const,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await calculatorApi.getResults(params);
      if (response && response.results) {
        setResults(response.results);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('계산 결과 목록 로드 실패:', error);
      dispatch(
        openSnackbar({
          message: '계산 결과 목록을 불러오는데 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadResults(page, activeFilter);
  }, [page, activeFilter, loadResults]);

  // 필터 변경
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setPage(0);
  };

  // 삭제 다이얼로그 열기
  const handleDeleteClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    try {
      if (confirm("삭제 하시겠습니까?")) {
        await calculatorApi.deleteResult(deleteTargetId);
        dispatch(
          openSnackbar({
            message: '계산 결과가 삭제되었습니다',
            severity: 'success',
          })
        );
        loadResults(page, activeFilter);
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
      setDeleteTargetId(null);
    }
  };

  // 카드 클릭 - 상세 페이지 이동
  const handleCardClick = (id: string) => {
    navigate(`/calculator/results/${id}`);
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

  // 더보기 (다음 페이지)
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMore = (page + 1) * PAGE_SIZE < total;

  const filters: { label: string; value: FilterType }[] = [
    { label: '전체', value: 'all' },
    { label: '적격', value: 'ELIGIBLE' },
    { label: '부적격', value: 'INELIGIBLE' },
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
          계산 결과 목록
        </Typography>
      </Box>

      {/* 필터 칩 */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
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

      {/* 결과 목록 */}
      {loading && page === 0 ? (
        <Loading message="계산 결과를 불러오는 중..." />
      ) : results.length === 0 ? (
        <EmptyState
          message="계산 결과가 없습니다"
          description="지출 계산을 해보시겠어요?"
          actionLabel="지출 계산하기"
          onAction={() => navigate('/calculator')}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {results.map((result) => (
            <Card
              key={result.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => handleCardClick(result.id)}
            >
              <CardContent>
                {/* 카드 헤더 */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {result.housingName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(result.calculatedAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteClick(result.id, e)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* 카드 정보 */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      대출상품
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {result.loanProductName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      충족여부
                    </Typography>
                    <Box>
                      <Chip
                        icon={result.status === 'ELIGIBLE' ? <CheckIcon /> : <CancelIcon />}
                        label={result.status === 'ELIGIBLE' ? '적격' : '부적격'}
                        color={result.status === 'ELIGIBLE' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* 월 여유자금 */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    월 여유자금
                  </Typography>
                  <Typography
                    variant="h6"
                    color={result.monthlyAvailableFunds >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 700 }}
                  >
                    {formatCurrency(result.monthlyAvailableFunds)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* 더보기 버튼 */}
          {hasMore && (
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              fullWidth
              sx={{ mt: 1 }}
            >
              더보기
            </Button>
          )}
        </Box>
      )}

      {/* 새 계산하기 버튼 (하단 고정) */}
      <Box
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
          startIcon={<AddIcon />}
          onClick={() => navigate('/calculator')}
        >
          새 계산하기
        </Button>
      </Box>

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

export default CalculationResultList;
