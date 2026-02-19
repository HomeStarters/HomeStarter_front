import { useState, useEffect, useCallback } from 'react';
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
  Badge,
  Button,
  Chip,
  CircularProgress,
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
  Notifications as NotificationsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { openSnackbar } from '../store/slices/uiSlice';
import { notificationApi } from '../services/notification/notificationApi';
import { householdApi } from '../services/household/householdApi';
import type { Notification } from '../types/notification.types';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 알림 상태
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // 대시보드 경로 여부
  const isDashboard = location.pathname === '/dashboard';

  // 읽지 않은 알림 수 로드
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationApi.getUnreadCount();
      console.log(response);
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('읽지 않은 알림 수 로드 실패:', error);
    }
  }, [isAuthenticated]);

  // 알림 목록 로드
  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      console.log("test");
      console.log(response);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('알림 목록 로드 실패:', error);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  // 대시보드 진입 시 읽지 않은 알림 수 로드
  useEffect(() => {
    if (isDashboard && isAuthenticated) {
      loadUnreadCount();
    }
  }, [isDashboard, isAuthenticated, loadUnreadCount]);

  // 알림 Drawer 열기
  const handleOpenNotificationDrawer = () => {
    setNotificationDrawerOpen(true);
    loadNotifications();
  };

  // 알림 Drawer 닫기
  const handleCloseNotificationDrawer = () => {
    setNotificationDrawerOpen(false);
    loadUnreadCount();
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (id: number) => {
    setActionLoadingId(id);
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      loadUnreadCount();
    } catch (error) {
      // 에러는 client interceptor에서 처리
    } finally {
      setActionLoadingId(null);
    }
  };

  // 초대 수락
  const handleAcceptInvitation = async (notification: Notification) => {
    if (!notification.referenceId) return;
    setActionLoadingId(notification.id);
    try {
      if (confirm("자산정보가 가구내 공유됩니다. 수락하시겠습니까?")) {
        await householdApi.acceptInvite(notification.referenceId);
        await notificationApi.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true, type: 'HOUSEHOLD_ACCEPTED' as const } : n))
        );
        loadUnreadCount();
        dispatch(openSnackbar({ message: '가구원 초대를 수락했습니다', severity: 'success' }));
      }
    } catch (error) {
      // 에러는 client interceptor에서 처리
    } finally {
      setActionLoadingId(null);
    }
  };

  // 초대 거절
  const handleRejectInvitation = async (notification: Notification) => {
    if (!notification.referenceId) return;
    setActionLoadingId(notification.id);
    try {
      if (confirm("거절 하시겠습니까?")) {
        await householdApi.rejectInvite(notification.referenceId);
        await notificationApi.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true, type: 'HOUSEHOLD_REJECTED' as const } : n))
        );
        loadUnreadCount();
        dispatch(openSnackbar({ message: '가구원 초대를 거절했습니다', severity: 'info' }));
      }
    } catch (error) {
      // 에러는 client interceptor에서 처리
    } finally {
      setActionLoadingId(null);
    }
  };


  // 알림 유형 라벨
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'HOUSEHOLD_INVITATION': return '가구원 초대';
      case 'HOUSEHOLD_ACCEPTED': return '초대 수락';
      case 'HOUSEHOLD_REJECTED': return '초대 거절';
      default: return '알림';
    }
  };

  // 알림 유형별 색상
  const getNotificationTypeColor = (type: string): 'primary' | 'success' | 'error' | 'default' => {
    switch (type) {
      case 'HOUSEHOLD_INVITATION': return 'primary';
      case 'HOUSEHOLD_ACCEPTED': return 'success';
      case 'HOUSEHOLD_REJECTED': return 'error';
      default: return 'default';
    }
  };

  // 상대 시간 표시
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

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

          {/* 대시보드 알림 아이콘 */}
          {isDashboard && (
            <IconButton color="inherit" onClick={handleOpenNotificationDrawer}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
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

      {/* 알림 Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={handleCloseNotificationDrawer}
        PaperProps={{
          sx: { width: isMobile ? '100%' : 380 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              알림
            </Typography>
            <IconButton onClick={handleCloseNotificationDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 알림 목록 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {notificationLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  알림이 없습니다
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: 1,
                      borderColor: notification.read ? 'grey.200' : 'primary.light',
                      bgcolor: notification.read ? 'grey.50' : 'primary.50',
                      opacity: notification.read ? 0.7 : 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={getNotificationTypeLabel(notification.type)}
                        color={getNotificationTypeColor(notification.type)}
                        size="small"
                        variant={notification.read ? 'outlined' : 'filled'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {getRelativeTime(notification.createdAt)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {notification.message}
                    </Typography>

                    {/* 알림 액션 버튼 또는 상태 표시 */}
                    {!notification.read ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {notification.type === 'HOUSEHOLD_INVITATION' ? (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              disabled={actionLoadingId === notification.id}
                              onClick={() => handleAcceptInvitation(notification)}
                            >
                              수락
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              disabled={actionLoadingId === notification.id}
                              onClick={() => handleRejectInvitation(notification)}
                            >
                              거절
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            disabled={actionLoadingId === notification.id}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            읽음
                          </Button>
                        )}
                        {actionLoadingId === notification.id && (
                          <CircularProgress size={20} sx={{ ml: 1 }} />
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {notification.type === 'HOUSEHOLD_ACCEPTED' ? (
                          <Chip label="수락됨" color="success" size="small" variant="outlined" />
                        ) : notification.type === 'HOUSEHOLD_REJECTED' ? (
                          <Chip label="거절됨" color="error" size="small" variant="outlined" />
                        ) : (
                          <Typography variant="caption" color="text.secondary">읽음</Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MainLayout;
