import { useRef, useState } from "react";
import Frame from "../Frame/Frame";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [startScanning, setStartScanning] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<string>("environment");

  const handleStartCamera = async () => {
    console.log("here camera");
    try {
      // if (stream) {
      //   stream.getVideoTracks().forEach((track) => track.stop());
      //   console.log("here camera 2", facingMode);
      // }
      const mediaDevices = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode, aspectRatio: 1 },
      });
      setStream(mediaDevices);
    } catch (error) {
      console.error(error);
      return;
    }
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const changeFacingMode = () => {
    if (facingMode === "user") {
      setFacingMode("environment");
    } else {
      setFacingMode("user");
    }
    handleStartCamera();
  };

  // useEffect(() => {
  //   const startScanningFunc = async () => {
  //     const mediaDevices = await navigator.mediaDevices.getUserMedia({
  //       audio: false,
  //       video: { aspectRatio: 1, facingMode },
  //     });

  //     if (videoRef.current && mediaDevices) {
  //       videoRef.current.srcObject = mediaDevices;
  //       await videoRef.current.play().catch((error) => console.error(error));
  //     }
  //   };

  //   if (startScanning) {
  //     console.log("inside use effect", facingMode);
  //     startScanningFunc();
  //   }
  // }, [facingMode, startScanning]);

  return (
    <div>
      <video
        autoPlay
        playsInline
        preload="auto"
        ref={videoRef}
        width="99%"
        height="500"
      />
      {videoRef.current?.playsInline && <Frame video={videoRef.current} />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {stream && (
          <button onClick={changeFacingMode}>Facing Mode {facingMode}</button>
        )}
        <button onClick={handleStartCamera}>Start Scanning</button>
      </div>
    </div>
  );
}
