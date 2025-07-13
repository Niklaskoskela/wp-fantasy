import React, { useState, useEffect, CSSProperties } from 'react';
import { playerStatsApi, Matchday } from '../api/playerStatsApi';
import { PlayerStatsWithDetails } from '../types/playerStats';
import PlayerStatsTable from './PlayerStatsTable';

const PlayerStats: React.FC = () => {
  const [stats, setStats] = useState<PlayerStatsWithDetails[]>([]);
  const [matchdays, setMatchdays] = useState<Matchday[]>([]);
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'matchday' | 'top'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadMatchdays();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      loadAllStats();
    } else if (activeTab === 'matchday' && selectedMatchday) {
      loadMatchdayStats(selectedMatchday);
    } else if (activeTab === 'top') {
      loadTopPerformers();
    }
  }, [activeTab, selectedMatchday]);

  const loadMatchdays = async () => {
    try {
      const response = await playerStatsApi.getAvailableMatchdays();
      console.log('Fetched matchdays:', response.data);
      setMatchdays(response.data);
      if (response.data.length > 0) {
        setSelectedMatchday(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load matchdays');
      console.error('Error loading matchdays:', err);
    }
  };

  const loadAllStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await playerStatsApi.getPlayerStats({ limit: 100 });
      setStats(response.data);
    } catch (err) {
      setError('Failed to load player stats');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchdayStats = async (matchdayId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response =
        await playerStatsApi.getPlayerStatsByMatchday(matchdayId);
      setStats(response.data);
    } catch (err) {
      setError('Failed to load matchday stats');
      console.error('Error loading matchday stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopPerformers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await playerStatsApi.getTopPerformers(undefined, 20);
      setStats(response.data);
    } catch (err) {
      setError('Failed to load top performers');
      console.error('Error loading top performers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (playerId: number) => {
    console.log('Player clicked:', playerId);
  };

  const handleTabChange = (tab: 'all' | 'matchday' | 'top') => {
    setActiveTab(tab);
  };

  const handleMatchdayChange = (matchdayId: number) => {
    setSelectedMatchday(matchdayId);
  };

  const tabs: { label: string; key: 'all' | 'matchday' | 'top' }[] = [
    { label: 'All Players', key: 'all' },
    { label: 'By Matchday', key: 'matchday' },
    { label: 'Top Performers', key: 'top' },
  ];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Player Statistics</h1>

        {/* Tab Navigation */}
        <div style={styles.tabNav}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.key ? styles.tabButtonActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Matchday Selector */}
        {activeTab === 'matchday' && (
          <div style={styles.selectContainer}>
            <label htmlFor='matchday-select' style={styles.label}>
              Select Matchday:
            </label>
            <select
              id='matchday-select'
              value={selectedMatchday || ''}
              onChange={(e) => handleMatchdayChange(Number(e.target.value))}
              style={styles.select}
            >
              <option value=''>Select a matchday</option>
              {matchdays.map((matchday) => (
                <option key={matchday.id} value={matchday.id}>
                  {matchday.name || `Matchday ${matchday.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div style={styles.searchContainer}>
          <label htmlFor='player-search' style={styles.label}>
            Search Players:
          </label>
          <input
            id='player-search'
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by player name or team...'
            style={styles.input}
          />
        </div>

        {/* Error Message */}
        {error && <div style={styles.errorBox}>{error}</div>}
      </div>

      {/* Stats Table */}
      <div style={styles.tableWrapper}>
        <PlayerStatsTable
          stats={stats}
          loading={loading}
          onPlayerClick={handlePlayerClick}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

// ------------------------
// Inline Styles
// ------------------------

const styles: { [key: string]: CSSProperties } = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '2rem',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#222',
    marginBottom: '1rem',
  },
  tabNav: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid #ccc',
    marginBottom: '1.5rem',
  },
  tabButton: {
    padding: '0.5rem 0',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#666',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
  },
  tabButtonActive: {
    color: '#1a73e8',
    borderBottomColor: '#1a73e8',
  },
  selectContainer: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#333',
    marginBottom: '0.5rem',
  },
  select: {
    padding: '0.5rem',
    fontSize: '0.95rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '250px',
  },
  searchContainer: {
    marginBottom: '1.5rem',
  },
  input: {
    padding: '0.5rem',
    fontSize: '0.95rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: '400px',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#ffe5e5',
    border: '1px solid #ff9999',
    color: '#cc0000',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    padding: '1rem',
  },
};

export default PlayerStats;
