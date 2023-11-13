import { Touch, useEffect, useRef, useState } from "react";

import styles from "./Frame.module.css";

function Frame({ video }: { video: HTMLVideoElement }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [startPinchTouches, setStartPinchTouches] = useState<{
    startX: number;
    startY: number;
    distance: number;
  }>({
    startX: 0,
    startY: 0,
    distance: 0,
  });
  const [pinchTransform, setPinchTransform] = useState<{
    scale: number;
    transform: string;
    zIndex: number;
  }>({
    scale: 1,
    transform: "",
    zIndex: 1,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 120,
    height: 120,
  });

  useEffect(() => {
    if (containerRef.current) {
      setPosition({
        x: (containerRef.current.offsetWidth - 120) / 2,
        y: (containerRef.current.offsetHeight - 120) / 2,
      });
    }
  }, []);

  if (
    position.x + size.width > video.clientWidth + 20 ||
    position.y + size.height > video.clientHeight + 20
  ) {
    setPosition({
      x: 0,
      y: 0,
    });
  }

  const calculateDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
  };

  const getImageFromCanvas = (canvasProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (canvasRef.current && video) {
      canvasRef.current.width = size.width;
      canvasRef.current.height = size.height;
      const canvasContext = canvasRef.current.getContext("2d");

      const xMultipler = canvasProps.x / (video?.clientWidth || 0);
      const yMultipler = canvasProps.y / (video?.clientHeight || 0);

      const sourceX = xMultipler * video.videoWidth;
      const sourceY = yMultipler * video.videoHeight;

      const widthMultipler =
        (video as HTMLVideoElement).videoWidth / (video?.clientWidth || 0);
      const heightMultipler =
        (video as HTMLVideoElement).videoHeight / (video?.clientHeight || 0);

      const sourceWidth = widthMultipler * canvasProps.width;
      const sourceHeight = heightMultipler * canvasProps.height;

      canvasContext?.drawImage(
        video as HTMLVideoElement,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const image = canvasRef.current.toDataURL("image/jpeg");

      console.log(image);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        border: "2px solid blue",
        position: "absolute",
        zIndex: 1,
        top: 0,
        left: 0,
        width: video.clientWidth,
        height: video.clientHeight,
      }}
      onMouseDown={(event) => {
        setIsMouseDragging(true);
        setTouchPosition({
          x: event.clientX,
          y: event.clientY,
        });
        console.log("here");
      }}
      onMouseMove={(event) => {
        if (isMouseDragging) {
          let offsetX = touchPosition.x - event.clientX;
          let offsetY = touchPosition.y - event.clientY;
          if (
            position.x - offsetX <= 0 ||
            position.x - offsetX >=
              containerRef.current!.offsetWidth - size.width
          ) {
            offsetX = 0;
          }
          if (
            position.y - offsetY <= 0 ||
            position.y - offsetY >=
              containerRef.current!.offsetHeight - size.height
          ) {
            offsetY = 0;
          }
          setPosition((prevPosition) => {
            return {
              x: prevPosition.x - offsetX,
              y: prevPosition.y - offsetY,
            };
          });
          setTouchPosition({
            x: event.clientX,
            y: event.clientY,
          });
        }
      }}
      onMouseUp={() => {
        setIsMouseDragging(false);
        getImageFromCanvas({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        });
      }}
      onTouchStart={(event) => {
        console.log(event);
        if (event.targetTouches.length === 2) {
          event.preventDefault();
          const touch1 = event.targetTouches[0];
          const touch2 = event.targetTouches[1];
          setStartPinchTouches({
            startX: (touch1.clientX + touch2.clientX) / 2,
            startY: (touch1.clientY + touch2.clientY) / 2,
            distance: calculateDistance(touch1, touch2),
          });
        } else {
          setTouchPosition({
            x: event.targetTouches[0].clientX,
            y: event.targetTouches[0].clientY,
          });
        }
      }}
      onTouchMove={(event) => {
        if (event.touches.length === 2) {
          event.preventDefault();
          const touchMove1 = event.touches[0];
          const touchMove2 = event.touches[1];

          const deltaDistance = calculateDistance(touchMove1, touchMove2);

          const scale = Math.min(
            Math.max(0.85, deltaDistance / startPinchTouches.distance),
            1.25
          );
          // const deltaX =
          //   ((touchMove1.clientX + touchMove2.clientX) / 2 -
          //     startPinchTouches.startX) *
          //   2;
          // const deltaY =
          //   ((touchMove1.clientY + touchMove2.clientY) / 2 -
          //     startPinchTouches.startY) *
          //   2;

          setPinchTransform({
            scale: scale,
            transform: `scale(${scale})`,
            zIndex: 9999,
          });
        } else {
          let offsetX = touchPosition.x - event.targetTouches[0].clientX;
          let offsetY = touchPosition.y - event.targetTouches[0].clientY;
          if (
            position.x - offsetX <= 0 ||
            position.x - offsetX >=
              containerRef.current!.offsetWidth - size.width
          ) {
            offsetX = 0;
          }
          if (
            position.y - offsetY <= 0 ||
            position.y - offsetY >=
              containerRef.current!.offsetHeight - size.height
          ) {
            offsetY = 0;
          }
          setPosition((prevPosition) => {
            return {
              x: prevPosition.x - offsetX,
              y: prevPosition.y - offsetY,
            };
          });
          setTouchPosition({
            x: event.targetTouches[0].clientX,
            y: event.targetTouches[0].clientY,
          });
        }
        getImageFromCanvas({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        });
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        setSize({
          height: 120 * pinchTransform.scale,
          width: 120 * pinchTransform.scale,
        });
        setPinchTransform((prevTransform) => {
          return {
            scale: prevTransform.scale,
            transform: "",
            zIndex: 1,
          };
        });
        getImageFromCanvas({
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        });
      }}
    >
      <div
        className={styles.frame}
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
          width: size.width,
          height: size.height,
          scale: pinchTransform.scale,
          transform: pinchTransform.transform,
          zIndex: pinchTransform.zIndex,
        }}
      >
        <div className={styles.frame__top_left} />
        <div className={styles.frame__top_right} />
        <div className={styles.frame__bottom_left} />
        <div className={styles.frame__bottom_right} />
        <canvas
          ref={canvasRef}
          style={{
            width: size.width,
            height: size.height,
            touchAction: "none",
            opacity: 0
          }}
        />
      </div>
      <div style={{ position: "absolute", top: 550, left: "40%" }}>
        <p>
          {video.clientWidth} {video.clientHeight}
          <br />
          {position.x + size.width} {position.y + size.height}
          <br />
        </p>
      </div>
    </div>
  );
}

export default Frame;
