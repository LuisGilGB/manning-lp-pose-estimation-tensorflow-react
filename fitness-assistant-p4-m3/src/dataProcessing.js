import * as tf from '@tensorflow/tfjs';
import config from "./config";

const TRAINING_DATA_SHARE = 0.8;
const BATCH_SIZE = 30;

const FLATTEN_FACTOR = 2;

export const processData = inputData => {
  const trainingSetSize = Math.ceil(inputData.length * TRAINING_DATA_SHARE);
  const shuffledSet = tf.data.array(inputData).shuffle(3);
  const encodeAndBatchSet = inputSet => inputSet.map(({ xs, ys }) => {
    const labels = Object.keys(config.TRAINING_TYPES).map(trainingType => ys === trainingType ? 1 : 0);
    return { xs: Object.values(xs), ys: Object.values(labels) };
  }).batch(BATCH_SIZE);
  const numberOfFeatures = inputData.length * FLATTEN_FACTOR;
  const trainingSet = encodeAndBatchSet(shuffledSet.take(trainingSetSize));
  const validationSet = encodeAndBatchSet(shuffledSet.skip(trainingSetSize));
  return [ numberOfFeatures, trainingSet, validationSet ]
}