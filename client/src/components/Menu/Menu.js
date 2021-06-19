import './Menu.css';

function minimize() {
  document.getElementById("menu-info").classList.toggle("minimized");
  let minimizeButton = document.getElementById("minimize-button");
  if (minimizeButton.src.toString().includes("dropdown")) {
    minimizeButton.src = "images/dropup.png";
  } else {
    minimizeButton.src ="images/dropdown.png";
  }
}

function Menu(props) {
  return (
    <>
      <header>
        <h1 className="title"> BL RACER</h1>
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
        <hr/>
        <section className="menu-info">
          <h3 className="menu-info-title"> Info </h3>
          <img id="minimize-button" alt="minimize" src="images/dropdown.png"
            onClick={minimize} />
          <div id="menu-info" className="info-div">
            <p> This is a game based on <a href="https://github.com/va-rau-jo/brights_law">Bright's Law</a>: a
              mathematical theory developed by <a href="https://www.linkedin.com/in/v-araujo/">Victor Araujo</a> and
              Nate Schilling. The game revolves around the following premise:
            </p>
            <p className="menu-info-theory">
              Given any 3 integers, you can arrive at a multiple of 10 (including 0) using basic math
              operators (addition, subtraction, multiplication, division). </p>
            <p> For example, given 3, 5, and 8, you have the equations: </p>
            <span className="menu-info-theory">
              5 * 8 * 3 = 120
            </span>
            <span className="menu-info-small-text"> or </span>
            <span className="menu-info-theory">
              8 - 5 - 3 = 0
            </span>
            <p> The operations are performed left to right, <em>not</em> in PEMDAS order. Some equations would
              not be possible without adding parentheses, so this keeps it simple.
            </p>
            </div>
        </section>
      </div>
    </>
  )
}

export default Menu;
