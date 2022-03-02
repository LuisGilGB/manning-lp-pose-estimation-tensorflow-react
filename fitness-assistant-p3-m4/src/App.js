import {useCallback, useEffect, useRef, useState} from "react";
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import {drawKeypoints, drawSkeleton} from './utilities';
import '@tensorflow/tfjs-backend-webgl';
import './App.css';
import {
  Alert,
  AppBar,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl, FormHelperText,
  Grid,
  InputLabel, NativeSelect, Snackbar,
  Toolbar,
  Typography
} from "@mui/material";

const MIN_CONFIDENCE = 0.5;

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

const delay = (time) => {
  return new Promise((resolve, reject) => {
    if (isNaN(time)) {
      reject(new Error('delay requires a valid number.'));
    } else {
      setTimeout(resolve, time);
    }
  });
}

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
  const [state, setState] = useState(STATES.WAITING);
  const [isPoseEstimation, setIsPoseEstimation] = useState(false);
  const [opCollectData, setOpCollectData] = useState(COLLECT_DATA_STATES.INACTIVE);
  const [snackbarDataColl, setSnackbarDataColl] = useState(false);
  const [snackbarDataNotColl, setSnackbarDataNotColl] = useState(false);
  const [workoutState, setWorkoutState] = useState('');

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
          const end = new Date().getTime()
          console.log(end - start, " ms")
          poses.forEach(pose => {
            console.log('STATE->' + state);
            if (state === STATES.COLLECTING) {
              console.log(workoutState.workout);
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
    setState(STATES.COLLECTING);
    await delay(START_DELAY);
    openSnackbarDataNotColl();
    setState(STATES.WAITING);
    setOpCollectData(COLLECT_DATA_STATES.INACTIVE);
  }

  const handlePoseEstimation = (input) => {
    if (input === COLLECT_DATA_INPUT) {
        console.log('COLLECT', isPoseEstimation, opCollectData, workoutState)
      if (isPoseEstimation && opCollectData === COLLECT_DATA_STATES.INACTIVE) {
        setIsPoseEstimation(state => !state);
        stopPoseEstimation();
        setState(STATES.WAITING);
      } else if (!isPoseEstimation && workoutState) {
        setIsPoseEstimation(state => !state);
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
    setWorkoutState(event?.target?.value)
  }

  return (
    <div className="App">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AppBar position="static" sx={{
            backgroundColor: '#1875d2'
          }}>
            <Toolbar variant="dense">
              <Typography variant="h6" color="inherit" sx={{
                flexGrow: 1,
                textAlign: 'left'
              }}>
                Fitness Assistant
              </Typography>
              <Button color="inherit">Start Workout</Button>
              <Button color="inherit">History</Button>
              <Button color="inherit">Reset</Button>
            </Toolbar>
          </AppBar>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Webcam
                ref={webcamRef}
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
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
                  marginTop: "10px",
                  marginBottom: "10px",
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
            </CardContent>
            <CardActions style={{justifyContent: 'center'}}>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <Toolbar style={{justifyContent: 'center'}}>
                    {[{
                      name: 'Jumping Jacks',
                      value: 75,
                    }, {
                      name: 'Wall-sit',
                      value: 200,
                    }, {
                      name: 'Lunges',
                      value: 5,
                    }].map(({name, value}) => (
                      <Card
                        key={name}
                        sx={{
                          width: '250px',
                          margin: '10px',
                        }}
                      >
                        <CardContent>
                          <Typography
                            sx={{
                              flexGrow: 1,
                              textAlign: 'left'
                            }}
                            color="textSecondary"
                            gutterBottom
                          >
                            {name}
                          </Typography>
                          <Typography
                            variant="h2"
                            component="h2"
                            color="secondary"
                          >
                            {value}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Toolbar>
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
          <FormControl
            required
            sx={{
              margin: 1,
              minWidth: 120,
            }}
          >
            <InputLabel
              htmlFor="age-native-helper"
            >
              Workout
            </ InputLabel>
            <NativeSelect
              value={workoutState}
              onChange={handleWorkoutSelect}
            >
              <option>None</option>
              <option value="jumping_jacks">Jumping Jacks</option>
              <option value="wall-sit">Wall-Sit</option>
              <option value="lunges">Lunges</option>
            </NativeSelect>
            <FormHelperText>
              Select training data type
            </FormHelperText>
          </FormControl>
          <Toolbar>
            <Typography>
              <Button
                variant="contained"
                color={isPoseEstimation ? 'secondary' : 'primary'}
                style={{
                  marginRight: 16
                }}
                onClick={() => handlePoseEstimation(COLLECT_DATA_INPUT)}
              >
                {isPoseEstimation ? 'Stop' : 'Collect Data'}
              </Button>
              <Button variant="contained">Train Model</Button>
            </Typography>
          </Toolbar>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarDataColl}
        autoHideDuration={2000}
        onClose={closeSnackbarDataColl}
      >
        <Alert severity="info" onClose={closeSnackbarDataColl}>
          Started collecting pose data!
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarDataNotColl}
        autoHideDuration={2000}
        onClose={closeSnackbarDataNotColl}
      >
        <Alert severity="success" onClose={closeSnackbarDataNotColl}>
          Completed collecting pose data!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
