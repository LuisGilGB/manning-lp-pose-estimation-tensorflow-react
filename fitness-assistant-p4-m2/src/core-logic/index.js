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
  canRequestDataCollection: false,
  isCollectStartSnackbarOpen: false,
  isCollectCompleteSnackbarOpen: false,
  canTrainModel: false,
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
}

export const actionGenerator = (type, payload = {}) => ({
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
        canRequestDataCollection: !!newWorkout
      }
    },
    [ACTION_TYPES.REQUEST_DATA_COLLECTION]: () => ({
      ...state,
      dataCollectionState: DATA_COLLECTION_STATES.REQUESTED,
      canRequestDataCollection: false,
      canTrainModel: false,
    }),
    [ACTION_TYPES.ACTIVATE_DATA_COLLECTION]: () => {
      return {
        ...state,
        dataCollectionState: DATA_COLLECTION_STATES.ACTIVE,
        canRequestDataCollection: true,
        isCollectStartSnackbarOpen: true,
        canTrainModel: false
      }
    },
    [ACTION_TYPES.STOP_DATA_COLLECTION]: () => ({
      ...state,
      dataCollectionState: DATA_COLLECTION_STATES.INACTIVE,
      canRequestDataCollection: false,
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
  }

  const newState = actionReducers[action?.type] ? actionReducers[action?.type]() : state;
  console.log('newState', newState);
  return newState;
}
