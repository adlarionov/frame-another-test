import { useEffect, useRef, useState } from "react";
import Frame from "../Frame/Frame";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<string>("environment");

  const changeFacingMode = () => {
    if (facingMode === "user") {
      setFacingMode("environment");
    } else {
      setFacingMode("user");
    }
    if (stream?.active) {
      stream.getVideoTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    const handleStartCamera = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode, aspectRatio: 1.0 },
        });
        setStream(mediaDevices);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaDevices;
          videoRef.current.play();
        }
      } catch (error) {
        console.error(error);
        return;
      }
    };
    handleStartCamera();
  }, [facingMode, stream?.active]);

  console.log(
    stream
      ?.getVideoTracks()
      .forEach((track) => console.log(track.getConstraints()))
  );

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
      {videoRef.current && <Frame video={videoRef.current} />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button onClick={changeFacingMode}>Facing Mode {facingMode}</button>
      </div>
    </div>
  );
}
