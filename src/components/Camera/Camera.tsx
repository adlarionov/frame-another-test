import { CameraOutlined } from "@ant-design/icons";
import { Button, Col, Result, Row, Select, Slider, Space, Spin } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { Html5QrcodeShim } from "html5-qrcode/esm/code-decoder";
import {
  BaseLoggger,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode/esm/core";
import { FieldNamesType } from "antd/lib/cascader";
import Frame from "../Frame/Frame";

export default function Camera({
  setResult,
}: {
  setResult: (url: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string>("");

  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [selectOptions, setSelectOptions] = useState<FieldNamesType[]>();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const [facingMode, setFacingMode] = useState<string>("environment");
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [zoomOptions, setZoomOptions] = useState<{
    min: number;
    max: number;
    step: number;
    supported: boolean;
    track: MediaStreamTrack | null;
  }>({
    min: 1,
    max: 10,
    step: 1,
    supported: false,
    track: null,
  });
  const [currentZoom, setCurrentZoom] = useState(1);

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

  const updateZoom = (value: number) => {
    setCurrentZoom(value);
    zoomOptions.track?.applyConstraints({
      // eslint-disable-next-line
      advanced: [{ zoom: value } as any], // почему-то обижается, что zoom нету, для этого any
    });
  };

  const stopMedia = (media: MediaStream) => {
    setCurrentStream(null);
    media.getTracks().forEach((track) => {
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
            // const tracks = userMedia.getVideoTracks();
            // if (tracks.length === 0) {
            //   setZoomOptions({
            //     min: 1,
            //     max: 10,
            //     step: 1,
            //     track: null,
            //     supported: false,
            //   });
            //   return;
            // }

            // const [track] = tracks;
            // if (!track.getCapabilities) {
            //   setZoomOptions({
            //     min: 1,
            //     max: 10,
            //     step: 1,
            //     track: null,
            //     supported: false,
            //   });
            //   return;
            // }
            // const capabilities = track.getCapabilities();

            // const settings = track.getSettings();
            // if (!("zoom" in settings) || !("zoom" in capabilities)) {
            //   console.error(
            //     `Zoom is not supported by ${track.label}`,
            //     settings,
            //     capabilities
            //   );
            //   setZoomOptions({
            //     min: 1,
            //     max: 10,
            //     step: 1,
            //     track: null,
            //     supported: false,
            //   });
            //   return;
            // }

            // eslint-disable-next-line
            // const zoomCapabilities = capabilities.zoom as any; // почему-то обижается, что zoom нету, для этого any
            // const min = zoomCapabilities.min as number;
            // const max = zoomCapabilities.max as number;
            // const step = zoomCapabilities.step as number;
            // setZoomOptions({ min, max, step, track, supported: true });
            // setCurrentZoom(settings.zoom as number);
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
    const getDevices = async () => {
      const availableDevices = (
        await navigator.mediaDevices.enumerateDevices()
      ).filter((device) => device.kind === "videoinput");
      setDevices(availableDevices);
      const availableOptions = availableDevices.map((device) => {
        return { value: device.deviceId, label: device.label };
      });
      setSelectOptions(availableOptions);
    };
    startMedia();

    if (!devices) {
      getDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    const startSelectedCamera = async () => {
      setLoading(true);
      if (currentStream) {
        stopMedia(currentStream);
      }
      await navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: { deviceId: selectedOption, aspectRatio: 1.0 },
        })
        .then(async (userMedia) => {
          setCurrentStream(userMedia);
          if (videoRef.current) {
            videoRef.current.srcObject = userMedia;
            await videoRef.current.play().catch((error) => {
              console.error(error);
            });
            const tracks = userMedia.getVideoTracks();
            if (tracks.length === 0) {
              setZoomOptions({
                min: 1,
                max: 10,
                step: 1,
                track: null,
                supported: false,
              });
              return;
            }

            const [track] = tracks;
            if (!track.getCapabilities) {
              setZoomOptions({
                min: 1,
                max: 10,
                step: 1,
                track: null,
                supported: false,
              });
              return;
            }
            const capabilities = track.getCapabilities();

            const settings = track.getSettings();
            if (!("zoom" in settings) || !("zoom" in capabilities)) {
              console.error(
                `Zoom is not supported by ${track.label}`,
                settings,
                capabilities
              );
              setZoomOptions({
                min: 1,
                max: 10,
                step: 1,
                track: null,
                supported: false,
              });
              return;
            }

            // eslint-disable-next-line
            const zoomCapabilities = capabilities.zoom as any; // почему-то обижается, что zoom нету, для этого any
            const min = zoomCapabilities.min as number;
            const max = zoomCapabilities.max as number;
            const step = zoomCapabilities.step as number;
            setZoomOptions({ min, max, step, track, supported: true });
            setCurrentZoom(settings.zoom as number);
            setLoading(false);
          }
        })
        // .catch((error: Error) => {
        //   console.error(error.name);
        //   if (error.name === "NotReadableError" && currentStream) {
        //     stopMedia(currentStream);
        //   } else {
        //     setCameraError(`User media error ${error}`);
        //     setLoading(false);
        //   }
        // });
    };
    startSelectedCamera();
  }, [selectedOption]);

  const changeFacingMode = () => {
    if (facingMode === "environment") {
      setFacingMode("user");
    } else {
      setFacingMode("environment");
    }
  };

  const onSelect = (value: string) => {
    setSelectedOption(value);
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
      {zoomOptions.supported && (
        <Slider
          min={zoomOptions.min}
          max={zoomOptions.max}
          step={zoomOptions.step}
          value={currentZoom}
          onChange={updateZoom}
          tooltip={{ formatter: null }}
          style={{ margin: "16px" }}
        />
      )}

      {devices && (
        <Row justify="center" gutter={8}>
          <Col span={12}>
            <Button
              style={{ width: "100%" }}
              disabled={devices.length < 2}
              onClick={changeFacingMode}
              icon={<CameraOutlined />}
            >
              Сменить камеру
            </Button>
          </Col>
          <Col span={12}>
            <Select
              placeholder="Выбрать камеру"
              style={{ width: "100%" }}
              onChange={onSelect}
              options={selectOptions}
            />
          </Col>
        </Row>
      )}
    </>
  );
}
