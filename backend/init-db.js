/**
    * @description      : 
    * @author           : Kai
    * @group            : 
    * @created          : 22/04/2025 - 22:49:01
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 22/04/2025
    * - Author          : Kai
    * - Modification    : 
**/
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    username TEXT,
    password TEXT,
    email TEXT
  )`, (err) => {
    if (err) console.error(err.message);
    else console.log("Users table created.");
  });
});

db.run(`INSERT INTO users (name, username, password, email)
        VALUES (?, ?, ?, ?)`,
        ['Kai', 'Kai', 'd65777d3557d1492abda9f8d28438e56c44a908b83fb6e35fe1215ed9180d0bd', 'kai@mybustimes.cc'],
        function (err) {
          if (err) return console.log(err.message);
          console.log(`Inserted user with ID ${this.lastID}`);
        });

db.close();
