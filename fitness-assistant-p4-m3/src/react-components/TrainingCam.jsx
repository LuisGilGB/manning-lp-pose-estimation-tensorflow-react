import Webcam from "react-webcam";

const TrainingCam = ({
  webcamRef,
  canvasRef,
  width,
  height
}) => (
  <>
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
        width: width,
        height: height,
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
        width: width,
        height: height,
      }}
    />
  </>
);

export default TrainingCam;
