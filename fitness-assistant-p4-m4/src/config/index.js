const config = {
  WINDOW_WIDTH: 800,
  WINDOW_HEIGHT: 600,
  MIN_CONFIDENCE: 0.5,
  MIN_KEYPOINT_SCORE_ACCEPTED: 0.1,
  START_DELAY: 1e4,
  TRAINING_DELAY: 3e4,
  COLLECT_DATA_INPUT: 'COLLECT_DATA',
  WEBCAM_READY_CODE: 4,
  POSE_ESTIMATION_INTERVAL: 100,
  TRAINING_TYPES: {
    'JUMPING_JACKS': {
      key: 'JUMPING_JACKS',
      label: 'Jumping jacks',
      goal: 75,
    },
    'WALL_SIT': {
      key: 'WALL_SIT',
      label: 'Wall-Sit',
      goal: 200,
    },
    'LUNGES': {
      key: 'LUNGES',
      label: 'Lunges',
      goal: 5,
    },
  },
};

export default config;
