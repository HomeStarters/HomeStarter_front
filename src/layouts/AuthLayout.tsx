import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

// 인증 페이지 레이아웃 (로그인, 회원가입)
const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;
