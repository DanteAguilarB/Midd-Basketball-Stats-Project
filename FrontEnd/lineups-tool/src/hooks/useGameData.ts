import { useState, useEffect } from 'react';

export interface LineupData {
  display_lineup: string;
  posessions: number;
  points_for: number;
  oreb: number;
  dreb: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgm: number;
  fga: number;
  three_ptr_made: number;
  three_ptr_attempted: number;
  three_ptr_pct: number;
  ftm: number;
  fta: number;
  ft_pct: number;
  shots_in_paint_made: number;
  shots_in_paint_attempted: number;
  points_in_paint: number;
  fastbreak_made: number;
  fastbreak_attempted: number;
  fastbreak_points: number;
  [key: string]: unknown; // Allow additional properties
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'number' | 'percentage' | 'text' | 'plusMinus';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface PlayerData {
  name: string;
  rebounds: {
    offensive: number;
    defensive: number;
    total: number;
  };
  plusMinus: number;
}

export interface TeamData {
  rebounds: {
    offensive: number;
    defensive: number;
    total: number;
  };
}

export interface GameData {
  lineups: LineupData[];
  players: PlayerData[];
  teams: {
    home: TeamData;
    away: TeamData;
  };
  summary: {
    totalLineups: number;
    bestLineup: {
      lineup: string;
      plusMinus: number;
      rebounds: {
        offensive: number;
        defensive: number;
        total: number;
      };
    };
  };
  columns?: TableColumn[]; // Optional dynamic columns
}

// Static column configuration for lineup stats
export const defaultColumns: TableColumn[] = [
  { key: 'display_lineup', label: 'LINEUP', type: 'text', align: 'left' },
  { key: 'posessions', label: 'POSS', type: 'number', align: 'center' },
  { key: 'points_for', label: 'PTS', type: 'number', align: 'center' },
  { key: 'oreb', label: 'OREB', type: 'number', align: 'center' },
  { key: 'dreb', label: 'DREB', type: 'number', align: 'center' },
  { key: 'rebounds', label: 'REB', type: 'number', align: 'center' },
  { key: 'assists', label: 'AST', type: 'number', align: 'center' },
  { key: 'steals', label: 'STL', type: 'number', align: 'center' },
  { key: 'blocks', label: 'BLK', type: 'number', align: 'center' },
  { key: 'turnovers', label: 'TO', type: 'number', align: 'center' },
  { key: 'fouls', label: 'FOULS', type: 'number', align: 'center' },
  { key: 'fgm', label: 'FGM', type: 'number', align: 'center' },
  { key: 'fga', label: 'FGA', type: 'number', align: 'center' },
  { key: 'three_ptr_made', label: '3PM', type: 'number', align: 'center' },
  { key: 'three_ptr_attempted', label: '3PA', type: 'number', align: 'center' },
  { key: 'three_ptr_pct', label: '3PT%', type: 'percentage', align: 'center' },
  { key: 'ftm', label: 'FTM', type: 'number', align: 'center' },
  { key: 'fta', label: 'FTA', type: 'number', align: 'center' },
  { key: 'ft_pct', label: 'FT%', type: 'percentage', align: 'center' },
  { key: 'shots_in_paint_made', label: 'PAINT MADE', type: 'number', align: 'center' },
  { key: 'shots_in_paint_attempted', label: 'PAINT ATT', type: 'number', align: 'center' },
  { key: 'points_in_paint', label: 'PAINT PTS', type: 'number', align: 'center' },
  { key: 'fastbreak_made', label: 'FB MADE', type: 'number', align: 'center' },
  { key: 'fastbreak_attempted', label: 'FB ATT', type: 'number', align: 'center' },
  { key: 'fastbreak_points', label: 'FB PTS', type: 'number', align: 'center' }
];

export const useGameData = () => {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        
        // Fetch lineup data from the API
        const lineupResponse = await fetch('http://localhost:3001/api/lineup-data');
        
        if (!lineupResponse.ok) {
          throw new Error('Failed to fetch data from server');
        }
        
        const lineupData = await lineupResponse.json();
        
        // Transform the data to match our frontend interface
        const transformedLineups = lineupData.lineups.map((lineup: Record<string, unknown>) => ({
          // Map all the required fields
          display_lineup: lineup.display_lineup || '',
          posessions: lineup.posessions || 0,
          points_for: lineup.points_for || 0,
          oreb: lineup.oreb || 0,
          dreb: lineup.dreb || 0,
          rebounds: lineup.rebounds || 0,
          assists: lineup.assists || 0,
          steals: lineup.steals || 0,
          blocks: lineup.blocks || 0,
          turnovers: lineup.turnovers || 0,
          fouls: lineup.fouls || 0,
          fgm: lineup.fgm || 0,
          fga: lineup.fga || 0,
          three_ptr_made: lineup.three_ptr_made || 0,
          three_ptr_attempted: lineup.three_ptr_attempted || 0,
          three_ptr_pct: parseFloat((lineup.three_ptr_pct as string) || '0') || 0,
          ftm: lineup.ftm || 0,
          fta: lineup.fta || 0,
          ft_pct: parseFloat((lineup.ft_pct as string) || '0') || 0,
          shots_in_paint_made: lineup.shots_in_paint_made || 0,
          shots_in_paint_attempted: lineup.shots_in_paint_attempted || 0,
          points_in_paint: lineup.points_in_paint || 0,
          fastbreak_made: lineup.fastbreak_made || 0,
          fastbreak_attempted: lineup.fastbreak_attempted || 0,
          fastbreak_points: lineup.fastbreak_points || 0,
          // Include all other fields dynamically
          ...lineup
        }));
        
        const gameData: GameData = {
          lineups: transformedLineups,
          players: [], // We'll fetch this separately if needed
          teams: {
            home: {
              rebounds: { offensive: 0, defensive: 0, total: 0 }
            },
            away: {
              rebounds: { offensive: 0, defensive: 0, total: 0 }
            }
          },
          summary: {
            totalLineups: lineupData.total || transformedLineups.length,
            bestLineup: {
              lineup: transformedLineups.length > 0 ? transformedLineups[0].display_lineup : "No data available",
              plusMinus: transformedLineups.length > 0 ? (transformedLineups[0].points_for || 0) - (transformedLineups[0].points_against || 0) : 0,
              rebounds: { offensive: 0, defensive: 0, total: 0 }
            }
          },
          columns: defaultColumns
        };
        
        setData(gameData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching game data:', err);
        
        // Fallback to empty data structure
        const fallbackData: GameData = {
          lineups: [],
          players: [],
          teams: {
            home: {
              rebounds: { offensive: 0, defensive: 0, total: 0 }
            },
            away: {
              rebounds: { offensive: 0, defensive: 0, total: 0 }
            }
          },
          summary: {
            totalLineups: 0,
            bestLineup: {
              lineup: "No data available",
              plusMinus: 0,
              rebounds: { offensive: 0, defensive: 0, total: 0 }
            }
          },
          columns: defaultColumns
        };
        
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, []);

  return { data, loading, error };
};
