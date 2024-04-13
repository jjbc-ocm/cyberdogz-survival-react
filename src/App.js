import logo from './logo.svg';
import './App.css';
import React from 'react';
import PlayCanvasApp from './components/PlayCanvasApp';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
      </header> */}
      <div>
        {/* <h1>Welcome to My Game</h1> */}
        <PlayCanvasApp />
      </div>
    </div>

    
    
  );
}

export default App;
