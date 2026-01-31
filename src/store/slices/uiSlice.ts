import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// UI 상태 타입
interface UiState {
  // 로딩 상태
  globalLoading: boolean;
  pageLoading: boolean;

  // Snackbar 상태
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };

  // 다이얼로그 상태
  dialog: {
    open: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert' | 'custom';
    onConfirm?: () => void;
  };

  // Drawer 상태 (모바일)
  drawerOpen: boolean;
}

// 초기 상태
const initialState: UiState = {
  globalLoading: false,
  pageLoading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  dialog: {
    open: false,
    title: '',
    message: '',
    type: 'alert',
  },
  drawerOpen: false,
};

// UI 슬라이스
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 전역 로딩 설정
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    // 페이지 로딩 설정
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },
    // Snackbar 열기
    openSnackbar: (
      state,
      action: PayloadAction<{
        message: string;
        severity?: 'success' | 'error' | 'warning' | 'info';
      }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    // Snackbar 닫기
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
    // 다이얼로그 열기
    openDialog: (
      state,
      action: PayloadAction<{
        title: string;
        message: string;
        type?: 'confirm' | 'alert' | 'custom';
        onConfirm?: () => void;
      }>
    ) => {
      state.dialog = {
        open: true,
        title: action.payload.title,
        message: action.payload.message,
        type: action.payload.type || 'alert',
        onConfirm: action.payload.onConfirm,
      };
    },
    // 다이얼로그 닫기
    closeDialog: (state) => {
      state.dialog.open = false;
      state.dialog.onConfirm = undefined;
    },
    // Drawer 토글
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    // Drawer 설정
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },
  },
});

export const {
  setGlobalLoading,
  setPageLoading,
  openSnackbar,
  closeSnackbar,
  openDialog,
  closeDialog,
  toggleDrawer,
  setDrawerOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
