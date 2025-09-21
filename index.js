const csv = require('csv-parser');
const fs = require('fs');

// Utility function to extract lead from score string
String.prototype.leadFinder = function() {
  let string = this;
  let lead = "";
  let j = 1;

  for(i = 0; i < string.length; i++){
    if(string[i] == "+"){
      for(j = i+1; j < string.length; j++){
        if(string[j] != ")") {
          lead += string[j];
        }
      }
      break;
    }
  }
  return parseInt(lead);
}

class Game {
  constructor(homeTeam, awayTeam) {
    this.awayFG = 0;
    this.homeFG = 0;
    this.awayFT = 0;
    this.homeFT = 0;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.allEvents = [];
    this.homeLineups = {};
    this.awayLineups = {};
    this.players = {};
    this.teamStats = {
      home: {
        rebounds: {
          offensive: 0,
          defensive: 0,
          total: 0
        },
      },
      away: {
        rebounds: {
          offensive: 0,
          defensive: 0,
          total: 0
        },
      }
    }
    this.currentHomeLineup = [];
    this.currentAwayLineup = [];
    this.homeLead = 0;
    this.awayLead = 0;
    this.currentAwayLineupStats = {
      against: "",
      points: 0,
      posessions: 0,
      rebounds: { offensive: 0, defensive: 0, total: 0 },
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      fieldGoals: { made: 0, attempted: 0 },
      threePointers: { made: 0, attempted: 0 },
      freeThrows: { made: 0, attempted: 0 },
      // Shot locations
      shotsInPaint: {made: 0, attempted: 0},
      pointsInPaint: 0,
      fastbreakOpportunities: {made: 0, attempted: 0},
      fastBreakPoints: 0,
    };

    this.currentHomeLineupStats = {
      against: "",
      points: 0,
      posessions: 0,
      rebounds: { offensive: 0, defensive: 0, total: 0 },
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      fieldGoals: { made: 0, attempted: 0 },
      threePointers: { made: 0, attempted: 0 },
      freeThrows: { made: 0, attempted: 0 },
      // Shot locations
      shotsInPaint: {made: 0, attempted: 0},
      pointsInPaint: 0,
      fastbreakOpportunities: {made: 0, attempted: 0},
      fastBreakPoints: 0,
    };
    this.homePosessions = 0;
    this.awayPosessions = 0;
  }
  // Set the starting lineups
  setStartingLineups(homeLineup, awayLineup) {
    this.currentHomeLineup = [...homeLineup];
    this.currentAwayLineup = [...awayLineup];
    
    // Initialize all starting players
    homeLineup.forEach(player => this.initializePlayerIfNeeded(player, this.homeTeam));
    awayLineup.forEach(player => this.initializePlayerIfNeeded(player, this.awayTeam));
  }

  // Process a single game event
  processEvent(event, eventIndex) {
    // Handle score changes
    this.updateScore(event);
    
    // Handle rebounds
    this.processRebounds(event);
    
    // Handle substitutions
    this.processSubstitutions(event);

    // Handle assists
    this.processAssists(event);

    // Handle turnovers
    this.processTurnovers(event);

    this.processSteals(event);

    this.processBlocks(event);

    this.processFouls(event);  
    
    this.processShots(event);
  }

  // Update score and leads
  updateScore(event) {
      // Away team takes the lead
    if (event["Away Team Score"] && event["Away Team Score"].includes("+")) {
        this.awayLead = event["Away Team Score"].leadFinder();
        this.homeLead = 0;
      }
      // Home team takes the lead
    else if (event["Home Team Score"] && event["Home Team Score"].includes("+")) {
        this.homeLead = event["Home Team Score"].leadFinder();
        this.awayLead = 0;
      } else {
        // Tie game
        this.homeLead = this.awayLead = 0;
    }
  }

  // Process rebounds for the current lineup
  processRebounds(event) {
    // Check Away column for rebounds
    if (event["Away"] && event["Away"].includes("REBOUND")) {
      if(event["Away"].includes("REBOUND OFF")) {
        if(event["Away"].includes("TEAM")) {   
          // Team rebound
          this.teamStats.away.rebounds.offensive++;
        } else {
          const player = event["Away"].replace("REBOUND OFF by ", "").replace(/,/g, " ");
          this.initializePlayerIfNeeded(player, this.awayTeam);
        this.players[player].rebounds.offensive++;
        this.players[player].rebounds.total++;
          this.currentAwayLineupStats.rebounds.offensive++;
          this.currentAwayLineupStats.rebounds.total++;
        }
         
      } else if(event["Away"].includes("REBOUND DEF")) {
        if(event["Away"].includes("TEAM")) {
          // Team rebound
          this.teamStats.away.rebounds.defensive++;
        } else {
          const player = event["Away"].replace("REBOUND DEF by ", "").replace(/,/g, " ");
          this.initializePlayerIfNeeded(player, this.awayTeam);
        this.players[player].rebounds.defensive++;
        this.players[player].rebounds.total++;
          this.currentAwayLineupStats.rebounds.defensive++;
          this.currentAwayLineupStats.rebounds.total++;
        }
      } else if(event["Away"].includes("REBOUND DEADB")) {
        // Team rebound
        this.teamStats.away.rebounds.defensive++;
      }
    }

    // Check Home column for rebounds
    if (event["Home"] && event["Home"].includes("REBOUND")) {
      if(event["Home"].includes("REBOUND OFF")) {
        if(event["Home"].includes("TEAM")) {
          this.teamStats.home.rebounds.offensive++;
        } else {
          const player = event["Home"].replace("REBOUND OFF by ", "").replace(/,/g, " ");
          this.initializePlayerIfNeeded(player, this.homeTeam);
          this.players[player].rebounds.offensive++;
          this.players[player].rebounds.total++;
          this.currentHomeLineupStats.rebounds.offensive++;
        }
      } else if(event["Home"].includes("REBOUND DEF")) {
        if(event["Home"].includes("TEAM")) {
          this.teamStats.home.rebounds.defensive++;
        } else {
          const player = event["Home"].replace("REBOUND DEF by ", "").replace(/,/g, " ");
          this.initializePlayerIfNeeded(player, this.homeTeam);
          this.players[player].rebounds.defensive++;
          this.players[player].rebounds.total++;
          this.currentHomeLineupStats.rebounds.defensive++;
        }
      } else if(event["Home"].includes("REBOUND DEADB")) {
        // Team rebound
        this.teamStats.home.rebounds.defensive++;
      }
      this.currentHomeLineupStats.rebounds.total = this.currentHomeLineupStats.rebounds.offensive + this.currentHomeLineupStats.rebounds.defensive;
    }
  }
  // Process assists for the current lineup
  processAssists(event) {
    // Handle home team assists (Away column)
    if (event["Away"] && event["Away"].includes("ASSIST")) {
      const player = event["Away"].replace("ASSIST by ", "").replace(/,/g, " ");
      
      this.initializePlayerIfNeeded(player, this.awayTeam);
      // Track assists for the player
      this.players[player].assists++;

      // Track assists for the lineup
      this.currentAwayLineupStats.assists++;
    }
    
    // Handle home team assists (Home column)
    if (event["Home"] && event["Home"].includes("ASSIST")) {
      const player = event["Home"].replace("ASSIST by ", "").replace(/,/g, " ");
      
      this.initializePlayerIfNeeded(player, this.homeTeam);
      // Track assists for the player
      this.players[player].assists++;
      this.currentHomeLineupStats.assists++;
    }
  }

  // Process turnovers for the current lineup
  processTurnovers(event) {
    if(event["Away"] && event["Away"].includes("TURNOVER")) {
      const player = event["Away"].replace("TURNOVER by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.awayTeam);
      this.players[player].turnovers++;
      this.currentAwayLineupStats.turnovers++;
    }

    if(event["Home"] && event["Home"].includes("TURNOVER")) {
      const player = event["Home"].replace("TURNOVER by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.homeTeam);
      this.players[player].turnovers++;
      this.currentHomeLineupStats.turnovers++;
    }
  }

  processSteals(event) {
    if(event["Away"] && event["Away"].includes("STEAL")) {
      const player = event["Away"].replace("STEAL by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.awayTeam);
      this.players[player].steals++;
      this.currentAwayLineupStats.steals++;
    }

    if(event["Home"] && event["Home"].includes("STEAL")) {
      const player = event["Home"].replace("STEAL by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.homeTeam);
      this.players[player].steals++;
      this.currentHomeLineupStats.steals++;
    }
  }
  
  processBlocks(event) {
    if(event["Away"] && event["Away"].includes("BLOCK")) {
      const player = event["Away"].replace("BLOCK by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.awayTeam);
      this.players[player].blocks++;
      this.currentAwayLineupStats.blocks++;
    } else if(event["Home"] && event["Home"].includes("BLOCK")) {
      const player = event["Home"].replace("BLOCK by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.homeTeam);
      this.players[player].blocks++;
      this.currentHomeLineupStats.blocks++;
    }
  }

  processFouls(event) {
    if(event["Away"] && event["Away"].includes("FOUL")) {
      const player = event["Away"].replace("FOUL by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.awayTeam);
      this.players[player].fouls++;
      this.currentAwayLineupStats.fouls++;
    }

    if(event["Home"] && event["Home"].includes("FOUL")) {
      const player = event["Home"].replace("FOUL by ", "").replace(/,/g, " ");
      this.initializePlayerIfNeeded(player, this.homeTeam);
      this.players[player].fouls++;
      this.currentHomeLineupStats.fouls++;
    }
  }

  processShots(event) {
    if(event["Home"] && event["Home"].includes("GOOD")) {
      const shotString = this.extractAttributes(event["Home"])
      this.initializePlayerIfNeeded(shotString.player, this.homeTeam);
      this.processMadeShots(shotString, this.homeTeam);
    } else if(event["Away"] && event["Away"].includes("GOOD")) {
      const shotString = this.extractAttributes(event["Away"])
      this.initializePlayerIfNeeded(shotString.player, this.awayTeam);
      this.processMadeShots(shotString, this.awayTeam);
    } else if(event["Home"] && event["Home"].includes("MISS")) {
      const shotString = this.extractAttributes(event["Home"])
      this.initializePlayerIfNeeded(shotString.player, this.homeTeam);
      this.processMissedShots(shotString, this.homeTeam);
    } else if(event["Away"] && event["Away"].includes("MISS")) {
      const shotString = this.extractAttributes(event["Away"])
      this.initializePlayerIfNeeded(shotString.player, this.awayTeam);
      this.processMissedShots(shotString, this.awayTeam);
    }
  }

  extractAttributes(shotString, attributes = []) {
    if(!shotString.includes("(") || !shotString.includes(')')) {
        shotString = shotString.trim();
        const player = this.extractPlayer(shotString);
      return {
        cleanedShotString: shotString,
        attributes: attributes,
        player: player
      };
    }
  
    // Extract the first modifier
    const attributeMatch = shotString.match(/\(([^)]+)\)/);
  
      if(attributeMatch) {
        const attribute = attributeMatch[1].trim();
        const beforeAttribute = shotString.substring(0, attributeMatch.index);
        const afterAttribute = shotString.substring(attributeMatch.index + attributeMatch[0].length);
  
        // Add modifier to the collection
        attributes.push(attribute);
  
        // Recursively process the remaining shot string
        return this.extractAttributes(beforeAttribute + afterAttribute, attributes);
    }

    return {
      cleanedShotString: shotString,
      attributes: attributes
    }
  }

  processAttributes(attribute, shot, team, made) {
    if(made) {
      if(attribute === "fastbreak") {
        if(team === this.awayTeam) {
          this.currentAwayLineupStats.fastbreakOpportunities.made++;
          this.currentAwayLineupStats.fastbreakOpportunities.attempted++;
          this.currentAwayLineupStats.fastBreakPoints += shot === "FT" ? 1 : shot === "3PTR" ? 3 : 2;
        } else {
          this.currentHomeLineupStats.fastbreakOpportunities.made++;
          this.currentHomeLineupStats.fastbreakOpportunities.attempted++;
          this.currentHomeLineupStats.fastBreakPoints += shot === "FT" ? 1 : shot === "3PTR" ? 3 : 2;
        }
      } else if(attribute === "in the paint") {
        if(team === this.awayTeam) {
          this.currentAwayLineupStats.shotsInPaint.made++;
          this.currentAwayLineupStats.shotsInPaint.attempted++;
          this.currentAwayLineupStats.pointsInPaint += shot === "FT" ? 1 : shot === "3PTR" ? 3 : 2;
        } else {
          this.currentHomeLineupStats.shotsInPaint.made++;
          this.currentHomeLineupStats.shotsInPaint.attempted++;
          this.currentHomeLineupStats.pointsInPaint += shot === "FT" ? 1 : shot === "3PTR" ? 3 : 2;
        }
      }
    } else {
      if(attribute === "fastbreak") {
        if(team === this.awayTeam) {
          this.currentAwayLineupStats.fastbreakOpportunities.attempted++;
        } else {
          this.currentHomeLineupStats.fastbreakOpportunities.attempted++;
        }
      }
      if(attribute === "in the paint") {
        if(team === this.awayTeam) {
          this.currentAwayLineupStats.shotsInPaint.attempted++;
        } else {
          this.currentHomeLineupStats.shotsInPaint.attempted++;
        }
      }
    }
  }

  processMadeShots(shotString, team){
    const player = shotString.player;

    // Process attributes
    if(shotString.attributes) {
      for(const attribute of shotString.attributes) {
        this.processAttributes(attribute, shotString.cleanedShotString, team, true);
      }
    }
      if(shotString.cleanedShotString.includes("FT")) {
        this.players[player].freeThrows.made++;
        this.players[player].freeThrows.attempted++;
        if(team === this.awayTeam) {
          this.awayFT++;
          this.processAwayPoints(player, "FT");
          this.currentAwayLineupStats.freeThrows.made++;
          this.currentAwayLineupStats.freeThrows.attempted++;
        } else {
          this.homeFT++;
          this.processHomePoints(player, "FT");
          this.currentHomeLineupStats.freeThrows.made++;
          this.currentHomeLineupStats.freeThrows.attempted++;
        }
      } else if(shotString.cleanedShotString.includes("3PTR")) {
        this.players[player].fieldGoals.made++;
        this.players[player].fieldGoals.attempted++;
        this.players[player].threePointers.made++;
        this.players[player].threePointers.attempted++;
        if(team === this.awayTeam) {
          this.awayFG++;
          this.processAwayPoints(player, "3PTR");
          this.currentAwayLineupStats.fieldGoals.made++;
          this.currentAwayLineupStats.fieldGoals.attempted++;
          this.currentAwayLineupStats.threePointers.made++;
          this.currentAwayLineupStats.threePointers.attempted++;
        } else {
          this.homeFG++;
          this.processHomePoints(player, "3PTR");
          this.currentHomeLineupStats.fieldGoals.made++;
          this.currentHomeLineupStats.fieldGoals.attempted++;
          this.currentHomeLineupStats.threePointers.made++;
          this.currentHomeLineupStats.threePointers.attempted++;
        }
      } else { // Handles 2PTRs
          this.players[player].fieldGoals.made++;
          this.players[player].fieldGoals.attempted++;
          if(team === this.awayTeam) {
            this.awayFG++;
            this.processAwayPoints(player, "2PTR");
            this.currentAwayLineupStats.fieldGoals.made++;
            this.currentAwayLineupStats.fieldGoals.attempted++;
          } else {
            this.homeFG++;
            this.processHomePoints(player, "2PTR");
            this.currentHomeLineupStats.fieldGoals.made++;
            this.currentHomeLineupStats.fieldGoals.attempted++;
          }
      } 
  }
  
  processAwayPoints(player, type){
    if(type === "FT") {
      this.players[player].points++;
      this.currentAwayLineupStats.points++;
    } else if(type === "3PTR") {
      this.players[player].points += 3;
      this.currentAwayLineupStats.points += 3;
    } else {
      this.players[player].points += 2;
      this.currentAwayLineupStats.points += 2;
    }
  }

  processHomePoints(player, type){
    if(type === "FT") {
      this.players[player].points++;
      this.currentHomeLineupStats.points++;
    } else if(type === "3PTR") {
      this.players[player].points += 3;
      this.currentHomeLineupStats.points += 3;
    } else {
      this.players[player].points += 2;
      this.currentHomeLineupStats.points += 2;
    }
  }
  
  processMissedShots(shotString, team) {
    const player = shotString.player;
    // Process attributes
    if(shotString.attributes) {
      for(const attribute of shotString.attributes) {
        this.processAttributes(attribute, shotString.cleanedShotString, team, false);
      }
    }
    if(shotString.cleanedShotString.includes("FT")) {
      // Handle FTs
      this.players[player].freeThrows.attempted++;
      if(team === this.awayTeam) {
        this.awayFT++;
        this.currentAwayLineupStats.freeThrows.attempted++;
      } else {
        this.homeFT++;
        this.currentHomeLineupStats.freeThrows.attempted++;
      }
    } else if(shotString.cleanedShotString.includes("3PTR")) {
      this.players[player].threePointers.attempted++;
      if(team === this.awayTeam) {
        this.awayFG++;
        this.currentAwayLineupStats.threePointers.attempted++;
        this.currentAwayLineupStats.fieldGoals.attempted++;
      } else {
        this.homeFG++;
        this.currentHomeLineupStats.threePointers.attempted++;
        this.currentHomeLineupStats.fieldGoals.attempted++;
      }
    } else {
      this.players[player].fieldGoals.attempted++;
      if(team === this.awayTeam) {
        this.awayFG++;
        this.currentAwayLineupStats.fieldGoals.attempted++;
      } else {
        this.homeFG++;
        this.currentHomeLineupStats.fieldGoals.attempted++;
      }
    }
}

  // Initialize player if they don't exist in the players object
  initializePlayerIfNeeded(playerName, team) {
    if (!this.players[playerName]) {
      this.players[playerName] = {
        name: playerName,
        team: team,
        rebounds: {
          offensive: 0,
          defensive: 0,
          total: 0
        },
        points: 0,
        assists: 0,
        turnovers: 0,
        steals: 0,
        fouls: 0,
        blocks: 0,
        // Shooting stats
        fieldGoals: {made: 0, attempted: 0},
        threePointers: {made: 0, attempted: 0},
        freeThrows: {made: 0, attempted: 0},
        // Advanced Stats
        plusMinus: 0,
        minutesPlayed: 0,
        // Shot locations
        shotsInPaint: {made: 0, attempted: 0},
        pointsInPaint: 0,
        fastbreakOpportunities: {made: 0, attempted: 0},
        fastBreakPoints: 0,
      };
    }
  }
  eventsContainSubs(j){
    if(this.allEvents[j]["Home"].includes("SUB OUT") || this.allEvents[j]["Away"].includes("SUB OUT") || this.allEvents[j]["Home"].includes("SUB IN") || this.allEvents[j]["Away"].includes("SUB IN")) {
      return true;
    }
    return false;
  }

  // Process substitutions for home team
  processSubstitutions(event) {
    if ((event["Away"] || event["Home"]) && (event["Away"].includes("SUB OUT") || event["Home"].includes("SUB OUT")) && !event.processed) {
      // Mark this timestamp as processed to avoid duplicate processing
      event.processed = true;

      // Handle multiple substitutions that might occur at the same time
      // We need to find the current event index in the results array
      let j = -1;
      for (let k = 0; k < this.allEvents.length; k++) {
        if (this.allEvents[k] === event) {
          j = k;
          break;
        }
      }
      
      const awaySubstitutions = [];
      const homeSubstitutions = [];
      
      // Collect all SUB OUT and SUB IN events at the same time
      while (j >= 0 && j < this.allEvents.length && this.allEvents[j]["Time"] === event["Time"] && this.eventsContainSubs(j)) {
        // console.log("events process by subs", this.allEvents[j]);
        // Away team substitutions
        if (this.allEvents[j]["Away"] && this.allEvents[j]["Away"].includes("SUB OUT")) {
          const playerOut = this.allEvents[j]["Away"].replace("SUB OUT by ", "").replace(/,/g, " ");
          awaySubstitutions.push({ type: 'OUT', player: playerOut });
        } else if (this.allEvents[j]["Away"] && this.allEvents[j]["Away"].includes("SUB IN")) {
          const playerIn = this.allEvents[j]["Away"].replace("SUB IN by ", "").replace(/,/g, " ");
          awaySubstitutions.push({ type: 'IN', player: playerIn });
        }
        // Home team substitutions
        if (this.allEvents[j]["Home"] && this.allEvents[j]["Home"].includes("SUB OUT")) {
          const playerOut = this.allEvents[j]["Home"].replace("SUB OUT by ", "").replace(/,/g, " ");
          homeSubstitutions.push({ type: 'OUT', player: playerOut });
        } else if (this.allEvents[j]["Home"] && this.allEvents[j]["Home"].includes("SUB IN")) {
          const playerIn = this.allEvents[j]["Home"].replace("SUB IN by ", "").replace(/,/g, " ");
          homeSubstitutions.push({ type: 'IN', player: playerIn });
        }
        // Mark all events at this timestamp as processed
        this.allEvents[j].processed = true;
        j++;
      }

      if(awaySubstitutions.length > 0) {
        this.recordAwayLineupPerformance();
        this.applyAwaySubstitutions(awaySubstitutions);
      }
      if(homeSubstitutions.length > 0) {
        this.recordHomeLineupPerformance();
        this.applyHomeSubstitutions(homeSubstitutions);
      }
    }
  }

  // Record the current lineup's plus-minus performance and rebounds
  recordHomeLineupPerformance() {
    const lineupKey = this.currentHomeLineup.join(', ');
    if (!(lineupKey in this.homeLineups)) {
      this.awayLineups[lineupKey].against = this.awayTeam;
      this.homeLineups[lineupKey] = this.currentHomeLineupStats;
    } else {
      this.homeLineups[lineupKey].points += this.currentHomeLineupStats.points;
      this.homeLineups[lineupKey].assists += this.currentHomeLineupStats.assists;
      this.homeLineups[lineupKey].steals += this.currentHomeLineupStats.steals;
      this.homeLineups[lineupKey].blocks += this.currentHomeLineupStats.blocks;
      this.homeLineups[lineupKey].turnovers += this.currentHomeLineupStats.turnovers;
      this.homeLineups[lineupKey].fouls += this.currentHomeLineupStats.fouls;
      this.homeLineups[lineupKey].rebounds.total += this.currentHomeLineupStats.rebounds.total;
      this.homeLineups[lineupKey].rebounds.offensive += this.currentHomeLineupStats.rebounds.offensive;
      this.homeLineups[lineupKey].rebounds.defensive += this.currentHomeLineupStats.rebounds.defensive;
      this.homeLineups[lineupKey].fieldGoals.attempted = this.currentHomeLineupStats.fieldGoals.made;
      this.homeLineups[lineupKey].fieldGoals.attempted = this.currentHomeLineupStats.fieldGoals.attempted;
      this.homeLineups[lineupKey].freeThrows.attempted = this.currentHomeLineupStats.freeThrows.attempted
    this.homeLineups[lineupKey].freeThrows.made = this.currentHomeLineupStats.freeThrows.made;
    }
    this.currentHomeLineupStats = {
      against: "",
      points: 0,
      rebounds: { offensive: 0, defensive: 0, total: 0 },
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      fieldGoals: { made: 0, attempted: 0 },
      threePointers: { made: 0, attempted: 0 },
      freeThrows: { made: 0, attempted: 0 },
      // Shot locations
      shotsInPaint: {made: 0, attempted: 0},
      pointsInPaint: 0,
      fastbreakOpportunities: {made: 0, attempted: 0},
      fastBreakPoints: 0,
    }
  }
recordAwayLineupPerformance() {
  const lineupKey = this.currentAwayLineup.join(', ');
  if (!(lineupKey in this.awayLineups)) {
    this.awayLineups[lineupKey] = this.currentAwayLineupStats;
    this.awayLineups[lineupKey].against = this.homeTeam;
  } else {
    this.awayLineups[lineupKey].points += this.currentAwayLineupStats.points;
    this.awayLineups[lineupKey].assists += this.currentAwayLineupStats.assists;
    this.awayLineups[lineupKey].steals += this.currentAwayLineupStats.steals;
    this.awayLineups[lineupKey].blocks += this.currentAwayLineupStats.blocks;
    this.awayLineups[lineupKey].turnovers += this.currentAwayLineupStats.turnovers;
    this.awayLineups[lineupKey].fouls += this.currentAwayLineupStats.fouls;
    this.awayLineups[lineupKey].rebounds.total += this.currentAwayLineupStats.rebounds.total;
    this.awayLineups[lineupKey].rebounds.offensive += this.currentAwayLineupStats.rebounds.offensive;
    this.awayLineups[lineupKey].rebounds.defensive += this.currentAwayLineupStats.rebounds.defensive;
    this.awayLineups[lineupKey].fieldGoals.made += this.currentAwayLineupStats.fieldGoals.made
    this.awayLineups[lineupKey].fieldGoals.attempted += this.currentAwayLineupStats.fieldGoals.attempted
    this.awayLineups[lineupKey].freeThrows.attempted += this.currentAwayLineupStats.freeThrows.attempted
    this.awayLineups[lineupKey].freeThrows.made += this.currentAwayLineupStats.freeThrows.made;
  }

  this.currentAwayLineupStats = {
    against: "",
    points: 0,
    rebounds: { offensive: 0, defensive: 0, total: 0 },
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    fieldGoals: { made: 0, attempted: 0 },
    threePointers: { made: 0, attempted: 0 },
    freeThrows: { made: 0, attempted: 0 },
    // Shot locations
    shotsInPaint: {made: 0, attempted: 0},
    pointsInPaint: 0,
    fastbreakOpportunities: {made: 0, attempted: 0},
    fastBreakPoints: 0,
  }
};

recordHomeLineupPerformance() {
  const lineupKey = this.currentHomeLineup.join(', ');
  if (!(lineupKey in this.homeLineups)) {
    this.homeLineups[lineupKey] = this.currentHomeLineupStats;
    this.homeLineups[lineupKey].against = this.awayTeam;
  } else {
    this.homeLineups[lineupKey].points += this.currentHomeLineupStats.points;
    this.homeLineups[lineupKey].assists += this.currentHomeLineupStats.assists;
    this.homeLineups[lineupKey].steals += this.currentHomeLineupStats.steals;
    this.homeLineups[lineupKey].blocks += this.currentHomeLineupStats.blocks;
    this.homeLineups[lineupKey].turnovers += this.currentHomeLineupStats.turnovers;
    this.homeLineups[lineupKey].fouls += this.currentHomeLineupStats.fouls;
    this.homeLineups[lineupKey].rebounds.total += this.currentHomeLineupStats.rebounds.total;
    this.homeLineups[lineupKey].rebounds.offensive += this.currentHomeLineupStats.rebounds.offensive;
    this.homeLineups[lineupKey].rebounds.defensive += this.currentHomeLineupStats.rebounds.defensive;
    this.homeLineups[lineupKey].fieldGoals.made += this.currentHomeLineupStats.fieldGoals.made;
    this.homeLineups[lineupKey].fieldGoals.attempted += this.currentHomeLineupStats.fieldGoals.attempted;
    this.homeLineups[lineupKey].freeThrows.attempted += this.currentHomeLineupStats.freeThrows.attempted;
    this.homeLineups[lineupKey].freeThrows.made += this.currentHomeLineupStats.freeThrows.made;
  }
  this.currentHomeLineupStats = {
    against: "",
    points: 0,
    rebounds: { offensive: 0, defensive: 0, total: 0 },
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    fieldGoals: { made: 0, attempted: 0 },
    threePointers: { made: 0, attempted: 0 },
    freeThrows: { made: 0, attempted: 0 },
    // Shot locations
    shotsInPaint: {made: 0, attempted: 0},
    pointsInPaint: 0,
    fastbreakOpportunities: {made: 0, attempted: 0},
    fastBreakPoints: 0,
  }
};

  applyHomeSubstitutions(substitutions) {
    for (const sub of substitutions) {
      if (sub.type === 'OUT') {
        const index = this.currentHomeLineup.indexOf(sub.player);
        if(index !== -1) {
         this.currentHomeLineup[index] = null;
        }
      }
    }

    // Replace null values with incoming players
    let inIndex = 0;
    for (let k = 0; k < this.currentHomeLineup.length; k++) {
      if (this.currentHomeLineup[k] === null && inIndex < substitutions.filter(s => s.type === 'IN').length) {
        const incomingPlayer = substitutions.filter(s => s.type === 'IN')[inIndex].player;
        this.currentHomeLineup[k] = incomingPlayer;
        this.initializePlayerIfNeeded(incomingPlayer, this.homeTeam);
        inIndex++;
      }
    }

  }
  // Apply substitutions to the current lineup
  applyAwaySubstitutions(substitutions) {
    // Apply all substitutions
    for (const sub of substitutions) {
      if (sub.type === 'OUT') {
        const index = this.currentAwayLineup.indexOf(sub.player);
        if (index !== -1) {
          this.currentAwayLineup[index] = null; // Mark for removal
        }
      }
    }

    // Replace null values with incoming players
    let inIndex = 0;
    for (let k = 0; k < this.currentAwayLineup.length; k++) {
      if (this.currentAwayLineup[k] === null && inIndex < substitutions.filter(s => s.type === 'IN').length) {
        const incomingPlayer = substitutions.filter(s => s.type === 'IN')[inIndex].player;
        this.currentAwayLineup[k] = incomingPlayer;
        // Initialize the incoming player
        this.initializePlayerIfNeeded(incomingPlayer, this.awayTeam);
        inIndex++;
      }
    }
  }

  extractPlayer(eventString) {
    const actionByPlayerRegex = /[A-Z0-9\s]+by\s+/gi;
    return eventString.replace(actionByPlayerRegex, "").replace(/,/g, " ");
  }

  // Find the best performing lineup
  findBestLineup() {
    let highestValue = -Infinity;
    let bestLineup = null;

    for (const lineup in this.awayLineups) {
      if (this.awayLineups[lineup].plusMinus > highestValue) {
        highestValue = this.awayLineups[lineup].plusMinus;
        bestLineup = lineup;
      }
    }
    return { 
      lineup: bestLineup, 
      plusMinus: highestValue,
      rebounds: this.awayLineups[bestLineup] ? this.awayLineups[bestLineup].rebounds : null
    };
  }

  calculateAwayStats() {
    // Summarize lineups stats
    for (const lineup in this.awayLineups) {
      const data = this.awayLineups[lineup];
      // data.points = data.fieldGoals.made * 2 + data.threePointers.made * 3 + data.freeThrows.made;
      // data.rebounds.total = data.rebounds.offensive + data.rebounds.defensive;
    }
    return this.awayLineups;
  }

  // Calculate net plus-minus for a specific player
  getPlayerNetPlusMinus(playerName) {
    let netPlusMinus = 0;
    
    for (const lineup in this.awayLineups) {
      if (lineup.toLowerCase().includes(playerName.toLowerCase())) {
        netPlusMinus += this.awayLineups[lineup].plusMinus;
      }
    }
    return netPlusMinus;
  }

  // Calculate total rebounds for a specific player
  getPlayerRebounds(playerName) {
    if(this.players[playerName]) {
      return this.players[playerName].rebounds;
    } 
    return { offensive: 0, defensive: 0, total: 0 };
  }

  getPlayerAssists(playerName) {
    if(this.players[playerName]) {
      return this.players[playerName].assists;
    }
    return 0;
  }

  getPlayerTurnovers(playerName) {
    if(this.players[playerName]) {
      return this.players[playerName].turnovers;
    }
    return 0;
  }

  // Get individual player statistics
  getPlayerStats(playerName) {
    if (this.players[playerName]) {
      return this.players[playerName];
    }
    return null;
  }

  // Get team statistics
  getTeamStats(teamName) {
    if (teamName.toLowerCase() === this.homeTeam.toLowerCase()) {
      return this.teamStats.home;
    } else if (teamName.toLowerCase() === this.awayTeam.toLowerCase()) {
      return this.teamStats.away;
    }
    return null;
  }

  // Get all players that have been initialized
  getAllPlayers() {
    return Object.keys(this.players);
  }

  getHomePlayers() {
    return Object.keys(this.players).filter(playerName => this.players[playerName].team.toLowerCase() === this.homeTeam.toLowerCase());
  }

  getAwayPlayers() {
    return Object.keys(this.players).filter(playerName => this.players[playerName].team.toLowerCase() === this.awayTeam.toLowerCase());
  }

  getHomePlayers() {
    let homePlayers = [];
    Object.keys(this.players).forEach(playerName => {
      const player = this.players[playerName];
      if(player.team && player.team.toLowerCase() === this.homeTeam.toLowerCase()) {
        homePlayers.push(player);
      }
    })
    return homePlayers;
  }

  getAwayPlayers() {
    let awayPlayers = [];
    Object.keys(this.players).forEach(playerName => {
      const player = this.players[playerName];
      if(player.team && player.team.toLowerCase() === this.awayTeam.toLowerCase()) {
        awayPlayers.push(player);
      }
    })
    return awayPlayers;
  }

  // Enhanced lineup search that works with any order of players
  findLineupByPlayers(players, team = 'away') {
    if (!players || players.length !== 5) {
      return null;
    }

    // Normalize player names (remove extra spaces, convert to uppercase)
    const normalizedPlayers = players.map(player => 
      player.trim().toUpperCase().replace(/\s+/g, ' ')
    );

    // Create a set for faster lookup
    const playerSet = new Set(normalizedPlayers);

    // Search through lineups
    const lineupsToSearch = team === 'away' ? this.awayLineups : this.homeLineups;
    
    for (const [lineupKey, lineupData] of Object.entries(lineupsToSearch)) {
      // Parse the lineup string into individual players
      const lineupPlayers = lineupKey.split(', ').map(player => 
        player.trim().toUpperCase().replace(/\s+/g, ' ')
      );

      // Check if all 5 players match (order doesn't matter)
      if (lineupPlayers.length === 5) {
        const lineupSet = new Set(lineupPlayers);
        
        // Check if sets are equal (same players, any order)
        if (this.setsEqual(playerSet, lineupSet)) {
          return {
            lineup: lineupKey,
            data: lineupData,
            team: team === 'away' ? this.awayTeam : this.homeTeam
          };
        }
      }
    }

    return null;
  }

  // Helper method to compare sets
  setsEqual(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (let item of setA) {
      if (!setB.has(item)) return false;
    }
    return true;
  }

  // Get all possible lineups for a given set of players (partial matches)
  findPartialLineups(players, team = 'away') {
    if (!players || players.length === 0) {
      return [];
    }

    const normalizedPlayers = players.map(player => 
      player.trim().toUpperCase().replace(/\s+/g, ' ')
    );

    const lineupsToSearch = team === 'away' ? this.awayLineups : this.homeLineups;
    const results = [];

    for (const [lineupKey, lineupData] of Object.entries(lineupsToSearch)) {
      const lineupPlayers = lineupKey.split(', ').map(player => 
        player.trim().toUpperCase().replace(/\s+/g, ' ')
      );

      // Count how many players match
      const matchCount = normalizedPlayers.filter(player => 
        lineupPlayers.includes(player)
      ).length;

      if (matchCount > 0) {
        results.push({
          lineup: lineupKey,
          data: lineupData,
          team: team === 'away' ? this.awayTeam : this.homeTeam,
          matchCount,
          missingPlayers: lineupPlayers.filter(player => 
            !normalizedPlayers.includes(player)
          ),
          extraPlayers: normalizedPlayers.filter(player => 
            !lineupPlayers.includes(player)
          )
        });
      }
    }

    // Sort by match count (descending)
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }

  // Get all unique players from lineups
  getAllPlayersFromLineups(team = 'away') {
    const lineupsToSearch = team === 'away' ? this.awayLineups : this.homeLineups;
    const playerSet = new Set();

    for (const lineupKey of Object.keys(lineupsToSearch)) {
      const players = lineupKey.split(', ').map(player => 
        player.trim().toUpperCase().replace(/\s+/g, ' ')
      );
      players.forEach(player => playerSet.add(player));
    }

    return Array.from(playerSet).sort();
  }

  // Enhanced getLineupData method that tries both teams
  getLineupDataFlexible(players) {
    // First try away team
    let result = this.findLineupByPlayers(players, 'away');
    if (result) return result;

    // Then try home team
    result = this.findLineupByPlayers(players, 'home');
    if (result) return result;

    return null;
  }

  // Generate CSV file with lineup data
  generateLineupCSV(filename = 'lineup_plus_minus.csv') {
    const csvContent = [];
    
    // Add header row with comprehensive stats
    csvContent.push('Team,Lineup,Against,Points,Rebounds_Off,Rebounds_Def,Rebounds_Total,Assists,Steals,Blocks,Turnovers,Fouls,FG_Made,FG_Attempted,FG_Pct,3PT_Made,3PT_Attempted,3PT_Pct,FT_Made,FT_Attempted,FT_Pct,ShotsInPaint_Made,ShotsInPaint_Attempted,PointsInPaint,Fastbreak_Made,Fastbreak_Attempted,FastbreakPoints');
    
    // Add Away team lineups
    for (const lineup in this.awayLineups) {
      const data = this.awayLineups[lineup];
      const fgPct = data.fieldGoals.attempted > 0 ? (data.fieldGoals.made / data.fieldGoals.attempted * 100).toFixed(1) : '0.0';
      const threePct = data.threePointers.attempted > 0 ? (data.threePointers.made / data.threePointers.attempted * 100).toFixed(1) : '0.0';
      const ftPct = data.freeThrows.attempted > 0 ? (data.freeThrows.made / data.freeThrows.attempted * 100).toFixed(1) : '0.0';
      
      csvContent.push(`"${this.awayTeam}","${lineup}","${data.against}","${data.points || 0}",${data.rebounds.offensive || 0},${data.rebounds.defensive || 0},${data.rebounds.total || 0},${data.assists || 0},${data.steals || 0},${data.blocks || 0},${data.turnovers || 0},${data.fouls || 0},${data.fieldGoals.made || 0},${data.fieldGoals.attempted || 0},${fgPct},${data.threePointers.made || 0},${data.threePointers.attempted || 0},${threePct},${data.freeThrows.made || 0},${data.freeThrows.attempted || 0},${ftPct},${data.shotsInPaint.made || 0},${data.shotsInPaint.attempted || 0},${data.pointsInPaint || 0},${data.fastbreakOpportunities.made || 0},${data.fastbreakOpportunities.attempted || 0},${data.fastBreakPoints || 0}`);
    }
    
    // Add Home team lineups
    for (const lineup in this.homeLineups) {
      const data = this.homeLineups[lineup];
      const fgPct = data.fieldGoals.attempted > 0 ? (data.fieldGoals.made / data.fieldGoals.attempted * 100).toFixed(1) : '0.0';
      const threePct = data.threePointers.attempted > 0 ? (data.threePointers.made / data.threePointers.attempted * 100).toFixed(1) : '0.0';
      const ftPct = data.freeThrows.attempted > 0 ? (data.freeThrows.made / data.freeThrows.attempted * 100).toFixed(1) : '0.0';
      
      csvContent.push(`"${this.homeTeam}","${lineup}","${data.against}","${data.points || 0}",${data.rebounds.offensive || 0},${data.rebounds.defensive || 0},${data.rebounds.total || 0},${data.assists || 0},${data.steals || 0},${data.blocks || 0},${data.turnovers || 0},${data.fouls || 0},${data.fieldGoals.made || 0},${data.fieldGoals.attempted || 0},${fgPct},${data.threePointers.made || 0},${data.threePointers.attempted || 0},${threePct},${data.freeThrows.made || 0},${data.freeThrows.attempted || 0},${ftPct},${data.shotsInPaint.made || 0},${data.shotsInPaint.attempted || 0},${data.pointsInPaint || 0},${data.fastbreakOpportunities.made || 0},${data.fastbreakOpportunities.attempted || 0},${data.fastBreakPoints || 0}`);
    }
    
    // Write to file
    fs.writeFileSync(filename, csvContent.join('\n'));
    console.log(`CSV file created: ${filename}`);
  }

  // Print game summary
  printSummary() {
    console.log(`\n=== ${this.awayTeam} vs ${this.homeTeam} Game Summary ===`);
    Object.keys(this.homeLineups).forEach(lineup => {
      console.log(lineup);
    });
    // Away lineups
  }
}

// Main function to run the analysis
async function analyzeGame() {
  return new Promise((resolve, reject) => {
    const results = [];
    
    // Create game instance
    const game = new Game('Hamilton', 'Middlebury');
    
    // Set starting lineups
    const awayStartingLineup = ["WITHERINGTON EDWARD", "STEVENS SAM", "BRENNAN DAVID", "FLAKS EVAN", "URENA OLIVER"];
    const homeStartingLineup = ["MORGAN HANK","SINGH TEJA","KANE OWEN", "ROBINSON GRAHAM", "XU COOPER"];

    game.setStartingLineups(homeStartingLineup, awayStartingLineup);
    
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Store events in game object for processing
        game.allEvents = results;
        
        // Process all events
        for (let i = 0; i < results.length; i++) {
          game.processEvent(results[i], i, results);
        }
        
        // Record final lineup performance
        game.recordHomeLineupPerformance();
        game.recordAwayLineupPerformance();
        
        // Generate outputs
        // game.printSummary();

        // game.generateLineupCSV('lineups.csv');
        
        resolve(game);
      })
      .on('error', reject);
  });
}

// Run the analysis
if (require.main === module) {
  analyzeGame()
    .then(game => {
      console.log('\nAnalysis complete!');
    })
    .catch(error => {
      console.error('Error analyzing game:', error);
    });
}

module.exports = { Game, analyzeGame };