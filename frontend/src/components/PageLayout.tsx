import React from 'react';
import { Card, Stack, StackProps } from '@mui/material';

export function PageLayout({ children, ...props }: StackProps) {
  return (
    <Card>
      <Stack p={3} spacing={3} {...props}>
        {children}
      </Stack>
    </Card>
  );
}
