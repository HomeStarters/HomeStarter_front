import { useState } from 'react';
import { Box, Typography, TextField, Button, Link, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { openSnackbar } from '../../store/slices/uiSlice';
import { authApi } from '../../services/auth/authApi';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      dispatch(openSnackbar({ message: '아이디와 비밀번호를 입력해주세요.', severity: 'warning' }));
      return;
    }

    try {
      dispatch(loginStart());

      const response = await authApi.login({ userId, password });

      if (response.success && response.data) {
        dispatch(loginSuccess({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }));
        dispatch(openSnackbar({ message: '로그인 성공!', severity: 'success' }));
        navigate('/dashboard');
      } else {
        const errorMessage = response.message || '로그인에 실패했습니다.';
        dispatch(loginFailure(errorMessage));
        dispatch(openSnackbar({ message: errorMessage, severity: 'error' }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      dispatch(loginFailure(errorMessage));
      dispatch(openSnackbar({ message: errorMessage, severity: 'error' }));
    }
  };

  return (
    <Box>
      <Typography variant="h1" gutterBottom align="center">
        로그인
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
        내집마련 도우미에 오신 것을 환영합니다
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="아이디"
          margin="normal"
          required
          autoFocus
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loading}
        />
        <TextField
          fullWidth
          label="비밀번호"
          type="password"
          margin="normal"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/register')}
          >
            계정이 없으신가요? 회원가입
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
