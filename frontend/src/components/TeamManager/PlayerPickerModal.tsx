import React, { useState, useMemo } from 'react';
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
  TextField,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
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
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = players.filter((p) => !alreadyPickedIds.includes(p.id));
    
    // Apply position filtering
    if (requiredPosition === PlayerPosition.GOALKEEPER) {
      result = result.filter((p) => p.position === PlayerPosition.GOALKEEPER);
    } else if (requiredPosition === undefined) {
      // For field positions, exclude goalkeepers
      result = result.filter((p) => p.position !== PlayerPosition.GOALKEEPER);
    }
    
    // Apply search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.club.name.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [players, alreadyPickedIds, requiredPosition, searchQuery]);

  const handlePickPlayer = (player: Player) => {
    onPick(player);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Pick Player{requiredPosition ? ` (${requiredPosition})` : ' (Field)'}
        <IconButton onClick={handleClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='Search players by name or club...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>
        {filtered.length === 0 ? (
          <Typography color='text.secondary' align='center' sx={{ py: 2 }}>
            {searchQuery.trim() 
              ? 'No players found matching your search.'
              : 'No available players for this position.'
            }
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
