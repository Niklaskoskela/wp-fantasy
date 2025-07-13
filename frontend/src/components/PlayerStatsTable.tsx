import React, { useState, useMemo, CSSProperties } from 'react';
import { PlayerStatsWithDetails } from '../types/playerStats';

interface PlayerStatsTableProps {
  stats: PlayerStatsWithDetails[];
  loading?: boolean;
  onPlayerClick?: (playerId: number) => void;
  searchTerm?: string;
}

type SortField = keyof PlayerStatsWithDetails;
type SortDirection = 'asc' | 'desc';

const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({
  stats,
  loading = false,
  onPlayerClick,
  searchTerm = '',
}) => {
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedStats = useMemo(() => {
    if (!stats) return [];

    const filteredStats = stats.filter(
      (stat) =>
        stat.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredStats.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;

      const comparison = (aValue ?? 0) > (bValue ?? 0) ? 1 : -1;
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [stats, sortField, sortDirection, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <div style={styles.centerText}>Loading...</div>;
  }

  if (!stats || stats.length === 0) {
    return <div style={styles.centerText}>No player stats found</div>;
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={styles.th}>Player</th>
            <th style={styles.th}>Team</th>
            {[
              'points',
              'goals',
              'assists',
              'blocks',
              'steals',
              'saves',
              'shots',
            ].map((field) => (
              <th
                key={field}
                style={{ ...styles.th, ...styles.sortable }}
                onClick={() => handleSort(field as SortField)}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}{' '}
                {getSortIcon(field as SortField)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedStats.map((stat) => (
            <tr
              key={stat.id}
              style={onPlayerClick ? styles.clickableRow : undefined}
              onClick={() => onPlayerClick && onPlayerClick(stat.player_id)}
            >
              <td style={styles.td}>
                {stat.player_name || `Player ${stat.player_id}`}
              </td>
              <td style={styles.td}>{stat.team_name || 'Unknown'}</td>
              <td style={{ ...styles.td, ...styles.highlight }}>
                {stat.points}
              </td>
              <td style={styles.td}>{stat.goals}</td>
              <td style={styles.td}>{stat.assists}</td>
              <td style={styles.td}>{stat.blocks}</td>
              <td style={styles.td}>{stat.steals}</td>
              <td style={styles.td}>{stat.saves}</td>
              <td style={styles.td}>{stat.shots}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ------------------------
// ✅ Inline CSS Styles
// ------------------------

const styles: { [key: string]: CSSProperties } = {
  container: {
    overflowX: 'auto',
    marginTop: '1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
  },
  thead: {
    backgroundColor: '#f5f5f5',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #ccc',
    fontWeight: 600,
    fontSize: '14px',
    userSelect: 'none',
  },
  td: {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  sortable: {
    cursor: 'pointer',
  },
  clickableRow: {
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  centerText: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '1rem',
  },
};

export default PlayerStatsTable;
