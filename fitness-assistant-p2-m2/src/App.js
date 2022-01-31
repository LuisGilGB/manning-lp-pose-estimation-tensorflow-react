import {useEffect, useRef, useState} from "react";
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import webglBackend from '@tensorflow/tfjs-backend-webgl';
import './App.css';


const loadPosenet = async () => {
  const poseNetModel = poseDetection.SupportedModels.PoseNet;
  return await poseDetection.createDetector(poseNetModel, {
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: {
      width: 800,
      height: 600,
    },
    multiplier: 0.75
  })
}

function App() {
  const webcamRef = useRef()

  const [model, setModel] = useState();

  useEffect(() => {
    loadPosenet()
      .then((detector) => {
        setModel(detector);
        console.log('Posenet Model loaded.')
      })
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          width={800}
          height={600}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9
          }}
        />
      </header>
    </div>
  );
}

export default App;
