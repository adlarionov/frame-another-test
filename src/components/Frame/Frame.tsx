import { useRef, useState } from "react";
import styles from "./Frame.module.css";

const Frame = ({
  video,
  onScan,
}: {
  video: HTMLVideoElement;
  onScan: (value: HTMLCanvasElement) => void;
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const draggableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<{
    offsetX: number;
    offsetY: number;
  }>({
    offsetX: 0,
    offsetY: 0,
  });
  // FIXME: make object of initialSize
  const [initialSize, setInitialSize] = useState<{
    initialWidth: number;
    initialHeight: number;
  }>({
    initialHeight: 0,
    initialWidth: 0,
  });

  const getImageFromCanvas = (canvasProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (canvasRef.current && video) {
      canvasRef.current.width = canvasProps.width;
      canvasRef.current.height = canvasProps.height;
      const canvasContext = canvasRef.current.getContext("2d");

      const xMultipler = canvasProps.x / (video.clientWidth || 0);
      const yMultipler = canvasProps.y / (video.clientHeight || 0);

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

      // const image = canvasRef.current.toDataURL("image/jpeg");

      onScan(canvasRef.current);
      // console.log(image);
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    if (draggableRef.current) {
      if (e.touches.length === 2) {
        setIsResizing(true);
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        setInitialPinchDistance(distance);
        setInitialSize({
          initialHeight: draggableRef.current.clientHeight,
          initialWidth: draggableRef.current.clientWidth,
        });
      } else {
        setIsDragging(true);
        const boundingRect = draggableRef.current.getBoundingClientRect();
        setDragOffset({
          offsetX: touch1.clientX - boundingRect.left,
          offsetY: touch1.clientY - boundingRect.top,
        });
      }
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    if (draggableRef.current) {
      if (isResizing && e.touches.length === 2) {
        setIsDragging(false);
        e.preventDefault();

        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const scaleFactor = currentDistance / initialPinchDistance;

        const newWidth = initialSize.initialWidth * scaleFactor;
        const newHeight = initialSize.initialHeight * scaleFactor;

        if (newHeight > 180 || newHeight < 90) {
          return;
        }

        if (
          draggableRef.current.offsetTop + newHeight >
            document.body.clientWidth - 5 ||
          draggableRef.current.offsetLeft + newWidth >
            document.body.clientWidth - 5
        ) {
          return;
        }

        draggableRef.current.style.width = `${newWidth}px`;
        draggableRef.current.style.height = `${newHeight}px`;
      } else {
        if (containerRef.current && isDragging) {
          const x = touch1.clientX - dragOffset.offsetX;
          const y = touch1.clientY - dragOffset.offsetY;

          const maxX =
            containerRef.current.clientWidth - draggableRef.current.clientWidth;
          const maxY =
            containerRef.current.clientHeight -
            draggableRef.current.clientHeight;

          const validX = Math.min(Math.max(0, x), maxX);
          const validY = Math.min(Math.max(0, y), maxY);

          draggableRef.current.style.left = `${validX}px`;
          draggableRef.current.style.top = `${validY}px`;
        }
      }
      getImageFromCanvas({
        height: draggableRef.current.offsetHeight,
        width: draggableRef.current.offsetWidth,
        x: draggableRef.current.offsetLeft,
        y: draggableRef.current.offsetTop,
      });
    }
  };

  const onTouchEnd = () => {
    setIsResizing(false);
    setIsDragging(false);
    if (draggableRef.current)
      getImageFromCanvas({
        height: draggableRef.current.offsetHeight,
        width: draggableRef.current.offsetWidth,
        x: draggableRef.current.offsetLeft,
        y: draggableRef.current.offsetTop,
      });
  };

  return (
    <div
      className={styles.frame}
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "absolute",
        zIndex: 9999,
        width: document.body.clientWidth - 5,
        height: document.body.clientWidth - 5,
        top: 0,
        left: 0,
        touchAction: "none",
      }}
    >
      <div
        className={styles.frame}
        ref={draggableRef}
        style={{
          position: "absolute",
          width: "120px",
          height: "120px",
          top: (document.body.clientWidth - 125) / 2,
          left: (document.body.clientWidth - 125) / 2,
        }}
      >
        <div className={styles.frame__top_left} />
        <div className={styles.frame__top_right} />
        <div className={styles.frame__bottom_left} />
        <div className={styles.frame__bottom_right} />
        {draggableRef.current && (
          <canvas
            ref={canvasRef}
            style={{
              width: draggableRef.current.style.width,
              height: draggableRef.current.style.height,
              touchAction: "none",
              opacity: 0,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Frame;
