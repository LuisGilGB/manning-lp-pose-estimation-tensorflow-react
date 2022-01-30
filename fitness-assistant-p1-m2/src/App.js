import logo from './logo.svg';
import './App.css';

function App() {
  const handleRunTraining = () => {
    console.log('Run training');
  }
  return (
    <div className="App">
      <header className="App-header">
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
        <br/>
        <button onClick={handleRunTraining}>Run training</button>
      </header>
    </div>
  );
}

export default App;
