import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { RecentCalculation } from '../../types/dashboard.types';

interface CalculationResultCardProps {
  calculation: RecentCalculation;
}

// 계산 결과 카드 컴포넌트
const CalculationResultCard = ({ calculation }: CalculationResultCardProps) => {
  const navigate = useNavigate();
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ko-KR')}원`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={() => navigate(`/calculator/results/${calculation.id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {calculation.housingName}
          </Typography>
          <Chip
            icon={calculation.status === 'ELIGIBLE' ? <CheckIcon /> : <CancelIcon />}
            label={calculation.status === 'ELIGIBLE' ? '적격' : '부적격'}
            color={calculation.status === 'ELIGIBLE' ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {calculation.loanProductName}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
              월 여유자금
            </Typography>
            <Typography
              variant="h6"
              color={calculation.monthlyAvailableFunds >= 0 ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 700 }}
            >
              {formatCurrency(calculation.monthlyAvailableFunds)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
            {formatDate(calculation.calculatedAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CalculationResultCard;
