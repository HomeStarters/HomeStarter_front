import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { closeDialog } from '../../store/slices/uiSlice';

// 확인 다이얼로그 컴포넌트
const ConfirmDialog = () => {
  const dispatch = useAppDispatch();
  const { dialog } = useAppSelector((state) => state.ui);

  const handleClose = () => {
    dispatch(closeDialog());
  };

  const handleConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    dispatch(closeDialog());
  };

  return (
    <Dialog open={dialog.open} onClose={handleClose}>
      <DialogTitle>{dialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialog.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {dialog.type === 'confirm' && (
          <Button onClick={handleClose} color="inherit">
            취소
          </Button>
        )}
        <Button onClick={handleConfirm} variant="contained" autoFocus>
          {dialog.type === 'confirm' ? '확인' : '닫기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
