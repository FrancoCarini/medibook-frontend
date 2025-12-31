import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Stack,
  Skeleton,
  Grid
} from '@mui/material';

export const AppointmentCardSkeleton: React.FC = () => {
  return (
    <Grid item xs={12} sm={6} md={6}>
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            {/* Time and Mode */}
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ minHeight: '40px' }}>
              <Skeleton variant="text" width={80} height={32} sx={{ fontSize: '1.4rem' }} />
              <Skeleton variant="rounded" width={90} height={24} />
            </Box>
            
            {/* Doctor name */}
            <Box display="flex" alignItems="center" sx={{ py: 0.5 }}>
              <Skeleton variant="circular" width={20} height={20} sx={{ mr: 2, flexShrink: 0 }} />
              <Skeleton variant="text" width={150} height={26} />
            </Box>
            
            {/* Specialty */}
            <Box display="flex" alignItems="center" sx={{ py: 0.5 }}>
              <Skeleton variant="circular" width={20} height={20} sx={{ mr: 2, flexShrink: 0 }} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
            
            {/* Duration */}
            <Box display="flex" alignItems="center" sx={{ py: 0.5 }}>
              <Skeleton variant="circular" width={20} height={20} sx={{ mr: 2, flexShrink: 0 }} />
              <Skeleton variant="text" width={90} height={20} />
            </Box>
            
            {/* Button */}
            <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 1.5 }} />
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

interface AppointmentSkeletonGroupProps {
  count?: number;
}

export const AppointmentSkeletonGroup: React.FC<AppointmentSkeletonGroupProps> = ({ count = 3 }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Date skeleton */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        
        <Grid container spacing={3}>
          {Array.from({ length: count }).map((_, index) => (
            <AppointmentCardSkeleton key={index} />
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};