import {useCallback, useEffect, useRef, useState} from "react";
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import {drawKeypoints, drawSkeleton} from './utilities';
import '@tensorflow/tfjs-backend-webgl';
import './App.css';
import {
  Card,
  CardActions,
  CardContent,
  Grid
} from "@mui/material";
import {processData} from './dataProcessing';
import {runTraining} from "./modelTraining";
import TrainingCam from "./react-components/TrainingCam";
import TrainingModelControls from "./react-components/TrainingModelControls";
import WorkoutRequirements from "./react-components/WorkoutRequirements";
import Snackbar from "./react-components/Snackbar";
import TrainingAppBar from "./react-components/TrainingAppBar";

const MIN_CONFIDENCE = 0.5;

const MIN_KEYPOINT_SCORE_ACCEPTED = 0.1;

const COLLECT_DATA_INPUT = 'COLLECT_DATA';
const START_DELAY = 10000;

const STATES = {
  WAITING: 'waiting',
  COLLECTING: 'collecting'
}

const COLLECT_DATA_STATES = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
}

const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;

const delay = (time) => {
  return new Promise((resolve, reject) => {
    if (isNaN(time)) {
      reject(new Error('delay requires a valid number.'));
    } else {
      setTimeout(resolve, time);
    }
  });
}

const normalize = (input, range) => (input / (range / 2)) - 1;

const loadPosenet = async () => {
  const poseNetModel = poseDetection.SupportedModels.PoseNet;
  return await poseDetection.createDetector(poseNetModel, {
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: {
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
    },
    multiplier: 0.75
  })
}

function App() {
  const webcamRef = useRef();
  const canvasRef = useRef();
  const poseEstimationLoop = useRef();

  const [model, setModel] = useState();
  const [state, setState] = useState(STATES.WAITING);
  const [isPoseEstimation, setIsPoseEstimation] = useState(false);
  const [opCollectData, setOpCollectData] = useState(COLLECT_DATA_STATES.INACTIVE);
  const [snackbarDataColl, setSnackbarDataColl] = useState(false);
  const [snackbarDataNotColl, setSnackbarDataNotColl] = useState(false);
  const [workoutState, setWorkoutState] = useState('');
  const [dataCollect, setDataCollect] = useState(false);
  const [rawData, setRawData] = useState([]);

  const openSnackbarDataColl = useCallback(() => {
    setSnackbarDataColl(true);
  }, []);

  const closeSnackbarDataColl = useCallback(() => {
    setSnackbarDataColl(false);
  }, []);

  const openSnackbarDataNotColl = useCallback(() => {
    setSnackbarDataNotColl(true);
  }, []);

  const closeSnackbarDataNotColl = useCallback(() => {
    setSnackbarDataNotColl(false);
  }, []);

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
          const end = new Date().getTime();
          poses.forEach(pose => {
            console.log('STATE-> ' + state);
            const normalizedKeypoints = pose.keypoints.map((keypoint) => ({
              x: keypoint.score >= MIN_KEYPOINT_SCORE_ACCEPTED ? normalize(keypoint.x, WINDOW_WIDTH) : 0,
              y: keypoint.score >= MIN_KEYPOINT_SCORE_ACCEPTED ? normalize(keypoint.y, WINDOW_HEIGHT) : 0,
            }))
            if (state === STATES.COLLECTING) {
              console.log(end - start, " ms");
              console.log(tf.getBackend());
              console.log(pose);
              console.log(workoutState.workout);
              const rawDataRow = {xs: normalizedKeypoints, ys: workoutState.workout}
              setRawData(rawData => [...rawData, rawDataRow]);
            }
            drawCanvas(pose, videoWidth, videoHeight, canvasRef.current);
          });
        });
      }, 100);
    }
  };

  const stopPoseEstimation = () => clearInterval(poseEstimationLoop.current);

  const collectData = async () => {
    setOpCollectData(COLLECT_DATA_STATES.ACTIVE);
    await delay(START_DELAY);
    openSnackbarDataColl();
    console.log('Time to collect');
    setState(STATES.COLLECTING);
    await delay(START_DELAY);
    openSnackbarDataNotColl();
    console.log('Collecting done, waiting to stop');
    setState(STATES.WAITING);
    setOpCollectData(COLLECT_DATA_STATES.INACTIVE);
  }

  const handlePoseEstimation = (input) => {
    if (input === COLLECT_DATA_INPUT) {
      console.log('COLLECT', isPoseEstimation, opCollectData, workoutState)
      if (isPoseEstimation && opCollectData === COLLECT_DATA_STATES.INACTIVE) {
        setIsPoseEstimation(state => !state);
        setDataCollect(() => false);
        stopPoseEstimation();
        setState(STATES.WAITING);
      } else if (!isPoseEstimation && workoutState) {
        setIsPoseEstimation(state => !state);
        setDataCollect(() => true)
        startPoseEstimation();
        collectData();
      }
    }
  };

  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
    const context = canvas.getContext('2d');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    drawKeypoints(pose.keypoints, MIN_CONFIDENCE, context);
    drawSkeleton(pose.keypoints, MIN_CONFIDENCE, context);
  }

  const handleWorkoutSelect = (event) => {
    setWorkoutState(() => event?.target?.value)
  }

  const handleTrainModel = async () => {
    if (rawData?.length) {
      console.log('rawData length', rawData.length);
    }
  }

  return (
    <div className="App">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TrainingAppBar />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TrainingCam
                webcamRef={webcamRef}
                canvasRef={canvasRef}
                width={WINDOW_WIDTH}
                height={WINDOW_HEIGHT}
              />
            </CardContent>
            <CardActions style={{justifyContent: 'center'}}>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <WorkoutRequirements/>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TrainingModelControls
            selectedWorkout={workoutState}
            isCollectingData={isPoseEstimation}
            isTrainModelDisabled={dataCollect}
            onWorkoutSelect={handleWorkoutSelect}
            onCollectDataClick={() => handlePoseEstimation(COLLECT_DATA_INPUT)}
            onTrainModelClick={handleTrainModel}
          />
        </Grid>
      </Grid>
      <Snackbar
        isOpen={snackbarDataColl}
        severity="info"
        onClose={closeSnackbarDataColl}
      >
        Started collecting pose data!
      </Snackbar>
      <Snackbar
        isOpen={snackbarDataNotColl}
        severity="success"
        onClose={closeSnackbarDataNotColl}
      >
        Completed collecting pose data!
      </Snackbar>
    </div>
  );
}

export default App;
