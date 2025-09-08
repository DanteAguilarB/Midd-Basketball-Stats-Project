const csv = require('csv-parser')
const fs = require('fs')
const results = [];

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

const findBestLineup = (lineups) => {
  let highestValue = -Infinity;
  let highestKey = null;

  for(key in lineups){
    if(lineups[key] > highestValue){
      highestValue = lineups[key];
      highestKey = key;
    }
  }
  return highestKey;
}

const createLineupCSV = (lineups, filename = 'lineup_plus_minus.csv') => {
  const csvContent = [];
  
  // Add header row
  csvContent.push('Lineup,Plus_Minus');
  
  // Add data rows
  for (const lineup in lineups) {
    // Convert array to readable string format
    const lineupString = Array.isArray(lineup) ? lineup.join(', ') : lineup;
    csvContent.push(`"${lineupString}",${lineups[lineup]}`);
  }
  
  // Write to file
  fs.writeFileSync(filename, csvContent.join('\n'));
  console.log(`CSV file created: ${filename}`);
  console.log(`Total lineups recorded: ${Object.keys(lineups).length}`);
}


//Gathering starting five
let MiddCurrentLineup = ["WITHERINGTON EDWARD", "STEVENS SAM", "BRENNAN DAVID", "RAMEY SAWYER", "URENA OLIVER"];
let HamltnRoster = ["Morgan Hank", "Singh Teja", "Kane Owen", "	Robinson Graham", "Xu Cooper"];

let HomeLineupPlusMinus = {
}
;

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    let MiddCurrentLead = 0;
    let HamiltonCurrentLead = 0;
    //Iterating over results
    for(let i = 0; i < results.length; i++){
        
        //Points
        if(results[i]["Away Team Score"] != "" && results[i]["Home Team Score"] != ""){
          // Away team takes the lead
          if(results[i]["Away Team Score"].includes("+")){
            MiddCurrentLead = results[i]["Away Team Score"].leadFinder();
            HamiltonCurrentLead = 0;
          }
          // Home team takes the lead
          else if(results[i]["Home Team Score"].includes("+")){
            HamiltonCurrentLead = results[i]["Home Team Score"].leadFinder();
            MiddCurrentLead = 0;
          } 
          
          else {
          // Tie game
            MiddCurrentLead = HamiltonCurrentLead = 0;
          }
        }

        //Midd Substitutions - Handle multiple substitutions at the same time
        if(results[i]["Mid"].includes("SUB OUT") && !results[i].processed){
            // Mark this timestamp as processed to avoid duplicate processing
            results[i].processed = true;
            
            // Convert lineup array to string for use as object key
            const lineupKey = MiddCurrentLineup.join(', ');
            if (!(lineupKey in HomeLineupPlusMinus)) {
              HomeLineupPlusMinus[lineupKey] = 0;
            }
            HomeLineupPlusMinus[lineupKey] = MiddCurrentLead - HamiltonCurrentLead;

            // Handle multiple substitutions that might occur at the same time
            let j = i;
            const substitutions = [];
            
            // Collect all SUB OUT and SUB IN events at the same time
            while (j < results.length && results[j]["Time"] === results[i]["Time"]) {
                if (results[j]["Mid"].includes("SUB OUT")) {
                    const playerOut = results[j]["Mid"].replace("SUB OUT by ", "");
                    substitutions.push({ type: 'OUT', player: playerOut });
                } else if (results[j]["Mid"].includes("SUB IN")) {
                    const playerIn = results[j]["Mid"].replace("SUB IN by ", "");
                    substitutions.push({ type: 'IN', player: playerIn });
                }
                // Mark all events at this timestamp as processed
                results[j].processed = true;
                j++;
            }

            // Apply all substitutions
            for (const sub of substitutions) {
                if (sub.type === 'OUT') {
                    const index = MiddCurrentLineup.indexOf(sub.player);
                    if (index !== -1) {
                        MiddCurrentLineup[index] = null; // Mark for removal
                    }
                }
            }

            // Replace null values with incoming players
            let inIndex = 0;
            for (let k = 0; k < MiddCurrentLineup.length; k++) {
                if (MiddCurrentLineup[k] === null && inIndex < substitutions.filter(s => s.type === 'IN').length) {
                    MiddCurrentLineup[k] = substitutions.filter(s => s.type === 'IN')[inIndex].player;
                    inIndex++;
                }
            }
        }
    }
    
    // Generate CSV file with lineup data
    createLineupCSV(HomeLineupPlusMinus, 'midd_lineup_plus_minus.csv');
  
  });

