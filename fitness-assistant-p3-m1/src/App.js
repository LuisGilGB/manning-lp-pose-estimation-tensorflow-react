import {useEffect, useRef, useState} from "react";
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { drawKeypoints, drawSkeleton } from './utilities';
import '@tensorflow/tfjs-backend-webgl';
import './App.css';
import {Grid} from "@mui/material";

const MIN_CONFIDENCE = 0.5;

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
  const canvasRef = useRef();
  const poseEstimationLoop = useRef();

  const [model, setModel] = useState();
  const [isPoseEstimation, setIsPoseEstimation] = useState(false)

  useEffect(() => {
    loadPosenet()
      .then((detector) => {
        setModel(detector);
        console.log('Posenet Model loaded.')
      });
  }, []);

  const startPoseEstimation = () => {
    if (webcamRef?.current?.video.readyState === 4) {
      // Run pose estimation each 100 milliseconds
      poseEstimationLoop.current = setInterval(() => {
        // Get Video Properties
        const video = webcamRef.current?.video;
        const videoWidth = webcamRef.current?.video.videoWidth;
        const videoHeight = webcamRef.current?.video.videoHeight;

        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        // Do pose estimation
        const start = new Date().getTime();
        model?.estimatePoses?.(video, {
          flipHorizontal: false
        }).then(poses => {
          const end = new Date().getTime()
          console.log(end - start, " ms")
          poses.forEach(pose => {
            console.log(pose)
            drawCanvas(pose, videoWidth, videoHeight, canvasRef.current);
          });
        });
      }, 100);
    }
  };

  const stopPoseEstimation = () => clearInterval(poseEstimationLoop.current);

  const handlePoseEstimation = () => {
    isPoseEstimation ? stopPoseEstimation() : startPoseEstimation();
    setIsPoseEstimation(state => !state);
  };

  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
    const context = canvas.getContext('2d');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    drawKeypoints(pose.keypoints, MIN_CONFIDENCE, context);
    drawSkeleton(pose.keypoints, MIN_CONFIDENCE, context);
  }

  return (
    <div className="App">
      <Grid container spacing={3}>
        <Grid item xs={12}></Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}></Grid>
        </Grid>
      </Grid>
        {/*<Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 600,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 800,
            height: 600,
          }}
        />*/}
    </div>
  );
}

export default App;
