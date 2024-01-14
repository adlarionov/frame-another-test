import { CameraOutlined } from "@ant-design/icons";
import { Button, Result, Space, Spin } from "antd";
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
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<string>("environment");
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  const stopMedia = (media: MediaStream) => {
    setCurrentStream(null);
    media.getTracks().forEach((track) => {
      // alert(track.getSettings().facingMode);
      if (videoRef.current) videoRef.current.srcObject = null;
      track.stop();
    });
  };

  useEffect(() => {
    const startMedia = async () => {
      setLoading(true);
      if (currentStream) {
        stopMedia(currentStream);
      }
      await navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            aspectRatio: 1.0,
            facingMode: { ideal: facingMode, exact: facingMode },
          },
        })
        .then(async (userMedia) => {
          if (videoRef.current) {
            setCurrentStream(userMedia);
            videoRef.current.srcObject = userMedia;
            await videoRef.current.play().catch((error) => {
              console.error(error);
            });
            setLoading(false);
          }
        })
        .catch((error: Error) => {
          console.error(error.name);
          if (error.name === "NotReadableError" && currentStream) {
            stopMedia(currentStream);
          } else {
            setCameraError(`User media error ${error}`);
            setLoading(false);
          }
        });
    };
    startMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const changeFacingMode = () => {
    if (facingMode === "environment") {
      setFacingMode("user");
    } else {
      setFacingMode("environment");
    }
  };

  if (cameraError || (currentStream && currentStream.active === false)) {
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
        {currentStream && videoRef.current ? (
          <Frame video={videoRef.current} onScan={onFrameMove} />
        ) : (
          <Spin size="large" spinning={loading} />
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
