import { Select } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Html5QrcodeShim } from "html5-qrcode/esm/code-decoder";
import {
  BaseLoggger,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode/esm/core";
import Frame from "../Frame/Frame";

export default function AnotherCamera({
  setResult,
}: {
  setResult: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCamera, setActiveCamera] = useState<MediaDeviceInfo>();
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  const logger = useMemo(() => {
    return new BaseLoggger(false);
  }, []);
  const html5QrcodeFileShim = useMemo(() => {
    return new Html5QrcodeShim(
      [Html5QrcodeSupportedFormats.QR_CODE],
      false,
      false,
      logger
    );
  }, [logger]);

  const onFrameMove = async (canvas: HTMLCanvasElement) => {
    await html5QrcodeFileShim
      .decodeAsync(canvas)
      .then((value) => {
        setResult(value.text);
      })
      .catch((error: Error) => {
        if (error.name === "NotFoundException") {
          console.log(error.name, error.message, "QRcode не был прочитан");
        } else {
          console.error(error);
        }
      });
  };

  const getDevices = async () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => {
        if (device.kind === "videoinput" && device.label) {
          return device;
        }
      });
      const parsed = filtered.map((device) => {
        return { value: device.deviceId, label: device.label };
      });
      setCameras(filtered);
      setOptions(parsed);

      setActiveCamera(filtered[0]);
      startMedia(filtered[0]);
    });
  };

  const stopMedia = (media: MediaStream) => {
    setCurrentStream(null);
    media.getTracks().forEach((track) => track.stop());
  };

  const startMedia = async (activeMedia: MediaDeviceInfo) => {
    if (currentStream !== null) {
      stopMedia(currentStream);
    }
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        ...activeMedia,
        aspectRatio: 1.0,
        facingMode:
          activeMedia.label.includes("front") ||
          activeMedia.label.includes("user")
            ? { ideal: "user", exact: "user" }
            : { ideal: "environment", exact: "environment" },
      },
    });
    // alert(userMedia);
    try {
      if (videoRef.current) {
        setCurrentStream(userMedia);
        videoRef.current.srcObject = userMedia;
        await videoRef.current.play();
      }
    } catch (error) {
      // alert(error);
    }
    // if (
    //   activeMedia.label.includes("front") ||
    //   activeMedia.label.includes("user")
    // ) {
    //   const result = await navigator.mediaDevices.getUserMedia({
    //     audio: false,
    //     video: {
    //       ...activeMedia,
    //       aspectRatio: 1.0,
    //       facingMode: { exact: "user", ideal: "user" },
    //     },
    //   });
    //   alert(result.id);

    //   // .then((stream) => {
    //   //   if (videoRef.current) {
    //   //     setCurrentStream(stream);
    //   //     // // alert(stream.getTracks()); // TODO: fix
    //   //     videoRef.current.srcObject = stream;
    //   //     videoRef.current.play().catch((error) => console.error(error));
    //   //   }
    //   // })
    //   // .catch((error) => console.error(error));
    // } else {
    // await navigator.mediaDevices
    //   .getUserMedia({
    //     audio: false,
    //     video: {
    //       ...activeMedia,
    //       aspectRatio: 1.0,
    //       facingMode: { exact: "environment", ideal: "environment" },
    //     },
    //   })
    //   .then((stream) => {
    //     if (videoRef.current) {
    //       setCurrentStream(stream);
    //       videoRef.current.srcObject = stream;
    //       videoRef.current.play().catch((error) => console.error(error));
    //     }
    //   })
    //   .catch((error) => alert(error));
    // }
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
      <video ref={videoRef} width="100%" height="100%" />
      {currentStream && videoRef.current && (
        <Frame onScan={onFrameMove} video={videoRef.current} />
      )}
      <Select
        options={options}
        value={activeCamera?.deviceId}
        onChange={(value) => changeFacingMode(value)}
        style={{ width: "fit-content" }}
      />
    </div>
  );
}
