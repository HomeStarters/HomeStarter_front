import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Drawer,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { openSnackbar } from '../../store/slices/uiSlice';
import { userApi, type UserProfileUpdateRequest } from '../../services/user/userApi';
import { householdApi } from '../../services/household/householdApi';
import type { HouseholdMember, HouseholdRole } from '../../types/household.types';

// 투자성향 타입
type InvestmentPropensity = 'HIGH' | 'MEDIUM' | 'LOW';

// 성별 타입
type Gender = 'MALE' | 'FEMALE';

// 폼 데이터 타입
interface BasicInfoFormData {
  birthDate: string;
  gender: Gender | '';
  currentAddress: string;
  userWorkplaceAddress: string;
  spouseWorkplaceAddress: string;
  withholdingTaxSalary: string;
  investmentPropensity: InvestmentPropensity | '';
}

// 유효성 검사 에러 타입
interface FormErrors {
  birthDate?: string;
  gender?: string;
  currentAddress?: string;
  userWorkplaceAddress?: string;
  investmentPropensity?: string;
}

const BasicInfoInput = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<BasicInfoFormData>({
    birthDate: '',
    gender: '',
    currentAddress: '',
    userWorkplaceAddress: '',
    spouseWorkplaceAddress: '',
    withholdingTaxSalary: '',
    investmentPropensity: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // 가구원 관리 상태
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [myRole, setMyRole] = useState<HouseholdRole | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // 가구원 목록 로드
  const loadMembers = useCallback(async () => {
    try {
      const response = await householdApi.getMembers();
      if (response.success && response.data) {
        const memberList = response.data.members || [];
        setMembers(memberList);
        // 현재 사용자의 역할과 가구원 ID 판별
        const myInfo = memberList.find((m) => m.userId === user?.userId);
        if (myInfo) {
          setMyRole(myInfo.role);
          setMyMemberId(myInfo.userId);
        } else {
          setMyRole("OWNER");
          setMyMemberId(null);
        }
      }
    } catch (error) {
      console.error('가구원 목록 로드 실패:', error);
    }
  }, [user?.userId]);

  // 기존 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userApi.getProfile();
        if (response.success && response.data) {
          const profile = response.data;

          // 기존 데이터로 폼 초기화 (주소는 문자열 또는 객체일 수 있음)
          const getAddressString = (addr: unknown): string => {
            if (!addr) return '';
            if (typeof addr === 'string') return addr;
            if (typeof addr === 'object' && addr !== null && 'roadAddress' in addr) {
              return (addr as { roadAddress: string }).roadAddress || '';
            }
            return '';
          };

          setFormData({
            birthDate: profile.birthDate || '',
            gender: profile.gender || '',
            currentAddress: getAddressString(profile.currentAddress),
            userWorkplaceAddress: getAddressString(profile.userWorkplaceAddress),
            spouseWorkplaceAddress: getAddressString(profile.spouseWorkplaceAddress),
            withholdingTaxSalary: profile.withholdingTaxSalary ? String(profile.withholdingTaxSalary) : '',
            investmentPropensity: profile.investmentPropensity || '',
          });
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
    loadMembers();
  }, [loadMembers]);

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof BasicInfoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 에러 클리어
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 생년월일 검사
    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 선택해주세요';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.birthDate = '만 18세 이상만 이용할 수 있습니다';
      } else if (age > 100) {
        newErrors.birthDate = '올바른 생년월일을 입력해주세요';
      }
    }

    // 성별 검사
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }

    // 현재 거주지 검사
    if (!formData.currentAddress) {
      newErrors.currentAddress = '현재 거주지를 입력해주세요';
    } else if (formData.currentAddress.length < 5) {
      newErrors.currentAddress = '최소 5자 이상 입력해주세요';
    }

    // 본인 직장위치 검사
    if (!formData.userWorkplaceAddress) {
      newErrors.userWorkplaceAddress = '본인 직장위치를 입력해주세요';
    } else if (formData.userWorkplaceAddress.length < 5) {
      newErrors.userWorkplaceAddress = '최소 5자 이상 입력해주세요';
    }

    // 투자성향 검사
    if (!formData.investmentPropensity) {
      newErrors.investmentPropensity = '투자성향을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 유효 여부 확인
  const isFormValid = (): boolean => {
    return (
      formData.birthDate !== '' &&
      formData.gender !== '' &&
      formData.currentAddress.length >= 5 &&
      formData.userWorkplaceAddress.length >= 5 &&
      formData.investmentPropensity !== ''
    );
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (confirm("수정 하시겠습니까?")) {
        const updateData: UserProfileUpdateRequest = {
          birthDate: formData.birthDate,
          gender: formData.gender as 'MALE' | 'FEMALE',
          currentAddress: formData.currentAddress,
          userWorkplaceAddress: formData.userWorkplaceAddress,
          spouseWorkplaceAddress: formData.spouseWorkplaceAddress || undefined,
          withholdingTaxSalary: formData.withholdingTaxSalary ? parseInt(formData.withholdingTaxSalary.replace(/,/g, ''), 10) : undefined,
          investmentPropensity: formData.investmentPropensity as InvestmentPropensity,
        };

        const response = await userApi.updateProfile(updateData);

        if (response.success) {
          dispatch(
            openSnackbar({
              message: '기본정보가 저장되었습니다',
              severity: 'success',
            })
          );

          // 본인 자산정보 입력 화면으로 이동
          navigate('/assets/self');
        }
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          message: '기본정보 저장 중 오류가 발생했습니다',
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // 가구원 초대 바텀시트 열기
  const handleOpenInviteSheet = () => {
    setTargetUserId('');
    setInviteSheetOpen(true);
  };

  // 가구원 초대 바텀시트 닫기
  const handleCloseInviteSheet = () => {
    setInviteSheetOpen(false);
    setTargetUserId('');
  };

  // 가구원 초대 등록
  const handleInviteMember = async () => {
    if (!targetUserId.trim()) {
      dispatch(openSnackbar({ message: '가구원 ID를 입력해주세요', severity: 'warning' }));
      return;
    }

    setInviteLoading(true);
    try {
      if (confirm("동일 가구내 가구원간 자산정보는 공유됩니다. 초대 하시겠습니까?")) {
        const response = await householdApi.invite({ targetUserId: targetUserId.trim() });
        if (response.success) {
          dispatch(openSnackbar({ message: '가구원 초대가 요청되었습니다', severity: 'success' }));
          handleCloseInviteSheet();
          loadMembers();
        }
      }
    } catch (error) {
      // 에러는 client interceptor에서 처리
    } finally {
      setInviteLoading(false);
    }
  };

  // 가구원 삭제
  const handleDeleteMember = async (member: HouseholdMember) => {
    try {
      if (confirm("삭제 하시겠습니까?")) {
        await householdApi.deleteMember(member.userId);
        dispatch(openSnackbar({ message: '가구원이 삭제되었습니다', severity: 'success' }));
        loadMembers();
      }
    } catch (error) {
      // 에러는 client interceptor에서 처리
    }
  };

  // OWNER 권한 위임
  const handleDelegateOwner = async (member: HouseholdMember) => {
    try {
      if (confirm("가구원 초대나 삭제 권한이 제한됩니다. 권한을 위임하시겠습니까?")) {
        await householdApi.delegateOwner(member.userId);
        dispatch(openSnackbar({ message: `${member.name}님에게 소유자 권한을 위임했습니다`, severity: 'success' }));
        loadMembers();
      }
    } catch (error) {
      // 에러는 client interceptor에서 처리
    }
  };

  // 가구 탈퇴
  const handleLeaveHousehold = async () => {
    console.log(myMemberId);
    if (!myMemberId) return;
    console.log("test");

    try {
      if (confirm("탈퇴 하시겠습니까?")) {
        await householdApi.deleteMember(myMemberId);
        dispatch(openSnackbar({ message: '가구에서 탈퇴되었습니다', severity: 'success' }));
        loadMembers();
      }
    } catch (error) {
      // 에러는 client interceptor에서 처리
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* 개인정보 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            개인정보
          </Typography>

          {/* 생년월일 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              생년월일 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              error={!!errors.birthDate}
              helperText={errors.birthDate}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: new Date().toISOString().split('T')[0],
              }}
            />
          </Box>

          {/* 성별 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              성별 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <ToggleButtonGroup
              value={formData.gender}
              exclusive
              onChange={(_, value) => value && handleInputChange('gender', value)}
              fullWidth
              sx={{ mb: errors.gender ? 0 : 1 }}
            >
              <ToggleButton value="MALE" sx={{ flex: 1, py: 1.5 }}>
                남성
              </ToggleButton>
              <ToggleButton value="FEMALE" sx={{ flex: 1, py: 1.5 }}>
                여성
              </ToggleButton>
            </ToggleButtonGroup>
            {errors.gender && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.gender}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 거주 및 직장정보 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            거주 및 직장정보
          </Typography>

          {/* 현재 거주지 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              현재 거주지 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 서울시 관악구 봉천동"
              value={formData.currentAddress}
              onChange={(e) => handleInputChange('currentAddress', e.target.value)}
              error={!!errors.currentAddress}
              helperText={errors.currentAddress}
            />
          </Box>

          {/* 본인 직장위치 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              본인 직장위치 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 서울시 강남구 역삼동"
              value={formData.userWorkplaceAddress}
              onChange={(e) => handleInputChange('userWorkplaceAddress', e.target.value)}
              error={!!errors.userWorkplaceAddress}
              helperText={errors.userWorkplaceAddress}
            />
          </Box>

          {/* 배우자 직장위치 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              배우자 직장위치{' '}
              <Typography component="span" variant="body2" color="text.secondary">
                (선택)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 서울시 서초구 서초동"
              value={formData.spouseWorkplaceAddress}
              onChange={(e) => handleInputChange('spouseWorkplaceAddress', e.target.value)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 소득정보 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            소득정보
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            원천징수 영수증 기준 연소득을 입력해주세요
          </Typography>

          {/* 원천징수 소득 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              원천징수 소득 (연간){' '}
              <Typography component="span" variant="body2" color="text.secondary">
                (선택)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              placeholder="예: 50,000,000"
              value={formData.withholdingTaxSalary}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value) {
                  handleInputChange('withholdingTaxSalary', parseInt(value, 10).toLocaleString('ko-KR'));
                } else {
                  handleInputChange('withholdingTaxSalary', '');
                }
              }}
              InputProps={{
                endAdornment: <Typography color="text.secondary">원</Typography>,
              }}
              inputProps={{ inputMode: 'numeric' }}
              helperText="DTI/DSR 계산 시 참고됩니다"
            />
          </Box>
        </CardContent>
      </Card>

      {/* 투자정보 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            투자정보
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            주택 구매 시 투자 리스크에 대한 수용도를 선택해주세요
          </Typography>

          {/* 투자성향 */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              투자성향 <span style={{ color: '#f44336' }}>*</span>
            </Typography>
            <ToggleButtonGroup
              value={formData.investmentPropensity}
              exclusive
              onChange={(_, value) => value && handleInputChange('investmentPropensity', value)}
              fullWidth
              sx={{ mb: errors.investmentPropensity ? 0 : 1 }}
            >
              <ToggleButton
                value="HIGH"
                sx={{
                  flex: 1,
                  py: 2,
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  상
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  공격적
                </Typography>
              </ToggleButton>
              <ToggleButton
                value="MEDIUM"
                sx={{
                  flex: 1,
                  py: 2,
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  중
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  중립적
                </Typography>
              </ToggleButton>
              <ToggleButton
                value="LOW"
                sx={{
                  flex: 1,
                  py: 2,
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  하
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  보수적
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
            {errors.investmentPropensity && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.investmentPropensity}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 가구원 관리 섹션 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              가구원 관리
            </Typography>
            {myRole === 'OWNER' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenInviteSheet}
              >
                추가
              </Button>
            )}
          </Box>

          {members.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                등록된 가구원이 없습니다
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {members.map((member) => (
                <Card key={member.userId} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.userId} · {member.role === 'OWNER' ? '소유자' : '구성원'}
                        </Typography>
                      </Box>
                      {myRole === 'OWNER' && member.userId !== user?.userId && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<SwapHorizIcon />}
                            onClick={() => handleDelegateOwner(member)}
                          >
                            권한위임
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* MEMBER이거나 OWNER가 혼자인 경우 가구 탈퇴 버튼 */}
          {(myRole === 'MEMBER' || (myRole === 'OWNER' && members.length === 1)) && (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleLeaveHousehold}
            >
              가구 탈퇴
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 다음 버튼 */}
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
          disabled={!isFormValid() || loading}
          onClick={handleSubmit}
          sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '다음'}
        </Button>
      </Box>

      {/* 가구원 초대 바텀시트 */}
      <Drawer
        anchor="bottom"
        open={inviteSheetOpen}
        onClose={handleCloseInviteSheet}
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
              가구원 추가
            </Typography>
            <IconButton onClick={handleCloseInviteSheet} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 가구원 ID 입력 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              가구원 ID
            </Typography>
            <TextField
              fullWidth
              placeholder="초대할 사용자의 ID를 입력하세요"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
            />
          </Box>

          {/* 등록 버튼 */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!targetUserId.trim() || inviteLoading}
            onClick={handleInviteMember}
            sx={{ py: 1.5 }}
          >
            {inviteLoading ? <CircularProgress size={24} color="inherit" /> : '등록'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default BasicInfoInput;
