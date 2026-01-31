import { useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../store';

// 타입이 지정된 useSelector 훅
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
