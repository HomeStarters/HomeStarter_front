import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Profile
import BasicInfoInput from '../pages/profile/BasicInfoInput';

// Assets
import SelfAssetInput from '../pages/assets/SelfAssetInput';
import SpouseAssetInput from '../pages/assets/SpouseAssetInput';

// Housing
import HousingList from '../pages/housing/HousingList';
import HousingInput from '../pages/housing/HousingInput';
import HousingDetail from '../pages/housing/HousingDetail';

// Calculator
import HousingExpenseCalculator from '../pages/calculator/HousingExpenseCalculator';
import CalculationResultList from '../pages/calculator/CalculationResultList';
import CalculationResultDetail from '../pages/calculator/CalculationResultDetail';

// Admin
import LoanManagement from '../pages/admin/LoanManagement';

// 라우터 설정
const router = createBrowserRouter([
  // Public Routes - Auth
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },

  // Protected Routes - Main Application
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: '/dashboard',
        element: <Dashboard />,
      },

      // Profile
      {
        path: '/profile/basic-info',
        element: <BasicInfoInput />,
      },
      {
        path: '/profile/edit',
        element: <div>프로필 편집 페이지</div>,
      },

      // Assets
      // TODO: 자산 페이지 추가
      {
        path: '/assets',
        element: <div>자산정보 관리 페이지</div>,
      },
      {
        path: '/assets/self',
        element: <SelfAssetInput />,
      },
      {
        path: '/assets/spouse',
        element: <SpouseAssetInput />,
      },

      // Loans
      // TODO: 대출 페이지 추가
      {
        path: '/loans',
        element: <div>대출상품 목록 페이지</div>,
      },
      {
        path: '/loans/:id',
        element: <div>대출상품 상세 페이지</div>,
      },

      // Housings
      {
        path: '/housings',
        element: <HousingList />,
      },
      {
        path: '/housings/new',
        element: <HousingInput />,
      },
      {
        path: '/housings/:id',
        element: <HousingDetail />,
      },

      // Calculator
      {
        path: '/calculator',
        element: <HousingExpenseCalculator />,
      },
      {
        path: '/calculator/results',
        element: <CalculationResultList />,
      },
      {
        path: '/calculator/results/:id',
        element: <CalculationResultDetail />,
      },

      // Roadmap
      // TODO: 로드맵 페이지 추가
      {
        path: '/lifecycle-events',
        element: <div>생애주기 이벤트 관리 페이지</div>,
      },
      {
        path: '/roadmap',
        element: <div>장기주거 로드맵 조회 페이지</div>,
      },
    ],
  },

  // Admin Routes
  {
    element: (
      <AdminRoute>
        <MainLayout />
      </AdminRoute>
    ),
    children: [
      {
        path: '/admin/loans',
        element: <LoanManagement />,
      },
    ],
  },

  // Default Route
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // 404 Not Found
  {
    path: '*',
    element: <div>404 - 페이지를 찾을 수 없습니다</div>,
  },
]);

export default router;
