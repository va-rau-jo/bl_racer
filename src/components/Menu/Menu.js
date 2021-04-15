import './Menu.css';

function Menu(props) {
  return (
    <>
      <header className="menu-header">
        <span className="name-label">
          Name:
        </span>
        <input className="name-input" type="text" value={props.name}
          onChange={props.changeName} />
      </header>
      <hr/>
      <div className="menu-main">
        <section>
          <button className="menu-button" onClick={props.createRoom}>
            Create Room
          </button>
        </section>
        <hr/>
        <section>
          <input className="join-input" placeholder="code" type="text"
            onChange={props.changeJoinCode} />
          <button className="menu-button" onClick={props.joinRoom}>
             Join Room
          </button>
        </section>
      </div>
    </>
  )
}

export default Menu;
