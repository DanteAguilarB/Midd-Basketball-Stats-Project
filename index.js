const csv = require('csv-parser')
const fs = require('fs')
const results = [];

//Gathering starting five
let MiddRoster = ["Witherington Edward", "Stevens Sam", "Brennan David", "Ramey Sawyer", "Urena Oliver"];
let HamltnRoster = ["Morgan Hank", "Singh Teja", "Kane Owen", "	Robinson Graham", "Xu Cooper"];

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    let subs = 0;
    //Iterating over results
    for(let i = 0; i < results.length; i++){
        if(results[i]["Mid"].includes("SUB OUT") && results[i+1]["Mid"].includes("SUB IN")){
            let MiddOut = results[i]["Mid"].replace("SUB OUT by ", "");
            let MiddIn = results[i+1]["Mid"].replace("SUB IN by ", "");

            //Updating the rosters
            MiddRoster.pop(MiddOut);
            MiddRoster.push(MiddIn);

        }
    }
  });