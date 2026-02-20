import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { restoreSession, logout } from '../store/slices/authSlice';
import { authApi } from '../services/auth/authApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// 인증된 사용자만 접근 가능한 라우트
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, accessToken, refreshToken } = useAppSelector((state) => state.auth);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    // 토큰은 있지만 사용자 정보가 없는 경우 (새로고침) → 세션 복원
    if (isAuthenticated && !user && accessToken && refreshToken) {
      setIsRestoring(true);
      authApi.getProfile()
        .then((response) => {
          if (response.success && response.data) {
            dispatch(restoreSession({
              user: response.data,
              accessToken: accessToken,
              refreshToken: refreshToken,
            }));
          } else {
            dispatch(logout());
          }
        })
        .catch(() => {
          dispatch(logout());
        })
        .finally(() => {
          setIsRestoring(false);
        });
    }
  }, [isAuthenticated, user, accessToken, refreshToken, dispatch]);

  // 세션 복원 중 로딩 표시
  if (isRestoring) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
