import './App.css';
import React from 'react';

class App extends React.Component {
  createRoom() {
    console.log("creating room")
  }

  joinRoom() {
    console.log("joining room")
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button onClick={this.createRoom}> Create Room </button>
          <button onClick={this.joinRoom}> Join Room </button>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
