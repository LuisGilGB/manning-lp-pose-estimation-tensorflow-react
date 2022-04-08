import {useEffect, useReducer, useRef } from "react";
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
import {delay} from "./utils";

const {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  MIN_CONFIDENCE,
} = config;

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
    await delay(config.START_DELAY);
    dispatch(actionCreator(ACTION_TYPES.ACTIVATE_DATA_COLLECTION));
    await delay(config.TRAINING_DELAY);
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
      const [numberOfFeatures, trainingSet, validationSet] = await processData(state.collectedData);
      dispatch(actionCreator(ACTION_TYPES.START_MODEL_TRAINING));
      await runTraining(trainingSet, validationSet, numberOfFeatures);
      dispatch(actionCreator(ACTION_TYPES.STOP_MODEL_TRAINING));
    } else {
      dispatch(actionCreator(ACTION_TYPES.DISPLAY_TRAINING_ERROR_SNACKBAR));
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
            isCollectDataDisabled={!state.selectedWorkout}
            isTrainModelDisabled={!state.canTrainModel || state.isTrainingModel}
            isTrainingModel={state.isTrainingModel}
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
      <Snackbar
        isOpen={state.isTrainingErrorSnackbarOpen}
        severity="error"
        onClose={(event, reason) => {
          if (reason === 'clickaway') {
            return;
          }
          dispatch(actionCreator((ACTION_TYPES.HIDE_TRAINING_ERROR_SNACKBAR)));
        }}
      >
        Training data is not available!
      </Snackbar>
    </div>
  );
}

export default App;
