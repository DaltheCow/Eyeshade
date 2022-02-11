import * as React from 'react';
import { render } from 'react-dom';

const App = () => {
  
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#222222", color: "#eeeeee", fontSize: "36px", display: "flex", justifyContent: "center", alignItems: "center"}}>Hey don't get distracted now!!</div>
  )
}

render(<App />, document.getElementById('root'));
