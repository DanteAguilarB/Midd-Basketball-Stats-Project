const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function initializeDatabase() {
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database schema created successfully');
    
    // Insert initial data
    await insertInitialData();
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

async function insertInitialData() {
  try {
    // Insert teams
    const teams = [
      { name: 'Middlebury', conference: 'NESCAC' },
      { name: 'Colby', conference: 'NESCAC' }
    ];
    
    for (const team of teams) {
      await pool.query(
        'INSERT INTO teams (name, conference) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [team.name, team.conference]
      );
    }
    
    console.log('Initial data inserted successfully');
  } catch (error) {
    console.error('Error inserting initial data:', error);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
