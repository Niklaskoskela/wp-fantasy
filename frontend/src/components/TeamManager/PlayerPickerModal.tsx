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
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Player, PlayerPosition } from 'shared';

interface PlayerPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (player: Player) => void;
  players: Player[];
  alreadyPickedIds: string[];
  requiredPosition?: PlayerPosition;
}

export function PlayerPickerModal({
  open,
  onClose,
  onPick,
  players,
  alreadyPickedIds,
  requiredPosition,
}: PlayerPickerModalProps) {
  const filtered = requiredPosition
    ? players.filter(
        (p) =>
          p.position === requiredPosition && !alreadyPickedIds.includes(p.id)
      )
    : players.filter((p) => !alreadyPickedIds.includes(p.id));

  const handlePickPlayer = (player: Player) => {
    onPick(player);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Pick Player{requiredPosition ? ` (${requiredPosition})` : ''}
        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {filtered.length === 0 ? (
          <Typography color='text.secondary' align='center' sx={{ py: 2 }}>
            No available players for this position.
          </Typography>
        ) : (
          <List>
            {filtered.map((player) => (
              <ListItem key={player.id} disablePadding>
                <ListItemButton onClick={() => handlePickPlayer(player)}>
                  <ListItemText
                    primary={player.name}
                    secondary={`${player.position} - ${player.club?.name || 'No club'}`}
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
