import { CameraOutlined } from "@ant-design/icons";
import { Alert, Button, Result, Space, Spin } from "antd";
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
  const [facingMode, setFacingMode] = useState<string>("environment");
  const [isCameraError, setIsCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream>();
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

  const handleChangeFacingMode = () => {
    if (facingMode === "environment") {
      setFacingMode("user");
    } else {
      setFacingMode("environment");
    }
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => track.stop());
    }
  };
  useEffect(() => {
    const handleStartCamera = async () => {
      try {
        await navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: { facingMode, aspectRatio: 1.0 },
          })
          .then((stream) => {
            setMediaStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch((error) => console.log(error));
            }
          })
          .catch((error) => console.error(error, "Promise error"));
      } catch (error) {
        console.error(error);
      }
    };
    handleStartCamera();

    const errorHandle = async () => {
      try {
        await handleStartCamera();
      } catch (error) {
        console.error("receive zoom caps", error);
        setIsCameraError(true);
      }
    };
    errorHandle();
  }, [facingMode]);

  const onCanvasChange = async (canvas: HTMLCanvasElement) => {
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

  if (isCameraError) {
    return (
      <Result
        status="error"
        title="Не удалось получить изображение с камеры"
        subTitle=" Возможно, необходимо выдать доступ к камере для браузера/приложения"
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        {mediaStream && mediaStream.active ? (
          <>
            <video
              autoPlay
              playsInline
              preload="auto"
              ref={videoRef}
              width="100%"
              height="100%"
            />
            {videoRef.current && videoRef.current.playsInline && (
              <Frame video={videoRef.current} onScan={onCanvasChange} />
            )}
          </>
        ) : (
          <Spin />
        )}
        {mediaStream && mediaStream.active === false && <Alert type="error" />}
      </Space>
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        <Button onClick={handleChangeFacingMode} icon={<CameraOutlined />}>
          Сменить камеру
        </Button>
      </Space>
    </>
  );
}
