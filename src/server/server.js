const cors = require('cors');
const express = require('express');
const request = require('request');
const Player = require('../data/Player.js');
const Room = require('../data/Room.js');

const app = express();

app.use(cors());

// Data sent to post method needs this line to extract it
// See https://flaviocopes.com/express-post-query-letiables/
app.use(express.json());

let rooms = [];

function sendMessage(res, message) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(JSON.stringify({message}));
  res.end();
}

/**
 *  GET REQUESTS
 */

/**
 * Endpoint to create a new room.
 * Requires a player name as a query parameter.
 * @returns A JSON string with the new room's randomly generated code.
 */
app.get('/create', function (req, res) {
  let currentPlayer = new Player(req.query.name);
  let newRoom = new Room(currentPlayer);
  while (Room.findRoom(rooms, newRoom.code) !== null) { // ensure unique code
    newRoom.generateCode();
  }
  rooms.push(newRoom);
  console.log("Created room " + newRoom.code);
  sendMessage(res, {"code": newRoom.code, "rounds": newRoom.rounds});
});


/**
 * Endpoint to get the name of the opponent in the host's room.
 * Requires a room code to get the opponent's name.
 * @returns The opponents name, null if nobody has joined yet, and success: true
 * if the room was able to be found.
 */
app.get('/getOpponent', function (req, res) {
  let room = Room.findRoom(rooms, req.query.code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }
  // console.log("sending opponent: " + room.player2);

  sendMessage(res, {"success": true, "opponent": room.player2});
});


/**
 * Endpoint to join a room.
 * Requires a room code to enter.
 * @returns the name of the host and "success: true" if a room was joined.
 */
app.get('/join', function (req, res) {
  let code = req.query.code;
  let room = Room.findRoom(rooms, code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }
  let name = req.query.name === room.player1.name
    ? req.query.name + "2"
    : req.query.name;

  let currentPlayer = new Player(name);
  room.addPlayer(currentPlayer);
  console.log("Player " + room.player2.name + " joined room " + code);
  sendMessage(res, {
    "success": true,
    "opponent": room.player1,
    "rounds": room.rounds
  });
});


/**
 * Endpoint to get the name of the opponent in the host's room.
 * Requires a room code to get the opponent's name.
 * @returns The opponents name, null if nobody has joined yet, and success: true
 * if the room was able to be found.
 */
app.get('/status', function (req, res) {
  let room = Room.findRoom(rooms, req.query.code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }
  // console.log(room.toJSON());
  sendMessage(res, {"success": true, "room": room.toJSON()});
});


app.get('/print', function (req, res) {
  let room = Room.findRoom(rooms, req.query.code);
  console.log(room.toJSON());
  sendMessage(res, {"success": true});
});

app.get('/printrooms', function (req, res) {
  console.log("ROOMS: ")
  rooms.forEach(e => console.log(e.toJSON()));
  sendMessage(res, {"success": true});
});



/**
 * POST REQUESTS
 */

/**
 * Endpoint to leave the room. Has to make the remaining player the host
 * and reset/end the game.
 */
app.post('/leave', function (req, res) {
  if (req.body.code === null) {
    sendMessage(res, {"success": true});
    return;
  }

  let room = Room.findRoom(rooms, req.body.code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }

  if (req.body.host) {
    // console.log(room.player1.name + " leaving room");
    room.player1 = room.player2;
    room.player2 = null;
  } else {
    // console.log(room.player2.name + " leaving room");
    room.player2 = null;
  }
  if (room.player1 === null && room.player2 === null) {
    rooms = rooms.filter((x) => { return x.code !== room.code});
  } else {
    room.resetGame();
  }
  sendMessage(res, {"success": true});
});

/**
 * Endpoint to declare that the current player is ready to start the game.
 * When both players are ready, the game will start.
 */
app.post('/ready', function (req, res) {
  let room = Room.findRoom(rooms, req.body.code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }

  if (req.body.host) {
    room.player1.ready = !room.player1.ready;
  } else {
    room.player2.ready = !room.player2.ready;
  }

  if (room.player1.ready && room.player2.ready) {
    room.startGame();
  }
  sendMessage(res, {"success": true});
});

/**
 * Endpoint to declare a rematch. Once both players have declared a rematch,
 * the game will reset and they will have to ready up to start.
 */
app.post('/rematch', function (req, res) {
  let room = Room.findRoom(rooms, req.body.code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }

  if (req.body.host) {
    room.player1.rematch = !room.player1.rematch;
  } else {
    room.player2.rematch = !room.player2.rematch;
  }

  if (room.player1.rematch && room.player2.rematch) {
    room.resetGame();
  }
  sendMessage(res, {"success": true});
});

/**
 * Endpoint to submit a player's answer.
 * Passed in as an array with length 5.
 */
app.post('/submit', function (req, res) {
  let room = Room.findRoom(rooms, req.body.code);
  if (room === null) {
    sendMessage(res, {"success": false});
    return;
  }

  let correct = room.checkAnswer(req.body.answer, req.body.host);
  sendMessage(res, {"success": true, "correct": correct});
});

let port = process.env.PORT || 8888;
console.log("starting server on port " + port);
app.listen(port);
