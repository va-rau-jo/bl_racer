import './Menu.css';

function Menu(props) {
  return (
    <>
      <header >
        <h1> BL RACER</h1>
      </header>
      <div className="menu-main">
        <section className="menu-header">
          <span className="name-label">
            Your Name:
          </span>
          <input className="name-input" type="text" value={props.name}
            onChange={props.changeName} />
        </section>
        <hr/>
        <section className="menu-options">
          <div>
            <p> Create your own room! </p>
            <button className="menu-button" onClick={props.createRoom}>
              Create Room
            </button>
            <div className="roundInputDiv">
              <input type="range" min="1" max="9" defaultValue="5" id="roundInput"
                onInput={props.roundInputChange} />
              <p id="roundsLabel" > Rounds: 5</p>
            </div>
          </div>
          <div>
            <p> Join a room with its 4-digit code </p>
            <input className="join-input" placeholder="code" type="text"
              onChange={props.changeJoinCode} />
            <button className="menu-button" onClick={props.joinRoom}>
              Join Room
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

export default Menu;
