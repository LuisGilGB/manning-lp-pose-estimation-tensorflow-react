import * as poseDetection from "@tensorflow-models/pose-detection";
import config from "../config";

export const loadPosenet = async ({
  width,
  height
}) => {
  const poseNetModel = poseDetection.SupportedModels.PoseNet;
  return await poseDetection.createDetector(poseNetModel, {
    architecture: "MobileNetV1",
    outputStride: 16,
    inputResolution: {
      width,
      height,
    },
    multiplier: 0.75
  })
};

export const startPoseEstimation = (model, {
  webcamNode,
  handlePose,
}) => {
  if (webcamNode?.video.readyState === config.WEBCAM_READY_CODE) {
    return setInterval(async () => {
      // Get Video Properties
      const video = webcamNode?.video;
      const videoWidth = webcamNode?.video.videoWidth;
      const videoHeight = webcamNode?.video.videoHeight;

      // Set video width
      webcamNode.video.width = videoWidth;
      webcamNode.video.height = videoHeight;

      // Do pose estimation
      const start = new Date().getTime();
      const poses = await model?.estimatePoses?.(video, {
        flipHorizontal: false
      })
      const end = new Date().getTime();
      console.log(end - start, " ms");
      poses.forEach(pose => {
        handlePose?.(pose, {
          videoWidth,
          videoHeight,
        });
      });
    }, config.POSE_ESTIMATION_INTERVAL);
  } else {
    return null;
  }
}
