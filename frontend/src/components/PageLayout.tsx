import React from 'react';
import { Stack, StackProps } from '@mui/material';

export function PageLayout({ children, ...props }: StackProps) {
  return (
    <Stack spacing={2} {...props}>
      {children}
    </Stack>
  );
}
