const { Pool } = require('pg');
const pool = require('./connection');

class DatabaseUtils {
  constructor() {
    this.pool = pool;
  }

  // Get all available columns from lineup_game_stats table
  async getTableColumns() {
    try {
      const query = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'lineup_game_stats' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const result = await this.pool.query(query);
      
      // Map database columns to frontend-friendly format
      const columnMapping = {
        'lineup_id': { label: 'ID', type: 'number', align: 'center' },
        'team_id': { label: 'Team ID', type: 'number', align: 'center' },
        'display_lineup': { label: 'LINEUP', type: 'text', align: 'left' },
        'game_id': { label: 'Game ID', type: 'number', align: 'center' },
        'posessions': { label: 'POSS', type: 'number', align: 'center' },
        'points_for': { label: 'PTS', type: 'number', align: 'center' },
        'points_against': { label: 'PTS AGAINST', type: 'number', align: 'center' },
        'oreb': { label: 'OREB', type: 'number', align: 'center' },
        'dreb': { label: 'DREB', type: 'number', align: 'center' },
        'rebounds': { label: 'REB', type: 'number', align: 'center' },
        'assists': { label: 'AST', type: 'number', align: 'center' },
        'steals': { label: 'STL', type: 'number', align: 'center' },
        'blocks': { label: 'BLK', type: 'number', align: 'center' },
        'turnovers': { label: 'TO', type: 'number', align: 'center' },
        'fouls': { label: 'FOULS', type: 'number', align: 'center' },
        'fgm': { label: 'FGM', type: 'number', align: 'center' },
        'fga': { label: 'FGA', type: 'number', align: 'center' },
        'fg_pct': { label: 'FG%', type: 'percentage', align: 'center' },
        'three_ptr_made': { label: '3PM', type: 'number', align: 'center' },
        'three_ptr_attempted': { label: '3PA', type: 'number', align: 'center' },
        'three_ptr_pct': { label: '3PT%', type: 'percentage', align: 'center' },
        'ftm': { label: 'FTM', type: 'number', align: 'center' },
        'fta': { label: 'FTA', type: 'number', align: 'center' },
        'ft_pct': { label: 'FT%', type: 'percentage', align: 'center' },
        'shots_in_paint_made': { label: 'PAINT MADE', type: 'number', align: 'center' },
        'shots_in_paint_attempted': { label: 'PAINT ATT', type: 'number', align: 'center' },
        'points_in_paint': { label: 'PAINT PTS', type: 'number', align: 'center' },
        'fastbreak_attempted': { label: 'FB ATT', type: 'number', align: 'center' },
        'fastbreak_made': { label: 'FB MADE', type: 'number', align: 'center' },
        'fastbreak_points': { label: 'FB PTS', type: 'number', align: 'center' }
      };

      // Filter out system columns and map to frontend format
      const frontendColumns = result.rows
        .filter(row => !['id', 'created_at'].includes(row.column_name))
        .map(row => {
          const mapping = columnMapping[row.column_name];
          if (mapping) {
            return {
              key: row.column_name,
              label: mapping.label,
              type: mapping.type,
              align: mapping.align,
              dataType: row.data_type
            };
          }
          return null;
        })
        .filter(Boolean);

      return frontendColumns;
    } catch (error) {
      console.error('Error fetching table columns:', error);
      throw error;
    }
  }

  // Get all players for a specific team
  async getPlayersByTeam(teamName) {
    try {
      const query = `
        SELECT p.id, p.first_name, p.last_name
        FROM players p
        JOIN teams t ON p.team_id = t.id
        WHERE t.name = $1 AND p.active = true
        ORDER BY p.last_name, p.first_name;
      `;
      
      const result = await this.pool.query(query, [teamName]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  // Get all teams
  async getAllTeams() {
    try {
      const query = `
        SELECT id, name, conference
        FROM teams
        ORDER BY name;
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Get lineup data by player names (flexible search)
  async getLineupsByPlayers(playerNames, teamName) {
    try {
      // Filter out empty player names
      const validPlayerNames = playerNames.filter(name => name && name.trim() !== '');
      
      if (validPlayerNames.length === 0) {
        throw new Error('No valid players provided');
      }
      
      // First, get the team ID
      const teamResult = await this.pool.query(
        'SELECT id FROM teams WHERE name = $1',
        [teamName]
      );
      
      if (teamResult.rows.length === 0) {
        throw new Error(`Team ${teamName} not found`);
      }
      
      const teamId = teamResult.rows[0].id;
      
      // Get player IDs for the given names
      const playerIds = [];

    //   console.log('validPlayerNames:', validPlayerNames);
      
      for (const fullName of validPlayerNames) {
        const parts = fullName.trim().split(' ');
        const firstName = parts[1]; 
        const lastName = parts[0];
        
        const playerResult = await this.pool.query(
          'SELECT id FROM players WHERE team_id = $1 AND first_name = $2 AND last_name = $3',
          [teamId, firstName, lastName]
        );
        
        if (playerResult.rows.length > 0) {
          playerIds.push(playerResult.rows[0].id);
        } else {
            throw new Error(`Player ${firstName} ${lastName} not found`);
        }
      }
      
      // For return output
      const sortedPlayerIds = [...playerIds].sort((a, b) => a - b);
      
      // Find the lineups
      if (playerIds.length === 0) {
        return null; // No players found
      }
      
      const lineupsResult = await this.pool.query(`
        SELECT lp.lineup_id
        FROM lineup_players lp
        WHERE lp.player_id IN (${sortedPlayerIds.join(',')})
        GROUP BY lp.lineup_id
        HAVING COUNT(DISTINCT lp.player_id) = ${sortedPlayerIds.length}
        `);
      
      if (lineupsResult.rows.length === 0) {
        return null; // Lineups not found
      }

      // Get the stats for the lineups
      let statsResults = [];

      for (const lineup of lineupsResult.rows) {
        const lineupId = lineup.lineup_id;
        const statsResult = await this.pool.query(`
            SELECT display_lineup, posessions, points_for, oreb, dreb, rebounds, assists, steals, blocks, turnovers, fouls, fgm, fga, three_ptr_made, three_ptr_attempted, three_ptr_pct, ftm, fta, ft_pct, shots_in_paint_made, shots_in_paint_attempted, points_in_paint, fastbreak_made, fastbreak_attempted, fastbreak_points
            FROM lineup_game_stats
            WHERE lineup_id = $1
        `, [lineupId]);
        statsResults.push(statsResult.rows);
      }
      
      return {
        lineupIds: lineupsResult.rows.map(row => row.lineup_id),
        teamName,
        playerIds: sortedPlayerIds,
        gameStats: statsResults
      };
    } catch (error) {
      console.error('Error fetching lineup by players:', error);
      throw error;
    }
  }

  // Get all lineup data with pagination and filtering
  async getLineupData(filters = {}) {
    try {
      let query = `
        SELECT 
          lgs.*,
          t.name as team_name,
          g.game_date,
          g.season
        FROM lineup_game_stats lgs
        JOIN teams t ON lgs.team_id = t.id
        JOIN games g ON lgs.game_id = g.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      // Add filters
      if (filters.team) {
        paramCount++;
        query += ` AND t.name = $${paramCount}`;
        params.push(filters.team);
      }
      
      if (filters.season) {
        paramCount++;
        query += ` AND g.season = $${paramCount}`;
        params.push(filters.season);
      }
      
      if (filters.minGames) {
        paramCount++;
        query += ` AND lgs.lineup_id IN (
          SELECT lineup_id 
          FROM lineup_game_stats 
          GROUP BY lineup_id 
          HAVING COUNT(*) >= $${paramCount}
        )`;
        params.push(filters.minGames);
      }
      
      // Add ordering and pagination
      query += ` ORDER BY g.game_date DESC`;
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }
      
      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }
      
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching lineup data:', error);
      throw error;
    }
  }

  // Get aggregated lineup stats
  async getAggregatedLineupStats(filters = {}) {
    try {
      let query = `
        SELECT 
          la.*,
          t.name as team_name,
          l.display_lineup
        FROM lineup_aggregates la
        JOIN lineups l ON la.lineup_id = l.id
        JOIN teams t ON l.team_id = t.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      // Add filters
      if (filters.team) {
        paramCount++;
        query += ` AND t.name = $${paramCount}`;
        params.push(filters.team);
      }
      
      if (filters.minGames) {
        paramCount++;
        query += ` AND la.games_played >= $${paramCount}`;
        params.push(filters.minGames);
      }
      
      query += ` ORDER BY la.points_for DESC`;
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }
      
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching aggregated lineup stats:', error);
      throw error;
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      return { connected: true, timestamp: result.rows[0].now };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  // Close database connection
  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseUtils();
