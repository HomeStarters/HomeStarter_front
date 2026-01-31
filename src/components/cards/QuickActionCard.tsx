import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { QuickAction } from '../../types/dashboard.types';

interface QuickActionCardProps {
  action: QuickAction;
}

// 빠른 작업 카드 컴포넌트
const QuickActionCard = ({ action }: QuickActionCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(action.path);
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {action.icon}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {action.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {action.description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;
