import logo from './logo.svg';
import * as tf from '@tensorflow/tfjs'
import './App.css';

const doTraining = async (model, inputs, targets) => {
  const history = await model.fit(
    inputs,
    targets,
    {
      epochs: 200,
      callbacks: {
        onEpochEnd: (async (epoch, logs) => {
          console.log(epoch, logs.loss)
        })
      }
    });
  console.log(history.params)
}

const handleRunTraining = () => {
  console.log('Run training');
  const model = tf.sequential({
    layers: [
      tf.layers.dense({inputShape: [1], units: 1})
    ]
  });
  model.compile({
    optimizer: tf.train.sgd(0.1),
    loss: 'meanSquaredError'
  });
  model.summary()

  const inputValues = tf.tensor2d([-5, -3.7, -2, 1, 2.5, 3], [6, 1]);
  const targetValues = tf.tensor2d([-10.98, -8.38, -5, 1.01, 4.03, 4.97], [6, 1]);

  doTraining(model, inputValues, targetValues).then(() => {
    const testValue = 10;
    const prediction = model.predict(tf.tensor2d([testValue], [1, 1]));
    const estimation = prediction.dataSync()[0];
    prediction.dispose();
    console.log(`${testValue} -> ${estimation}`);
  })
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
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
