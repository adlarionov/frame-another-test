import { Select } from "antd";
import { useEffect, useRef, useState } from "react";

export default function AnotherCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCamera, setActiveCamera] = useState<MediaDeviceInfo>();
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  const getDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => {
        if (device.kind === "videoinput" && device.label) {
          return device;
        }
      });
      const parsed = filtered.map((device) => {
        return { value: device.deviceId, label: device.label };
      });
      setOptions(parsed);
      setCameras(filtered);
    });
  };

  const stopMedia = (media: MediaStream) => {
    setCurrentStream(null);
    media.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const startMedia = (activeMedia: MediaDeviceInfo) => {
    if (currentStream !== null) {
      stopMedia(currentStream);
    }
    if (
      activeMedia.label.includes("front") ||
      activeMedia.label.includes("user")
    ) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            ...activeMedia,
            aspectRatio: 1.0,
            facingMode: { exact: "user", ideal: "user" },
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            setCurrentStream(stream);
            // alert(stream.getTracks()); // TODO: fix
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((error) => console.error(error));
          }
        })
        .catch((error) => console.error(error));
    } else {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            ...activeMedia,
            aspectRatio: 1.0,
            facingMode: { exact: "environment", ideal: "environment" },
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            setCurrentStream(stream);
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((error) => console.error(error));
          }
        })
        .catch((error) => console.error(error));
    }
  };

  useEffect(() => {
    getDevices();
  }, []);

  const changeFacingMode = (value: string) => {
    const camera = cameras.filter((camera) => {
      if (camera.deviceId === value) {
        return camera;
      }
    });
    setActiveCamera(camera[0]);
    startMedia(camera[0]);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay loop width="100%" height="100%"></video>
      <Select
        options={options}
        value={activeCamera?.deviceId}
        onChange={(value) => changeFacingMode(value)}
        style={{ width: "fit-content" }}
      />
    </div>
  );
}
