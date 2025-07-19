import React, { useState, useMemo, useEffect } from 'react';
import { Slider } from '@mui/material';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';

const POSITIONS = ['goalkeeper', 'field'];

const REQUIRED = { GK: 1, OUTFIELD: 6 };

const BudgetTestTab = () => {
  const [budget, setBudget] = useState(50);
  const [maxPrice, setMaxPrice] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [sort, setSort] = useState<'price' | 'name'>('price');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        let url = '/api/budgetplayers?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (positionFilter !== 'ALL') url += `position=${positionFilter}&`;
        if (maxPrice < 10) url += `maxPrice=${maxPrice}&`;
        const token = localStorage.getItem('authToken');
        const res = await fetch(url, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setPlayers(data);
      } catch (e) {
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [search, positionFilter, maxPrice]);

  const sortedPlayers = useMemo(() => {
    if (!Array.isArray(players)) return [];

    const arr = [...players];
    arr.sort((a, b) =>
      sort === 'price' ? b.price - a.price : a.name.localeCompare(b.name)
    );
    return arr;
  }, [players, sort]);

  const selectedPlayers = useMemo(
    () =>
      Array.isArray(players)
        ? players.filter((p) => selected.includes(String(p.id)))
        : [],
    [selected, players]
  );

  const totalCost = selectedPlayers.reduce((sum, p) => sum + p.price, 0);

  const gkCount = selectedPlayers.filter(
    (p) => p.position === 'goalkeeper'
  ).length;
  const outfieldCount = selectedPlayers.length - gkCount;

  const canSelect = (player: any) => {
    const pid = String(player.id);
    if (selected.includes(pid)) return true;
    if (totalCost + player.price > budget) return false;
    if (player.position === 'goalkeeper' && gkCount >= REQUIRED.GK)
      return false;
    if (player.position !== 'goalkeeper' && outfieldCount >= REQUIRED.OUTFIELD)
      return false;
    return true;
  };

  const handleSelect = (player: any) => {
    const pid = String(player.id);
    if (selected.includes(pid)) {
      setSelected(selected.filter((id) => id !== pid));
    } else if (canSelect(player)) {
      setSelected([...selected, pid]);
    }
  };

  const handleReset = () => setSelected([]);

  const isValid =
    gkCount === REQUIRED.GK &&
    outfieldCount === REQUIRED.OUTFIELD &&
    totalCost <= budget;

  return (
    <Box sx={{ p: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {/* Selected Team (left) */}
      <Paper sx={{ p: 2, minWidth: 320, flex: '0 0 340px' }}>
        <Typography variant='h6' gutterBottom>
          Selected Team
        </Typography>
        <Divider sx={{ my: 1 }} />
        {selectedPlayers.length === 0 ? (
          <Typography color='text.secondary'>No players selected.</Typography>
        ) : (
          <Box>
            {selectedPlayers.map((p) => (
              <Typography key={p.id}>
                {p.name} ({p.position}) - {p.price}M
              </Typography>
            ))}
            <Divider sx={{ my: 1 }} />
            <Typography>Total Cost: {totalCost}M</Typography>
            <Typography color={isValid ? 'success.main' : 'error'}>
              {isValid ? 'Valid team!' : 'Team incomplete or over budget.'}
            </Typography>
          </Box>
        )}
        <Button onClick={handleReset} variant='outlined' sx={{ mt: 2 }}>
          Reset
        </Button>
      </Paper>
      {/* Player Pool (right) */}
      <Box sx={{ flex: 1 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <TextField
              label='Total Budget (M)'
              type='number'
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              inputProps={{ min: 1, max: 100 }}
              sx={{ width: 160 }}
            />
            <TextField
              label='Search Player'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 180 }}
            />
            <Box
              sx={{
                minWidth: 200,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <InputLabel sx={{ minWidth: 70 }}>Max Price</InputLabel>
              <Slider
                value={maxPrice}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay='auto'
                onChange={(_, val) => setMaxPrice(val as number)}
                sx={{ width: 120 }}
              />
              <Typography>{maxPrice}M</Typography>
            </Box>
            <InputLabel>Position</InputLabel>
            <Select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              size='small'
              sx={{ minWidth: 120 }}
            >
              <MenuItem value='ALL'>All</MenuItem>
              {POSITIONS.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
            <InputLabel>Sort</InputLabel>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              size='small'
              sx={{ minWidth: 120 }}
            >
              <MenuItem value='price'>Price</MenuItem>
              <MenuItem value='name'>Name</MenuItem>
            </Select>
            <Typography color={totalCost > budget ? 'error' : 'primary'}>
              Remaining: {budget - totalCost}M
            </Typography>
            <Typography>Selected: {selectedPlayers.length} / 7</Typography>
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant='subtitle1' gutterBottom>
            Player Pool
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {sortedPlayers.map((player) => (
                <Box
                  key={player.id}
                  sx={{
                    width: 220,
                    border: '1px solid #eee',
                    borderRadius: 2,
                    p: 1,
                    m: 0.5,
                    bgcolor: selected.includes(String(player.id))
                      ? '#e3f2fd'
                      : '#fff',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selected.includes(String(player.id))}
                        onChange={() => handleSelect(player)}
                        disabled={
                          !canSelect(player) &&
                          !selected.includes(String(player.id))
                        }
                      />
                    }
                    label={
                      <>
                        <b>{player.name}</b> <br />
                        <span>{player.position}</span> |{' '}
                        <span>{player.price}M</span>
                      </>
                    }
                  />
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default BudgetTestTab;
