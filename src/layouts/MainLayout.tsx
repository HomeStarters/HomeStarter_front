import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Savings as SavingsIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Bottom Navigation 현재 값 결정
  const getBottomNavValue = () => {
    if (location.pathname.startsWith('/dashboard')) return 0;
    if (location.pathname.startsWith('/housings')) return 1;
    if (location.pathname.startsWith('/calculator')) return 2;
    if (location.pathname.startsWith('/roadmap') || location.pathname.startsWith('/lifecycle-events')) return 3;
    return 0;
  };

  // Bottom Navigation 변경 핸들러
  const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    const routes = ['/dashboard', '/housings', '/calculator', '/roadmap'];
    navigate(routes[newValue]);
  };

  // Drawer 토글
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    // TODO: Redux store에서 로그아웃 처리
    navigate('/login');
  };

  // 페이지 타이틀 결정
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return '대시보드';
    if (path.startsWith('/profile')) return '프로필';
    if (path.startsWith('/assets')) return '자산관리';
    if (path.startsWith('/loans')) return '대출상품';
    if (path.startsWith('/housings')) return '주택관리';
    if (path.startsWith('/calculator')) return '지출계산';
    if (path.startsWith('/lifecycle-events')) return '생애주기이벤트';
    if (path.startsWith('/roadmap')) return '로드맵';
    return '내집마련 도우미';
  };

  // Back 버튼 표시 여부
  const showBackButton = location.pathname !== '/dashboard';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          {isMobile && showBackButton && (
            <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          {!isMobile && (
            <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
          <Box sx={{ width: 250 }}>
            <List>
              <ListItemButton onClick={() => { navigate('/dashboard'); toggleDrawer(); }}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="대시보드" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/profile/basic-info'); toggleDrawer(); }}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="프로필" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/assets'); toggleDrawer(); }}>
                <ListItemIcon><SavingsIcon /></ListItemIcon>
                <ListItemText primary="자산관리" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/loans'); toggleDrawer(); }}>
                <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
                <ListItemText primary="대출상품" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/housings'); toggleDrawer(); }}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="주택관리" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/calculator'); toggleDrawer(); }}>
                <ListItemIcon><CalculateIcon /></ListItemIcon>
                <ListItemText primary="지출계산" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/lifecycle-events'); toggleDrawer(); }}>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary="생애주기이벤트" />
              </ListItemButton>
              <ListItemButton onClick={() => { navigate('/roadmap'); toggleDrawer(); }}>
                <ListItemIcon><TimelineIcon /></ListItemIcon>
                <ListItemText primary="로드맵" />
              </ListItemButton>
              <Divider />
              <ListItemButton>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="설정" />
              </ListItemButton>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="로그아웃" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          bgcolor: 'background.paper',
          pb: isMobile ? 7 : 0, // Bottom Navigation 공간 확보
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          value={getBottomNavValue()}
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
          }}
        >
          <BottomNavigationAction label="대시보드" icon={<DashboardIcon />} />
          <BottomNavigationAction label="주택" icon={<HomeIcon />} />
          <BottomNavigationAction label="계산" icon={<CalculateIcon />} />
          <BottomNavigationAction label="로드맵" icon={<TimelineIcon />} />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default MainLayout;
