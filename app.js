const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log("DB Error:${e.message}");
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//1
app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    select *
    from cricket_team;`;
  const cricketArray = await db.all(getAllPlayers);
  console.log(cricketArray);
  response.send(
    cricketArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});
//2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
  insert into
  cricket_team(player_name,jersey_number,role)
  values(
      ${playerName},${jerseyNumber},${role}
  );`;
  const newPlayer = await db.run(addPlayer);
  console.log(newPlayer);
  response.send("Player Added to Team");
});
//3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    select *
    from cricket_team
    where player_id=${playerId};`;
  const player = await db.run(getPlayer);
  console.log(player);
  response.send(convertDBObjectToResponseObject(player));
});

//4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const update = `
    update
    cricket_team
    set 
    player_name='${playerName}'
    jersey-number=${jerseyNumber}
    role='${role}'
    where player_id=${playerId};`;
  await db.run(update);
  response.send("Player Details Updated");
});

//5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    select *
    from cricket_team
    where player_id=${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
