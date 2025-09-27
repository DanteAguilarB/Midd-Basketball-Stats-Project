const express = require('express');
const cors = require('cors');
const path = require('path');
const { analyzeGame } = require('./index.js');
const dbUtils = require('./database/utils');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, 'FrontEnd/lineups-tool/dist')));

// Removed table-columns endpoint - using static columns now

// API endpoint to get players by team
app.get('/api/players/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    const players = await dbUtils.getPlayersByTeam(teamName);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// API endpoint to get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await dbUtils.getAllTeams();
    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// API endpoint to get lineup data with filters
app.get('/api/lineup-data', async (req, res) => {
  try {
    const filters = {
      team: req.query.team,
      season: req.query.season,
      minGames: req.query.minGames ? parseInt(req.query.minGames) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    
    const lineupData = await dbUtils.getLineupData(filters);
    const columns = await dbUtils.getTableColumns();
    
    res.json({
      lineups: lineupData,
      columns,
      total: lineupData.length
    });
  } catch (error) {
    console.error('Error fetching lineup data:', error);
    res.status(500).json({ error: 'Failed to fetch lineup data' });
  }
});

// API endpoint to get aggregated lineup stats
app.get('/api/lineup-aggregates', async (req, res) => {
  try {
    const filters = {
      team: req.query.team,
      minGames: req.query.minGames ? parseInt(req.query.minGames) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 50
    };
    
    const aggregatedData = await dbUtils.getAggregatedLineupStats(filters);
    const columns = await dbUtils.getTableColumns();
    
    res.json({
      lineups: aggregatedData,
      columns,
      total: aggregatedData.length
    });
  } catch (error) {
    console.error('Error fetching aggregated lineup data:', error);
    res.status(500).json({ error: 'Failed to fetch aggregated lineup data' });
  }
});

// API endpoint to get game data (legacy - for backward compatibility)
app.get('/api/game-data', async (req, res) => {
  try {
    console.log('Analyzing game data...');
    const game = await analyzeGame();
    
    // Extract the data we need for the frontend
    const gameData = {
      lineups: [
        // Away lineups (Middlebury)
        ...Object.keys(game.awayLineups).map(lineupKey => ({
          lineup: lineupKey,
          plusMinus: game.awayLineups[lineupKey].plusMinus,
          rebounds: game.awayLineups[lineupKey].rebounds,
          team: 'Middlebury',
          points: game.awayLineups[lineupKey].points,
          assists: game.awayLineups[lineupKey].assists,
          steals: game.awayLineups[lineupKey].steals,
          blocks: game.awayLineups[lineupKey].blocks,
          turnovers: game.awayLineups[lineupKey].turnovers,
          fouls: game.awayLineups[lineupKey].fouls,
          fieldGoals: game.awayLineups[lineupKey].fieldGoals,
          threePointers: game.awayLineups[lineupKey].threePointers,
          freeThrows: game.awayLineups[lineupKey].freeThrows,
          shotsInPaint: game.awayLineups[lineupKey].shotsInPaint,
          pointsInPaint: game.awayLineups[lineupKey].pointsInPaint,
          fastbreakOpportunities: game.awayLineups[lineupKey].fastbreakOpportunities,
          fastBreakPoints: game.awayLineups[lineupKey].fastBreakPoints
        })),
        // Home lineups (Hamilton)
        ...Object.keys(game.homeLineups).map(lineupKey => ({
          lineup: lineupKey,
          plusMinus: game.homeLineups[lineupKey].plusMinus,
          rebounds: game.homeLineups[lineupKey].rebounds,
          team: 'Hamilton',
          points: game.homeLineups[lineupKey].points,
          assists: game.homeLineups[lineupKey].assists,
          steals: game.homeLineups[lineupKey].steals,
          blocks: game.homeLineups[lineupKey].blocks,
          turnovers: game.homeLineups[lineupKey].turnovers,
          fouls: game.homeLineups[lineupKey].fouls,
          fieldGoals: game.homeLineups[lineupKey].fieldGoals,
          threePointers: game.homeLineups[lineupKey].threePointers,
          freeThrows: game.homeLineups[lineupKey].freeThrows,
          shotsInPaint: game.homeLineups[lineupKey].shotsInPaint,
          pointsInPaint: game.homeLineups[lineupKey].pointsInPaint,
          fastbreakOpportunities: game.homeLineups[lineupKey].fastbreakOpportunities,
          fastBreakPoints: game.homeLineups[lineupKey].fastBreakPoints
        }))
      ],
      players: {
        away: game.getAwayPlayers(),
        home: game.getHomePlayers()
      },
      teams: {
        home: game.teamStats.home,
        away: game.teamStats.away
      },
      summary: {
        totalLineups: Object.keys(game.awayLineups).length + Object.keys(game.homeLineups).length,
        bestLineup: game.findBestLineup ? game.findBestLineup() : null
      }
    };
    
    res.json(gameData);
  } catch (error) {
    console.error('Error analyzing game:', error);
    res.status(500).json({ error: 'Failed to analyze game data' });
  }
});

// API endpoint to search lineup by player selection
app.post('/api/lineup-search', async (req, res) => {
  try {
    const { players, team } = req.body;
    
    if (!players || players.length === 0) {
      return res.status(400).json({ error: 'At least one player required' });
    }
    
    if (!team) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    
    const lineupData = await dbUtils.getLineupsByPlayers(players, team);
    
    if (!lineupData) {
      return res.status(404).json({ error: 'Lineup not found' });
    }
    
    res.json({
      success: true,
      data: lineupData,
      team: team
    });
  } catch (error) {
    console.error('Error searching lineup:', error);
    res.status(500).json({ error: 'Failed to search lineup' });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'FrontEnd/lineups-tool/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/game-data`);
});
