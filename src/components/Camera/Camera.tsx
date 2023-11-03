import { useEffect, useRef, useState } from "react";
import Frame from "../Frame/Frame";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  useEffect(() => {
    const getVideoMedia = async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      // .then((stream) => {
      //   if (videoRef.current) {
      //     videoRef.current.srcObject = stream;
      //     videoRef.current.play();
      //   }
      // })
      // .catch((error) => {
      //   alert(error);
      // });
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
        height="100%"
      />
      {videoRef.current?.playsInline && <Frame />}
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
