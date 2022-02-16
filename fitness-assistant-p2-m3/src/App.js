import {useEffect, useRef, useState} from "react";
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
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
  const webcamRef = useRef();
  const poseEstimationLoop = useRef();

  const [model, setModel] = useState();
  const [isPoseEstimation, setIsPoseEstimation] = useState(false);

  useEffect(() => {
    loadPosenet()
      .then((detector) => {
        setModel(detector);
        console.log('Posenet Model loaded.')
      })
  }, []);

  const startPoseEstimation = () => {
    if (webcamRef?.current && webcamRef.current.video.readyState === 4) {
      poseEstimationLoop.current = setInterval(() => {
        const video = webcamRef?.current?.video;
        const videoWidth = webcamRef?.current?.video.videoWidth;
        const videoHeight = webcamRef?.current?.video.videoHeight;
        console.log('width', video.width, videoWidth)
        console.log('height', video.height, videoHeight)
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
        const start = Date.now();
        model?.estimatePoses?.(video, {
          flipHorizontal: false,
        }).then(pose => {
          console.log('Pose', pose);
          console.log('End after', Date.now() - start);
          console.log(tf.getBackend())
        }).catch(console.error);
      }, 100);
    }
  }

  const stopPoseEstimation = () => {
    clearInterval(poseEstimationLoop.current)
  }

  const handlePoseEstimation = () => {
    isPoseEstimation ? stopPoseEstimation() : startPoseEstimation();
    setIsPoseEstimation(state => !state);
  }

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
        <button onClick={handlePoseEstimation}>{isPoseEstimation ? 'Stop' : 'Start'}</button>
      </header>
    </div>
  );
}

export default App;
