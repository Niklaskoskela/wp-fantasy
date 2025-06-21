import React from 'react';
import { render, screen } from '@testing-library/react';
import { MatchDayInfo } from '../MatchDayInfo';
import { MatchDay, RosterHistory } from '../../../../shared/dist/types';

// Mock the content API
jest.mock('../../api/contentApi', () => ({
  useGetPlayersQuery: () => ({
    data: [
      { id: 'player1', name: 'John Doe', position: 'field' },
      { id: 'player2', name: 'Jane Smith', position: 'goalkeeper' },
      { id: 'player3', name: 'Bob Johnson', position: 'field' },
    ],
  }),
}));

const mockMatchDays: MatchDay[] = [
  {
    id: 'md1',
    title: 'Round 1',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T12:00:00Z'),
  },
  {
    id: 'md2',
    title: 'Round 2',
    startTime: new Date('2025-01-01T10:00:00Z'),
    endTime: new Date('2025-01-01T12:00:00Z'),
  },
];

const mockRosterHistory: RosterHistory[] = [
  {
    id: 'rh1',
    teamId: 'team1',
    matchDayId: 'md1',
    playerId: 'player1',
    isCaptain: true,
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: 'rh2',
    teamId: 'team1',
    matchDayId: 'md1',
    playerId: 'player2',
    isCaptain: false,
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
  {
    id: 'rh3',
    teamId: 'team1',
    matchDayId: 'md1',
    playerId: 'player3',
    isCaptain: false,
    createdAt: new Date('2024-01-15T09:00:00Z'),
  },
];

describe('MatchDayInfo', () => {
  it('renders upcoming matchday information', () => {
    render(
      <MatchDayInfo
        matchDays={mockMatchDays}
        isLoadingMatchDays={false}
        lastActiveRoster={null}
        isLoadingRoster={false}
        teamName="Test Team"
      />
    );

    expect(screen.getByText('Next Matchday')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('renders last active roster information', () => {
    render(
      <MatchDayInfo
        matchDays={mockMatchDays}
        isLoadingMatchDays={false}
        lastActiveRoster={mockRosterHistory}
        isLoadingRoster={false}
        teamName="Test Team"
      />
    );

    expect(screen.getByText('Last Active Roster')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Captain')).toBeInTheDocument();
  });

  it('shows no upcoming matchdays message when none exist', () => {
    const pastMatchDays = mockMatchDays.map(md => ({
      ...md,
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T12:00:00Z'),
    }));

    render(
      <MatchDayInfo
        matchDays={pastMatchDays}
        isLoadingMatchDays={false}
        lastActiveRoster={null}
        isLoadingRoster={false}
        teamName="Test Team"
      />
    );

    expect(screen.getByText('No upcoming matchdays scheduled')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(
      <MatchDayInfo
        matchDays={[]}
        isLoadingMatchDays={true}
        lastActiveRoster={null}
        isLoadingRoster={true}
        teamName="Test Team"
      />
    );

    // Should show skeleton loaders
    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(3);
  });
});
