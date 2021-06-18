"use strict";
let extend = require("extend");

// Declare the constructor and member properties.
class Player {
  constructor(name) {
    this.answer = null;
    this.correct = null;
    this.disconnected = false;
    this.name = name;
    this.score = 0;
    this.scores = [];
    this.ready = false;
    this.rematch = false;
  }

  reset() {
    this.answer = null;
    this.correct = null;
    this.disconnected = false;
    this.score = 0;
    this.scores = [];
    this.ready = false;
    this.rematch = false;
  }

  // Define static members directly on the Constructor function.
  static getPlayerByName(users, name) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].name === name) {
        //console.log("returning " + users[i].name);
        return users[i];
      }
    }
    return null;
  }
}


module.exports = Player;