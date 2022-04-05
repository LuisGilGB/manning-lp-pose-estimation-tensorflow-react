import * as tf from '@tensorflow/tfjs';

const TRAINING_DATA_SHARE = 0.8;
const BATCH_SIZE = 30;

const FLATTEN_FACTOR = 2;

export const processData = inputData => {
  const trainingSetSize = Math.ceil(inputData.length * TRAINING_DATA_SHARE);
  const shuffledSet = tf.data.array(inputData).shuffle(3);
  const encodeAndBatchSet = inputSet => inputSet.map(({ xs, ys }) => {
    const labels = [
      ys === 'JUMPING_JACKS' ? 1 : 0,
      ys === 'WALL_SIT' ? 1 : 0,
      ys === 'LUNGES' ? 1 : 0,
    ]
    return { xs: Object.values(xs), ys: Object.values(labels) };
  }).batch(BATCH_SIZE);
  const numberOfFeatures = inputData * FLATTEN_FACTOR;
  const trainingSet = encodeAndBatchSet(shuffledSet.take(trainingSetSize));
  const validationSet = encodeAndBatchSet(shuffledSet.skip(trainingSetSize));
  return [ numberOfFeatures, trainingSet, validationSet ]
}