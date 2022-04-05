import {useEffect, useReducer, useRef, useState} from "react";
import * as tf from '@tensorflow/tfjs';
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
import config from "./config";
import {loadPosenet, startPoseEstimation} from "./tensorflow-logic/posenet";
import {ACTION_TYPES, actionCreator, DATA_COLLECTION_STATES, initialState, reducer} from "./core-logic";
import {delay, normalize} from "./utils";

const {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  MIN_CONFIDENCE,
  MIN_KEYPOINT_SCORE_ACCEPTED,
  START_DELAY,
} = config;

const STATES = {
  WAITING: 'waiting',
  COLLECTING: 'collecting'
}

function App() {
  const webcamRef = useRef();
  const canvasRef = useRef();
  const poseEstimationLoop = useRef(null);

  const [ state, dispatch ] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch(actionCreator(ACTION_TYPES.LOAD_POSENET));
    loadPosenet({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT
    })
      .then((detector) => {
        dispatch(actionCreator(ACTION_TYPES.LOAD_POSENET_DONE,
          {
            model: detector
          }));
      });
  }, []);

  const stopPoseEstimation = () => {
    clearInterval(poseEstimationLoop.current);
    dispatch(actionCreator(ACTION_TYPES.STOP_DATA_COLLECTION));
  }

  const collectData = async () => {
    dispatch(actionCreator(ACTION_TYPES.REQUEST_DATA_COLLECTION));
    await delay(START_DELAY);
    dispatch(actionCreator(ACTION_TYPES.ACTIVATE_DATA_COLLECTION));
    await delay(START_DELAY);
    dispatch(actionCreator(ACTION_TYPES.COMPLETE_DATA_COLLECTION));
  }

  const handlePose = (pose, { videoWidth, videoHeight }) => {
    dispatch(actionCreator(ACTION_TYPES.HANDLE_POSE, {pose, videoWidth, videoHeight}));
    drawCanvas(pose, videoWidth, videoHeight, canvasRef.current);
  }

  const handlePoseEstimation = () => {
    if (state.dataCollectionState === DATA_COLLECTION_STATES.COMPLETED) {
      stopPoseEstimation();
    } else if (state.dataCollectionState === DATA_COLLECTION_STATES.INACTIVE) {
      collectData();
      poseEstimationLoop.current = startPoseEstimation(state.model, {
        webcamNode: webcamRef.current,
        handlePose,
      });
    };
  };

  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
    const context = canvas.getContext('2d');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    drawKeypoints(pose.keypoints, MIN_CONFIDENCE, context);
    drawSkeleton(pose.keypoints, MIN_CONFIDENCE, context);
  }

  const handleWorkoutSelect = (event) => {
    dispatch(actionCreator(ACTION_TYPES.SELECT_WORKOUT, { workout: event.target?.value }));
  }

  const handleTrainModel = async () => {
    if (state.collectedData?.length) {
      console.log('collected data length', state.collectedData.length);
      const [numberOfFeatures, trainingSet, validationSet] = processData(state.collectedData);
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
            selectedWorkout={state.selectedWorkout}
            canRequestDataCollection={state.canRequestDataCollection}
            isTrainModelDisabled={!state.canTrainModel}
            onWorkoutSelect={handleWorkoutSelect}
            onCollectDataClick={handlePoseEstimation}
            onTrainModelClick={handleTrainModel}
          />
        </Grid>
      </Grid>
      <Snackbar
        isOpen={state.isCollectStartSnackbarOpen}
        severity="info"
        onClose={() => dispatch(actionCreator(ACTION_TYPES.HIDE_COLLECT_START_SNACKBAR))}
      >
        Started collecting pose data!
      </Snackbar>
      <Snackbar
        isOpen={state.isCollectCompleteSnackbarOpen}
        severity="success"
        onClose={() => dispatch(actionCreator((ACTION_TYPES.HIDE_COLLECT_COMPLETE_SNACKBAR)))}
      >
        Completed collecting pose data!
      </Snackbar>
    </div>
  );
}

export default App;
