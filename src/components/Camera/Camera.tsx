import { useEffect, useRef, useState } from "react";
import Frame from "../Frame/Frame";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [startScanning, setStartScanning] = useState<boolean>(false);

  const [constraints, setConstraints] = useState({
    aspectRatio: 1,
    facingMode: { exact: "environment" },
  });
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const stopScanning = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setStartScanning(false);
  };

  useEffect(() => {
    const startScanningFunc = async () => {
      const mediaDevices = await navigator.mediaDevices.getUserMedia({
        video: constraints,
      });

      if (videoRef.current && mediaDevices) {
        videoRef.current.srcObject = mediaDevices;
        await videoRef.current.play().catch((error) => console.error(error));
      }
      setMediaStream(mediaDevices);
    };
    if (startScanning) {
      startScanningFunc();
    }
  }, [constraints, mediaStream, startScanning]);

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
        {startScanning && (
          <button
            onClick={() =>
              setConstraints((prev) => {
                return {
                  aspectRatio: 1,
                  facingMode: {
                    exact:
                      prev.facingMode.exact === "user" ? "environment" : "user",
                  },
                };
              })
            }
          >
            Facing Mode {constraints.facingMode.exact}
          </button>
        )}
        <button
          onClick={startScanning ? stopScanning : () => setStartScanning(true)}
        >
          {!startScanning ? "Start Scanning" : "Stop Scanning"}
        </button>
      </div>
    </div>
  );
}
