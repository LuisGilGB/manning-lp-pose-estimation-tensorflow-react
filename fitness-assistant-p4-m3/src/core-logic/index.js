import {normalize} from "../utils";
import config from "../config";

export const DATA_COLLECTION_STATES = {
  INACTIVE: 'INACTIVE',
  REQUESTED: 'REQUESTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
}

export const initialState = {
  model: null,
  selectedWorkout: '',
  dataCollectionState: DATA_COLLECTION_STATES.INACTIVE,
  canRequestDataCollection: true,
  isCollectStartSnackbarOpen: false,
  isCollectCompleteSnackbarOpen: false,
  canCollectData: false,
  canTrainModel: false,
  collectedData: [],
  isTrainingModel: false,
}

export const ACTION_TYPES = {
  LOAD_POSENET: 'LOAD_POSENET',
  LOAD_POSENET_DONE: 'LOAD_POSENET_DONE',
  SELECT_WORKOUT: 'SELECT_WORKOUT',
  REQUEST_DATA_COLLECTION: 'REQUEST_DATA_COLLECTION',
  ACTIVATE_DATA_COLLECTION: 'ACTIVATE_DATA_COLLECTION',
  STOP_DATA_COLLECTION: 'STOP_DATA_COLLECTION',
  COMPLETE_DATA_COLLECTION: 'COMPLETE_DATA_COLLECTION',
  HIDE_COLLECT_START_SNACKBAR: 'HIDE_COLLECT_START_SNACKBAR',
  DISPLAY_COLLECT_COMPLETE_SNACKBAR: 'DISPLAY_COLLECT_COMPLETE_SNACKBAR',
  HIDE_COLLECT_COMPLETE_SNACKBAR: 'HIDE_COLLECT_COMPLETE_SNACKBAR',
  HANDLE_POSE: 'HANDLE_POSE',
  START_MODEL_TRAINING: 'START_MODEL_TRAINING',
  STOP_MODEL_TRAINING: 'STOP_MODEL_TRAINING',
}

export const actionCreator = (type, payload = {}) => ({
  type,
  payload
});

export const reducer = (state = initialState, action) => {
  const actionReducers = {
    [ACTION_TYPES.LOAD_POSENET]: () => state,
    [ACTION_TYPES.LOAD_POSENET_DONE]: () => {
      console.log('Posenet Model loaded.');

      return {
        ...state,
        model: action.payload.model,
      };
    },
    [ACTION_TYPES.SELECT_WORKOUT]: () => {
      const newWorkout = action.payload.workout;
      return {
      ...state,
        selectedWorkout: newWorkout || '',
        isCollectDataDisabled: !newWorkout
      }
    },
    [ACTION_TYPES.REQUEST_DATA_COLLECTION]: () => ({
      ...state,
      dataCollectionState: DATA_COLLECTION_STATES.REQUESTED,
      canRequestDataCollection: false,
      canTrainModel: false,
      collectedData: [],
    }),
    [ACTION_TYPES.ACTIVATE_DATA_COLLECTION]: () => {
      return {
        ...state,
        dataCollectionState: DATA_COLLECTION_STATES.ACTIVE,
        isCollectStartSnackbarOpen: true,
        canTrainModel: false
      }
    },
    [ACTION_TYPES.STOP_DATA_COLLECTION]: () => ({
      ...state,
      dataCollectionState: DATA_COLLECTION_STATES.INACTIVE,
      canRequestDataCollection: true,
    }),
    [ACTION_TYPES.COMPLETE_DATA_COLLECTION]: () => ({
      ...state,
      dataCollectionState: DATA_COLLECTION_STATES.COMPLETED,
      isCollectCompleteSnackbarOpen: true,
      canTrainModel: true,
    }),
    [ACTION_TYPES.HIDE_COLLECT_START_SNACKBAR]: () => ({
      ...state,
      isCollectStartSnackbarOpen: false,
    }),
    [ACTION_TYPES.HIDE_COLLECT_COMPLETE_SNACKBAR]: () => ({
      ...state,
      isCollectCompleteSnackbarOpen: false,
    }),
    [ACTION_TYPES.HANDLE_POSE]: () => {
      if (![DATA_COLLECTION_STATES.ACTIVE, DATA_COLLECTION_STATES.COMPLETED].includes(state.dataCollectionState)) {
        return state;
      }
      const {
        pose,
        videoWidth,
        videoHeight
      } = action.payload;
      const normalizedKeypoints = pose.keypoints.reduce((acc, keypoint) => {
        const x = keypoint.score >= config.MIN_KEYPOINT_SCORE_ACCEPTED ? normalize(keypoint.x, videoWidth) : 0;
        const y = keypoint.score >= config.MIN_KEYPOINT_SCORE_ACCEPTED ? normalize(keypoint.y, videoHeight) : 0;
        acc.push(x);
        acc.push(y);
        return acc;
      }, []);
      const newCollectedPose = {xs: normalizedKeypoints, ys: state.selectedWorkout};
      console.log('Collected pose: ', newCollectedPose);
      return ({
        ...state,
        collectedData: [...state.collectedData, newCollectedPose],
      })
    },
    [ACTION_TYPES.START_MODEL_TRAINING]: () => ({
      ...state,
      isTrainingModel: true,
      isCollectDataDisabled: true,
    }),
    [ACTION_TYPES.STOP_MODEL_TRAINING]: () => ({
      ...state,
      isTrainingModel: false,
      isCollectDataDisabled: !state.selectedWorkout,
    }),
  }

  return actionReducers[action?.type] ? actionReducers[action?.type]() : state;
}
