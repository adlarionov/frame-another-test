import { useEffect, useRef, useState } from "react";
import Frame from "../Frame/Frame";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingModeExact, setFacingModeExact] = useState<string>("environment");
  const [startScanning, setStartScanning] = useState<boolean>(false);

  useEffect(() => {
    const getVideoMedia = async () => {
      const mediaStream = await navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: facingModeExact, aspectRatio: 1 },
        })
        .catch((error) => console.error(error));
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    };
    getVideoMedia();
  }, [startScanning, facingModeExact]);

  return (
    <div>
      <video
        style={{ border: "2px solid red" }}
        autoPlay
        playsInline
        ref={videoRef}
        width="99%"
        height="auto"
      />
      {videoRef.current?.playsInline && <Frame video={videoRef.current} />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {startScanning && (
          <button
            onClick={() =>
              setFacingModeExact(
                facingModeExact === "user" ? "environment" : "user"
              )
            }
          >
            Facing Mode {facingModeExact}
          </button>
        )}
        <button onClick={() => setStartScanning(true)}>Start Scanning</button>
      </div>
    </div>
  );
}
