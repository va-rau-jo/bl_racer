import './App.css';
import React from 'react';
import Game from './components/Game/Game';
import Menu from './components/Menu/Menu';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answer: [],
      host: false,
      joinCode: null,
      opponent: null,
      nums: [],
      player: { name: "Player"},
      ready: false,
      roomCode: null,
      round: 0,
      rounds: 0,
      SERVER: window.location.href.includes("localhost")
        ? "http://localhost:8888/"
        : "TODO: deployed url"
    };
  }

  handleWindowClose(){
    alert("Alerted Browser Close");
  }

  componentDidMount = () => {
    window.addEventListener("beforeunload", (ev) => {

      if (this.state.roomCode !== null)  {
        ev.preventDefault();
        this.leaveRoom();
        // setTimeout(() => {

        // }, 1000)
        // window.close();
        return ev.returnValue = "Closing";
      }
    });
  }

  componentWillUnmount = () => {
    window.removeEventListener('beforeunload', this.handleWindowClose);
  }

  advanceRound = (room) => {
    console.log("advanced round, starting in 3")
    for (let i = 0; i < 5; i++) {
      const input = document.getElementById("answer" + i);
      if (input)
        input.value = "";
    }

    setTimeout(() => {
      this.setState({answer: [], nums: room.nums});
    }, 3000)
  }

  changeJoinCode = (event) => {
    this.setState({joinCode: event.target.value});
  }

  changeName = (event) => {
    this.setState({player: {"name": event.target.value}});
  }

  /**
   * Create a new room with a random code that is returned by the server. Starts
   * an interval to await for new players to join.
   */
  createRoom = () => {
    // console.log("creating room")
    this.serverGET('create', [['name', this.state.player.name]])
      .then(res => res.json())
      .then((json) => {
        if (json) {
          console.log("created room " + json.message);
          this.setState({host: true,
            roomCode: json.message.code,
            rounds: json.message.rounds
          });
          this.startOpponentFetch();
        } else {
          console.log("Could not read json message");
        }
      });
    }

  /**
   * Join a room with the given code, sets roomCode to joinCode if successful
   */
  joinRoom = () => {
    // console.log("joining room")
    this.serverGET('join', [['name', this.state.player.name],
                             ['code', this.state.joinCode]])
      .then(res => res.json())
      .then((json) => {
        if (json && json.message.success) {
          console.log("joined room " + this.state.joinCode);
          this.setState({
            opponent: json.message.opponent,
            roomCode: this.state.joinCode,
            rounds: json.message.rounds,

          });
          this.startGameStatusFetch();
        } else if (json && !json.message.success) {
          console.log("could not join room " + this.state.joinCode);
        } else {
          console.log("Could not read json message");
        }
      });
  }

  leaveRoom = () => {
    this.serverPOST('leave', [['host', this.state.host],
                             ['code', this.state.roomCode]])
      .then(res => res.json())
      .then((json) => {
        console.log(json);
        if (json && json.message.success) {
          this.setState({
            answer: [],
            host: false,
            joinCode: null,
            opponent: null,
            nums: [],
            player: { name: "Player"},
            ready: false,
            roomCode: null,
            round: 0,
          });
          console.log("reset state");
        } else {
          console.log("Could not read json message");
        }
    });
  }

  readyUp = () => {
    this.setState({ready: !this.state.ready});
    this.serverPOST('ready', [['host', this.state.host],
                             ['code', this.state.roomCode]])
      .then(res => res.json())
      .then((json) => {
        console.log(json);
        if (json && json.message.success) {
          console.log("ready successful");
        } else {
          console.log("Could not read json message");
        }
      });
  }

  requestRematch = () => {
    console.log("Requesting rematch");
    this.serverPOST('rematch', [['host', this.state.host],
                             ['code', this.state.roomCode]])
      .then(res => res.json())
      .then((json) => {
        console.log(json);
        if (json && json.message.success) {
          console.log("rematch successful");
        } else {
          console.log("Could not read json message");
        }
      });
  }

  /**
   * Wrapper function for fetch() that takes in the server path and any
   * necessary query arguments
   * @param path The server path "/create" or "/join"
   * @param args Any query arguments after path "abcd" in "/join?code:abcd"
   * @returns A promise that .then() can be called on
   */
  serverGET = (path, args) => {
    if (args == null) {
      return fetch(this.state.SERVER + path);
    }

    let argString = '?';
    for (let i = 0; i < args.length; i++) {
      if (i > 0)
        argString += '&';

      argString += args[i][0] + '=' + args[i][1];
    };
    return fetch(this.state.SERVER + path + argString);
  }

  serverPOST = (path, args) => {
    let json = {};
    for (let i = 0; i < args.length; i++) {
      json[args[i][0]] = args[i][1];
    };

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    };
    return fetch(this.state.SERVER + path, requestOptions);
  }

  /**
   * Sets an interval to ping the server for game information
   */
  startGameStatusFetch() {
    this.setState({
      gameStatusInterval:
        setInterval(() => {
          this.serverGET('status', [['code', this.state.roomCode]])
            .then(res => res.json())
            .then((json) => {
              if (json) {
                json = json.message;
                if (json.success) {
                  let room = json.room;
                  let player = this.state.host ? room.player1 : room.player2;
                  let opponent = !this.state.host ? room.player1 : room.player2;

                  if (!room.gameOver && room.round > 0 && opponent === null) {
                    // opponent left
                    console.log("opponent left, resetting game");
                    this.setState({
                      answer: [],
                      host: true,
                      joinCode: null,
                      opponent: null,
                      nums: [],
                      ready: false,
                      round: 0,
                    });
                  } else {
                    this.setState({
                      gameOver: room.gameOver,
                      opponent: opponent,
                      player: player}
                    );

                    if (room.round !== this.state.round) {
                      this.setState({
                        ready: player.ready,
                        round: room.round}
                      );
                      if (room.round > 0 && !this.state.gameOver)
                        this.advanceRound(room);
                    }
                  }
                } else if (!json.success) {
                  console.log("Used wrong room code? Something went wrong.");
                }
              } else if (!json) {
                console.log("Could not read json message");
              }
            });
      }, 4000)
    });
  }

  /**
   * Sets an interval to ping the server whether an opponent has joined.
   */
  startOpponentFetch() {
    this.setState({
      opponentInterval:
        setInterval(() => {
          this.serverGET('getOpponent', [['code', this.state.roomCode]])
            .then(res => res.json())
            .then((json) => {
              if (json) {
                json = json.message;
                console.log(json);
                if (json.success && json.opponent !== null) {
                  console.log("player " + json.opponent.name + " joined!");
                  clearInterval(this.state.opponentInterval);
                  this.setState({
                    opponent: json.opponent,
                    opponentInterval: null
                  });
                  this.startGameStatusFetch();
                } else if (!json.success) {
                  console.log("Used wrong room code? Something went wrong.");
                }
              } else if (!json) {
                console.log("Could not read json message");
              }
            });
      }, 4000)
    });
  }

  submitAnswer = () => {
    console.log("submitting " + this.state.answer);
    this.serverPOST('submit', [['host', this.state.host],
                               ['code', this.state.roomCode],
                               ['answer', this.state.answer]])
      .then(res => res.json())
      .then((json) => {
        console.log(json);
        if (json && json.message.success) {
          console.log("submit successful");
        } else {
          console.log("Could not read json message");
        }
      });
  }

  updateAnswer = (event, index) => {
    const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+",
      "-", "*", "/", "Enter", "Backspace"];
    console.log(event.key);
    console.log(event.target.value);
    console.log(event)

    if (!allowedKeys.includes(event.key)) {
      console.log("not included")
      return;
    }

    if (event.key === "Backspace" && event.target.value === "") {
      console.log("going back")

      if (index !== 0)
        document.getElementById("answer" + (index - 1)).focus();

    } else if (event.key === "Enter" && event.target.value !== "" && index === 4) {
      console.log("submitting")
    } else {
      let copy = this.state.answer;
      copy[index] = event.key;
      this.setState({ answer: copy});

      if (index !== 4) {
        console.log("next")
        document.getElementById("answer" + (index + 1)).focus();
      }
    }

  }

  print = () => {
    this.serverGET('print', [['code', this.state.roomCode]])
      .then(res => res.json())
      .then((json) => { console.log("printed in console")});
  }

  printrooms = () => {
    this.serverGET('printrooms')
      .then(res => res.json())
      .then((json) => { console.log("printed in console")});
  }

  printstate = () => {
    console.log(this.state);
  }

  render() {
    let inRoom = this.state !== undefined && this.state.roomCode !== null;
    return (
      <div className="App">
        <button onClick={this.printstate}> print state </button>
        <button onClick={this.print}> print room </button>
        <button onClick={this.printrooms}> print rooms</button>

        {!inRoom
          ? <Menu
              changeJoinCode={this.changeJoinCode}
              changeName={this.changeName}
              createRoom={this.createRoom}
              joinCode={this.state.joinCode}
              joinRoom={this.joinRoom}
              name={this.state.player.name} />
          : <Game
              gameOver={this.state.gameOver}
              nums={this.state.nums}
              opponent={this.state.opponent}
              player={this.state.player}
              ready={this.state.ready}
              readyUp={this.readyUp}
              rematch={this.requestRematch}
              roomCode={this.state.roomCode}
              round={this.state.round}
              rounds={this.state.rounds}
              submitAnswer={this.submitAnswer}
              updateAnswer={this.updateAnswer}/>
        }

      </div>
    );
  }
}

export default App;
