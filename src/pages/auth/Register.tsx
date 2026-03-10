import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/user/userApi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openSnackbar } from '../../store/slices/uiSlice';

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  userId: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
  userId?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    userId: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    // 입력 시 해당 필드 에러 초기화
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다';
    }

    if (!formData.userId.trim()) {
      newErrors.userId = '아이디를 입력해주세요';
    } else if (formData.userId.length < 4) {
      newErrors.userId = '아이디는 4자 이상이어야 합니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '이용약관에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (confirm("회원가입 하시겠습니까?")) {
        await userApi.register({
          userId: formData.userId,
          password: formData.password,
          passwordConfirm: formData.confirmPassword,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          agreeTerms: formData.agreeTerms,
        });

        dispatch(
          openSnackbar({
            message: '회원가입이 완료되었습니다. 로그인해주세요.',
            severity: 'success',
          })
        );
        navigate('/login');
      }
    } catch (error) {
      // API client의 인터셉터에서 에러 메시지를 처리하므로 추가 처리 불필요
      console.error('회원가입 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h1" gutterBottom align="center">
        회원가입
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
        내집마련의 첫걸음을 시작하세요
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="이름"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
          error={!!errors.name}
          helperText={errors.name}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="이메일"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
          error={!!errors.email}
          helperText={errors.email}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="전화번호"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          margin="normal"
          required
          placeholder="010-1234-5678"
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="아이디"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          margin="normal"
          required
          error={!!errors.userId}
          helperText={errors.userId}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
          error={!!errors.password}
          helperText={errors.password}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="비밀번호 확인"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
          required
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          disabled={loading}
        />

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={loading}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <Link href="/terms" target="_blank" onClick={(e) => e.stopPropagation()}>
                  이용약관
                </Link>
                {' 및 '}
                <Link href="/privacy" target="_blank" onClick={(e) => e.stopPropagation()}>
                  개인정보처리방침
                </Link>
                에 동의합니다
              </Typography>
            }
          />
          {errors.agreeTerms && (
            <FormHelperText error sx={{ ml: 2 }}>
              {errors.agreeTerms}
            </FormHelperText>
          )}
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            이미 계정이 있으신가요? 로그인
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
