import { CameraOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Html5QrcodeShim } from "html5-qrcode/esm/code-decoder";
import {
  BaseLoggger,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode/esm/core";
import Frame from "../Frame/Frame";

export default function Camera({
  setResult,
}: {
  setResult: (url: string) => void;
}) {
  // const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const getDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => {
        if (device.kind === "videoinput" && device.label) {
          return device;
        }
      });
      setCameras(filtered);
    });
  };

  const stopMedia = (media: MediaStream) => {
    setCurrentStream(null);
    media.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const startMedia = (activeCamera: MediaDeviceInfo) => {
    if (currentStream !== null) {
      stopMedia(currentStream);
      // alert(activeCamera.deviceId);
    }
    if (activeCamera.label.includes("front")) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            ...activeCamera,
            aspectRatio: 1.0,
            facingMode: { exact: "user", ideal: "user" },
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            setCurrentStream(stream);
            alert(stream.getTracks());
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((error) => alert(error));
          }
          // alert("here");
        })
        .catch((error) => alert(error));
    } else {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            ...activeCamera,
            aspectRatio: 1.0,
            facingMode: { exact: "environment", ideal: "environment" },
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            setCurrentStream(stream);
            alert(stream.getTracks());
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((error) => alert(error));
          }
        })
        .catch((error) => alert(error));
    }
  };

  useEffect(() => {
    getDevices();
  }, []);

  const changeFacingMode = () => {
    const camera = cameras.filter((camera) => {
      if (activeCamera && camera.deviceId !== activeCamera.deviceId) {
        return camera;
      }
    });
    setActiveCamera(camera[0]);
    startMedia(camera[0]);
  };

  // if (cameraError || (mediaStream && mediaStream.active === false)) {
  //   return (
  //     <Result
  //       status="error"
  //       title="Не удалось получить изображение с камеры"
  //       subTitle=" Возможно, необходимо выдать доступ к камере для браузера/приложения"
  //       extra={
  //         <Button type="primary" onClick={() => window.location.reload()}>
  //           Попробовать снова
  //         </Button>
  //       }
  //     />
  //   );
  // }

  return (
    <>
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        <video ref={videoRef} autoPlay loop width="100%" height="100%" />
        {videoRef.current && (
          <Frame video={videoRef.current} onScan={onFrameMove} />
        )}
      </Space>
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        <Button onClick={changeFacingMode} icon={<CameraOutlined />}>
          Сменить камеру
        </Button>
      </Space>
    </>
  );
}
