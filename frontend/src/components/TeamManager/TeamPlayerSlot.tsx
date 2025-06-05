import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { Player } from 'shared';

interface TeamPlayerSlotProps {
  slotIndex: number;
  player: Player | null;
  captainId?: string;
  onPickPlayer: () => void;
  onRemovePlayer: () => void;
  onSetCaptain: (playerId: string) => void;
  isGoalkeeperSlot?: boolean;
}

export function TeamPlayerSlot({
  slotIndex,
  player,
  captainId,
  onPickPlayer,
  onRemovePlayer,
  onSetCaptain,
  isGoalkeeperSlot = false,
}: TeamPlayerSlotProps) {
  const getSlotLabel = () => {
    if (isGoalkeeperSlot) return 'Goalkeeper';
    return `Player ${slotIndex + 1}`;
  };

  const isCaptain = player && captainId === player.id;

  return (
    <Box display='flex' alignItems='center' gap={2}>
      <Typography sx={{ width: 100, fontWeight: 'medium' }}>
        {getSlotLabel()}
      </Typography>

      {player ? (
        <Stack direction='row' spacing={2} alignItems='center' sx={{ flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body1' sx={{ fontWeight: 'medium' }}>
              {player.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {player.position} - {player.club?.name || 'No club'}
            </Typography>
          </Box>

          <Stack direction='row' spacing={1}>
            <Button
              size='small'
              variant='outlined'
              color='error'
              onClick={onRemovePlayer}
            >
              Remove
            </Button>
            <Button
              size='small'
              variant={isCaptain ? 'contained' : 'outlined'}
              color={isCaptain ? 'primary' : 'secondary'}
              onClick={() => onSetCaptain(player.id)}
            >
              {isCaptain ? 'Captain' : 'Make Captain'}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Button
          size='small'
          variant='outlined'
          onClick={onPickPlayer}
          sx={{ minWidth: 120 }}
        >
          Pick Player
        </Button>
      )}
    </Box>
  );
}
