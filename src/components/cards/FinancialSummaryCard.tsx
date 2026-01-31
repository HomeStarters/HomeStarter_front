import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import type { FinancialSummary } from '../../types/dashboard.types';

interface FinancialSummaryCardProps {
  data: FinancialSummary;
  onClick?: () => void;
}

// 재무 현황 카드 컴포넌트
const FinancialSummaryCard = ({ data, onClick }: FinancialSummaryCardProps) => {
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ko-KR')}원`;
  };

  const summaryItems = [
    {
      label: '총 자산',
      value: data.totalAssets,
      color: 'primary.main',
    },
    {
      label: '총 대출',
      value: data.totalLoans,
      color: 'error.main',
    },
    {
      label: '순자산',
      value: data.netAssets,
      subtitle: '자산 - 대출',
      color: 'success.main',
    },
    {
      label: '월 가용자금',
      value: data.monthlyAvailableFunds,
      subtitle: '월소득 - 월지출',
      color: 'info.main',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        내 재무 현황
      </Typography>
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick
            ? {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
              }
            : {},
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            {summaryItems.map((item, index) => (
              <Grid item xs={6} key={index}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: item.color,
                      fontWeight: 700,
                      fontSize: '1.25rem',
                    }}
                  >
                    {formatCurrency(item.value)}
                  </Typography>
                  {item.subtitle && (
                    <Typography variant="caption" color="text.disabled">
                      {item.subtitle}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialSummaryCard;
