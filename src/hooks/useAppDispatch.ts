import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

// 타입이 지정된 useDispatch 훅
export const useAppDispatch = () => useDispatch<AppDispatch>();
