import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { RecentHousing } from '../../types/dashboard.types';

interface HousingCardProps {
  housing: RecentHousing;
}

// 주택 카드 컴포넌트
const HousingCard = ({ housing }: HousingCardProps) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ko-KR')}원`;
  };

  const handleClick = () => {
    navigate(`/housings/${housing.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {housing.housingName}
          </Typography>
          {housing.isGoal && (
            <Chip
              icon={<StarIcon />}
              label="최종목표"
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Chip label={housing.housingType} size="small" sx={{ mb: 1 }} />
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 0.5 }}>
          {formatCurrency(housing.price)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {housing.fullAddress}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          등록일: {new Date(housing.createdAt).toLocaleDateString('ko-KR')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default HousingCard;
