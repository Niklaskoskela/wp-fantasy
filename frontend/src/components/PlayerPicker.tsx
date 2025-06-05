import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { Player } from '../../../shared/dist/types';

interface PlayerPickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (player: Player) => void;
  players: Player[];
  alreadyPickedIds: string[];
  requiredPosition?: string;
}

export function PlayerPicker({
  open,
  onClose,
  onPick,
  players,
  alreadyPickedIds,
  requiredPosition,
}: PlayerPickerProps) {
  const filtered = requiredPosition
    ? players.filter(
        (p) =>
          p.position === requiredPosition && !alreadyPickedIds.includes(p.id)
      )
    : players.filter((p) => !alreadyPickedIds.includes(p.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        Pick Player{requiredPosition ? ` (${requiredPosition})` : ''}
      </DialogTitle>
      <DialogContent>
        {filtered.length === 0 ? (
          <Typography>No available players.</Typography>
        ) : (
          <List>
            {filtered.map((player) => (
              <ListItem key={player.id} disablePadding>
                <ListItemButton onClick={() => onPick(player)}>
                  <ListItemText
                    primary={player.name}
                    secondary={player.position}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
