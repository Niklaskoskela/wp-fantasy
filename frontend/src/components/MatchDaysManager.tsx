import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { MatchDayManager } from './MatchDayManager';
import { PlayerStatsUpdater } from './PlayerStatsUpdater';
import { PointsCalculator } from './PointsCalculator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`matchday-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function MatchDaysManager() {
  const [selectedMatchDay, setSelectedMatchDay] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleSelectMatchDay = (matchDayId: string, title: string) => {
    setSelectedMatchDay({ id: matchDayId, title });
    setActiveTab(1); // Switch to stats tab when a match day is selected
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Match Days Management
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box sx={{ flex: { xs: 1, md: '0 0 33%' } }}>
          <MatchDayManager
            onSelectMatchDay={handleSelectMatchDay}
            selectedMatchDayId={selectedMatchDay?.id}
          />
        </Box>

        <Box sx={{ flex: { xs: 1, md: '0 0 67%' } }}>
          {selectedMatchDay ? (
            <Paper sx={{ p: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
              >
                <Tab label='Player Stats' />
                <Tab label='Calculate Points' />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <PlayerStatsUpdater
                  matchDayId={selectedMatchDay.id}
                  matchDayTitle={selectedMatchDay.title}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <PointsCalculator
                  matchDayId={selectedMatchDay.id}
                  matchDayTitle={selectedMatchDay.title}
                />
              </TabPanel>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='h6' color='text.secondary'>
                Select a Match Day
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Choose a match day from the left panel to update player stats
                and calculate points
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
