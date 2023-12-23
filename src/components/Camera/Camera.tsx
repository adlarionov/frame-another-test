import { CameraOutlined } from "@ant-design/icons";
import { Button, Result, Space } from "antd";
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
  const [temp, setTemp] = useState<string>("");
  const [isCameraError, setIsCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

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
    if (mediaStream && videoRef.current) {
      videoRef.current.pause();
      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.load();
      videoRef.current.srcObject = null;
      setMediaStream(null);
    }
  };

  useEffect(() => {
    // if (videoRef.current) {
    //   setTemp("inside load event");
    // }
    const handleStartCamera = async () => {
      try {
        await navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: { facingMode, aspectRatio: 1.0 },
          })
          .then((stream) => {
            setMediaStream(stream);
            setTemp("inside then");
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch((error) => console.log(error));
            }
          })
          .catch((error) => console.error(error)); // FIXME: ERROR IS HERE
      } catch (error) {
        console.error(error);
      }
    };
    handleStartCamera();

    const errorHandle = async () => {
      try {
        handleStartCamera();
      } catch (error) {
        console.error("Error", error);
        setTemp("errorr");
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

  if (isCameraError && mediaStream && mediaStream.active === false) {
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
        <video ref={videoRef} width="100%" height="100%" />
        {videoRef.current && mediaStream && mediaStream.active && (
          <Frame video={videoRef.current} onScan={onCanvasChange} />
        )}
      </Space>
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        <Button onClick={handleChangeFacingMode} icon={<CameraOutlined />}>
          Сменить камеру
        </Button>
        {temp}
      </Space>
    </>
  );
}
