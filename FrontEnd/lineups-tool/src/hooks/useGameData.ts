import { useState, useEffect } from 'react';

export interface LineupData {
  lineup: string;
  plusMinus: number;
  rebounds: {
    offensive: number;
    defensive: number;
    total: number;
  };
  team: string;
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
}

export const useGameData = () => {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/game-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const gameData = await response.json();
        setData(gameData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching game data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, []);

  return { data, loading, error };
};
