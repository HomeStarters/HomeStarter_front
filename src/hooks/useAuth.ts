import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from '../store/slices/authSlice';
import { openSnackbar } from '../store/slices/uiSlice';
import { authApi } from '../services/auth/authApi';
import type { LoginRequest, RegisterRequest } from '../services/auth/authApi';

// 인증 관련 훅
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  // 로그인
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(loginStart());
        const response = await authApi.login(credentials);

        dispatch(
          loginSuccess({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          })
        );

        dispatch(
          openSnackbar({
            message: '로그인되었습니다.',
            severity: 'success',
          })
        );

        navigate('/dashboard');
      } catch (error: any) {
        dispatch(loginFailure(error.response?.data?.message || '로그인에 실패했습니다.'));
      }
    },
    [dispatch, navigate]
  );

  // 회원가입
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        await authApi.register(data);

        dispatch(
          openSnackbar({
            message: '회원가입이 완료되었습니다. 로그인해주세요.',
            severity: 'success',
          })
        );

        navigate('/login');
      } catch (error: any) {
        dispatch(
          openSnackbar({
            message: error.response?.data?.message || '회원가입에 실패했습니다.',
            severity: 'error',
          })
        );
        throw error;
      }
    },
    [dispatch, navigate]
  );

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      dispatch(logoutAction());
      dispatch(
        openSnackbar({
          message: '로그아웃되었습니다.',
          severity: 'info',
        })
      );
      navigate('/login');
    }
  }, [dispatch, navigate]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };
};
