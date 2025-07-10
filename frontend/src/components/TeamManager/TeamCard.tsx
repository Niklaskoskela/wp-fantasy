import React from 'react';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Player, PlayerPosition } from 'shared';
import { TeamPlayerSlot } from './TeamPlayerSlot';

interface Team {
  id: string;
  teamName: string;
  players: Player[];
  teamCaptain?: Player;
}

interface TeamCardProps {
  team: Team;
  expanded: boolean;
  slots: (Player | null)[];
  captainId?: string;
  onToggleExpand: () => void;
  onPickPlayer: (slotIndex: number, position?: PlayerPosition) => void;
  onRemovePlayer: (slotIndex: number) => void;
  onSetCaptain: (playerId: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  canEdit?: boolean;
}

export function TeamCard({
  team,
  expanded,
  slots,
  captainId,
  onToggleExpand,
  onPickPlayer,
  onRemovePlayer,
  onSetCaptain,
  onSave,
  isSaving = false,
  canEdit = false,
}: TeamCardProps) {
  const getTeamStats = () => {
    const filledSlots = slots.filter(Boolean).length;
    const hasCaptain = !!captainId;
    return { filledSlots, hasCaptain };
  };

  const { filledSlots, hasCaptain } = getTeamStats();

  const getRequiredPosition = (
    slotIndex: number
  ): PlayerPosition | undefined => {
    // First slot should be goalkeeper if no goalkeeper exists in the team
    if (
      slotIndex === 0 &&
      !slots.some((p) => p?.position === PlayerPosition.GOALKEEPER)
    ) {
      return PlayerPosition.GOALKEEPER;
    }
    // For slots 1-6, we want field players (exclude goalkeepers)
    // Return undefined to indicate field position filtering
    return undefined;
  };

  return (
    <React.Fragment>
      <ListItem sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 1 }}>
        <ListItemButton onClick={onToggleExpand}>
          <ListItemText
            primary={
              <Box display='flex' alignItems='center' gap={2}>
                <Typography variant='h6'>{team.teamName}</Typography>
                <Stack direction='row' spacing={1}>
                  <Chip
                    label={`${filledSlots}/7 players`}
                    size='small'
                    color={filledSlots === 7 ? 'success' : 'default'}
                  />
                  {hasCaptain && (
                    <Chip label='Captain set' size='small' color='primary' />
                  )}
                </Stack>
              </Box>
            }
          />
          <IconButton edge='end' size='small'>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItemButton>
      </ListItem>

      <Collapse in={expanded} timeout='auto' unmountOnExit>
        <Box sx={{ pl: 2, pr: 2, pb: 3 }}>
          <Stack spacing={2}>
            {slots.map((player, index) => (
              <TeamPlayerSlot
                key={index}
                slotIndex={index}
                player={player}
                captainId={captainId}
                onPickPlayer={
                  canEdit
                    ? () => onPickPlayer(index, getRequiredPosition(index))
                    : () => {}
                }
                onRemovePlayer={
                  canEdit ? () => onRemovePlayer(index) : () => {}
                }
                onSetCaptain={canEdit ? onSetCaptain : () => {}}
                isGoalkeeperSlot={
                  index === 0 &&
                  !slots.some((p) => p?.position === PlayerPosition.GOALKEEPER)
                }
                canEdit={canEdit}
              />
            ))}

            {canEdit && (
              <Box sx={{ pt: 2 }}>
                <Button
                  variant='contained'
                  onClick={onSave}
                  disabled={isSaving}
                  size='large'
                  fullWidth
                >
                  {isSaving ? 'Saving...' : 'Save Team'}
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </React.Fragment>
  );
}
