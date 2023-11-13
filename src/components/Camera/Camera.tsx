import { useEffect, useRef, useState } from "react";
import Frame from "../Frame/Frame";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  useEffect(() => {
    const getVideoMedia = async () => {
      const mediaStream = await navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: { exact: "environment" } },
        })
        .catch((error) => console.error(error));
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    };
    getVideoMedia();
  }, []);

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
      <button
        onClick={() =>
          setFacingMode(facingMode === "user" ? "environment" : "user")
        }
      >
        Facing Mode
      </button>
    </div>
  );
}
