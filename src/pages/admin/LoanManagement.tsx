import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import {
  loanApi,
  type LoanProductDTO,
  type CreateLoanProductRequest,
  type UpdateLoanProductRequest,
} from '../../services/loan/loanApi';

// 초기 폼 데이터
const initialFormData: CreateLoanProductRequest = {
  name: '',
  loanLimit: 0,
  ltvLimit: 70,
  dtiLimit: 60,
  dsrLimit: 40,
  interestRate: 3.5,
  targetHousing: '',
  incomeRequirement: '',
  applicantRequirement: '',
  remarks: '',
};

const LoanManagement = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 상태
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<LoanProductDTO[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLoanProductRequest & { active?: boolean }>(initialFormData);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 통계 계산
  const stats = {
    total: products.length,
    active: products.filter((p) => p.active).length,
    inactive: products.filter((p) => !p.active).length,
  };

  // 대출상품 목록 로드
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await loanApi.getLoanProducts({ page: 0, size: 100 });
      console.log(response);
      if (response.success && response.data?.content) {
        setProducts(response.data.content);
      }
    } catch (error) {
      console.error('대출상품 목록 로드 실패:', error);
      dispatch(
        openSnackbar({
          message: '대출상품 목록을 불러오는데 실패했습니다',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 폼 열기 (추가)
  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setFormOpen(true);
  };

  // 폼 열기 (수정)
  const handleOpenEditForm = (product: LoanProductDTO) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      loanLimit: product.loanLimit,
      ltvLimit: product.ltvLimit,
      dtiLimit: product.dtiLimit,
      dsrLimit: product.dsrLimit,
      interestRate: product.interestRate,
      targetHousing: product.targetHousing,
      incomeRequirement: product.incomeRequirement || '',
      applicantRequirement: product.applicantRequirement || '',
      remarks: product.remarks || '',
      active: product.active,
    });
    setFormOpen(true);
  };

  // 폼 닫기
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  // 폼 입력 변경
  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 폼 제출
  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.name.trim()) {
      dispatch(openSnackbar({ message: '대출이름을 입력해주세요', severity: 'warning' }));
      return;
    }
    if (formData.loanLimit <= 0) {
      dispatch(openSnackbar({ message: '대출한도를 입력해주세요', severity: 'warning' }));
      return;
    }
    if (!formData.targetHousing.trim()) {
      dispatch(openSnackbar({ message: '대상주택을 입력해주세요', severity: 'warning' }));
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        // 수정
        const updateData: UpdateLoanProductRequest = {
          ...formData,
          active: formData.active ?? true,
        };
        const response = await loanApi.updateLoanProduct(editingId, updateData);
        if (response.success) {
          alert('대출상품이 수정되었습니다');
          handleCloseForm();
          loadProducts();
        }
      } else {
        // 등록
        const response = await loanApi.createLoanProduct(formData);
        if (response.success) {
          alert('대출상품이 등록되었습니다');
          handleCloseForm();
          loadProducts();
        }
      }
    } catch (error) {
      console.error('대출상품 저장 실패:', error);
      alert('대출상품 저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // 삭제 확인 열기
  const handleOpenDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  // 삭제 실행
  const handleDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const response = await loanApi.deleteLoanProduct(deleteTargetId);
      if (response.success) {
        alert('대출상품이 삭제되었습니다');
        loadProducts();
      }
    } catch (error) {
      console.error('대출상품 삭제 실패:', error);
      alert('대출상품 삭제에 실패했습니다');
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  // 활성/비활성 토글
  const handleToggleActive = async (product: LoanProductDTO) => {
    try {
      const updateData: UpdateLoanProductRequest = {
        name: product.name,
        loanLimit: product.loanLimit,
        ltvLimit: product.ltvLimit,
        dtiLimit: product.dtiLimit,
        dsrLimit: product.dsrLimit,
        interestRate: product.interestRate,
        targetHousing: product.targetHousing,
        incomeRequirement: product.incomeRequirement,
        applicantRequirement: product.applicantRequirement,
        remarks: product.remarks,
        active: !product.active,
      };
      const response = await loanApi.updateLoanProduct(product.id, updateData);
      if (response.success) {
        dispatch(
          openSnackbar({
            message: `대출상품이 ${!product.active ? '활성화' : '비활성화'}되었습니다`,
            severity: 'info',
          })
        );
        loadProducts();
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      dispatch(openSnackbar({ message: '상태 변경에 실패했습니다', severity: 'error' }));
    }
  };

  // 금액 포맷
  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      if (value % 10000 > 0)
        return `${(value / 10000).toFixed(0)}억${value.toLocaleString()}만원`;
      return `${(value / 10000).toFixed(0)}억원`;
    }
    return `${value.toLocaleString()}만원`;
  };

  if (loading) {
    return <Loading message="대출상품 목록을 불러오는 중..." />;
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          대출상품 관리
        </Typography>
      </Box>

      {/* 작업 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          대출상품 목록
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddForm}>
          상품 추가
        </Button>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                전체 상품
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                활성 상품
              </Typography>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                비활성 상품
              </Typography>
              <Typography variant="h4" color="text.disabled" sx={{ fontWeight: 700 }}>
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 목록 */}
      {products.length === 0 ? (
        <EmptyState
          message="등록된 대출상품이 없습니다"
          actionLabel="상품 추가"
          onAction={handleOpenAddForm}
        />
      ) : isMobile ? (
        // 모바일: 카드 뷰
        <Box>
          {products.map((product) => (
            <Card key={product.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Chip
                      label={product.active ? '활성' : '비활성'}
                      color={product.active ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">대출한도</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatCurrency(product.loanLimit)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">금리</Typography>
                    <Typography variant="body2" fontWeight={600}>연 {product.interestRate}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">LTV / DTI</Typography>
                    <Typography variant="body2" fontWeight={600}>최대 {product.ltvLimit}% / 최대 {product.dtiLimit}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">대상주택</Typography>
                    <Typography variant="body2" fontWeight={600}>{product.targetHousing}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.active ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenEditForm(product)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenDeleteConfirm(product.id)}
                  >
                    삭제
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        // 데스크톱: 테이블 뷰
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>상태</TableCell>
                <TableCell>대출이름</TableCell>
                <TableCell>대출한도</TableCell>
                <TableCell>금리</TableCell>
                <TableCell>LTV</TableCell>
                <TableCell>DTI</TableCell>
                <TableCell>대상주택</TableCell>
                <TableCell>작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Chip
                      label={product.active ? '활성' : '비활성'}
                      color={product.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{formatCurrency(product.loanLimit)}</TableCell>
                  <TableCell>연 {product.interestRate}%</TableCell>
                  <TableCell>최대 {product.ltvLimit}%</TableCell>
                  <TableCell>최대 {product.dtiLimit}%</TableCell>
                  <TableCell>{product.targetHousing}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(product)}
                        title={product.active ? '비활성화' : '활성화'}
                      >
                        {product.active ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditForm(product)}
                        title="수정"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteConfirm(product.id)}
                        title="삭제"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 추가/수정 모달 */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? '대출상품 수정' : '대출상품 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="대출이름"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="대출한도 (원)"
              type="number"
              value={formData.loanLimit}
              onChange={(e) => handleFormChange('loanLimit', Number(e.target.value))}
              aria-required
              fullWidth
              inputProps={{ min: 0, step: 1000 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="LTV 한도 (%)"
                type="number"
                value={formData.ltvLimit}
                onChange={(e) => handleFormChange('ltvLimit', Number(e.target.value))}
                required
                fullWidth
                inputProps={{ min: 0, max: 100, step: 5 }}
              />
              <TextField
                label="DTI 한도 (%)"
                type="number"
                value={formData.dtiLimit}
                onChange={(e) => handleFormChange('dtiLimit', Number(e.target.value))}
                required
                fullWidth
                inputProps={{ min: 0, max: 100, step: 5 }}
              />
            </Box>
            <TextField
              label="DSR 한도 (%)"
              type="number"
              value={formData.dsrLimit}
              onChange={(e) => handleFormChange('dsrLimit', Number(e.target.value))}
              required
              fullWidth
              inputProps={{ min: 0, max: 100, step: 5 }}
            />
            <TextField
              label="금리 (%)"
              type="number"
              value={formData.interestRate}
              onChange={(e) => handleFormChange('interestRate', Number(e.target.value))}
              required
              fullWidth
              inputProps={{ min: 0, max: 20, step: 0.1 }}
            />
            <TextField
              label="대상주택"
              value={formData.targetHousing}
              onChange={(e) => handleFormChange('targetHousing', e.target.value)}
              required
              fullWidth
              placeholder="예: 6억 이하 주택"
            />
            <TextField
              label="소득요건"
              value={formData.incomeRequirement}
              onChange={(e) => handleFormChange('incomeRequirement', e.target.value)}
              fullWidth
              placeholder="예: 부부합산 연소득 7천만원 이하"
            />
            <TextField
              label="신청자요건"
              value={formData.applicantRequirement}
              onChange={(e) => handleFormChange('applicantRequirement', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="예: 무주택 세대주"
            />
            <TextField
              label="비고"
              value={formData.remarks}
              onChange={(e) => handleFormChange('remarks', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            {editingId && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active ?? true}
                    onChange={(e) => handleFormChange('active', e.target.checked)}
                  />
                }
                label="활성화"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={submitting}>
            취소
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
        }}
      >
        <DialogTitle>대출상품 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 대출상품을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setDeleteTargetId(null);
            }}
          >
            취소
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanManagement;
