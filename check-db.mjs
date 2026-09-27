import sqlite3 from "sqlite3";

const dbPath = "prisma/dev.db";
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database " + dbPath, err.message);
    process.exit(1);
  }
  db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Tables in " + dbPath + ":", rows.map((r) => r.name));
    }
    db.close();
  });
});
