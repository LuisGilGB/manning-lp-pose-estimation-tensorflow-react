import * as tf from '@tensorflow/tfjs';

const buildModel = numberOfFeatures => {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    units: 12,
    inputShape: [numberOfFeatures],
    activation: 'relu'
  }));
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
  }));
  model.add(tf.layers.dense({
    units: 3,
    activation: 'softmax'
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
};

export const runTraining = async (trainingSet, validationSet, numberOfFeatures) => {
  const model = buildModel(numberOfFeatures);
  await model.fitDataset(trainingSet, {
    epochs: 100,
    validationData: validationSet,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log('Acc: ', logs.acc);
        console.log('Loss: ', logs.loss);
      }
    }
  });
  await model.save('indexeddb://fitness-assistant-model');
  console.log('Model saved');
};