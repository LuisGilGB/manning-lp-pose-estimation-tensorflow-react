import logo from './logo.svg';
import * as tf from '@tensorflow/tfjs'
import './App.css';

function App() {
  const handleRunTraining = () => {
    console.log('Run training');
    tf.tensor([[1, 2], [3, 4]]).print();
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
