import { useEffect, useRef, useState } from "react";

import styles from "./Frame.module.css";

function Frame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [pinchTouches, setPinchTouches] = useState<{
    touch1: {
      touchStartX: number;
      touchStartY: number;
    };
    touch2: {
      touchStartX: number;
      touchStartY: number;
    };
  }>({
    touch1: {
      touchStartX: 0,
      touchStartY: 0,
    },
    touch2: {
      touchStartX: 0,
      touchStartY: 0,
    },
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

  return (
    <div
      ref={containerRef}
      style={{
        border: "2px solid blue",
        position: "absolute",
        zIndex: 1,
        top: 0,
        left: 0,
        width: "99vw",
        height: 400,
      }}
      onTouchStart={(event) => {
        console.log(event);
        if (event.targetTouches.length === 2) {
          event.preventDefault();
          const touch1 = event.targetTouches[0];
          const touch2 = event.targetTouches[1];
          setPinchTouches(() => {
            return {
              touch1: {
                touchStartX: touch1.clientX,
                touchStartY: touch1.clientY,
              },
              touch2: {
                touchStartX: touch2.clientX,
                touchStartY: touch2.clientY,
              },
            };
          });
        } else {
          setTouchPosition({
            x: event.targetTouches[0].clientX,
            y: event.targetTouches[0].clientY,
          });
        }
      }}
      onTouchMove={(event) => {
        if (event.targetTouches.length === 2) {
          event.preventDefault();
          const touchMove1 = event.targetTouches[0];
          const touchMove2 = event.targetTouches[1];
          const offsetTouch1 = Math.hypot(
            pinchTouches.touch1.touchStartX - touchMove1.clientX,
            pinchTouches.touch1.touchStartY - touchMove1.clientY
          );
          const offsetTouch2 = Math.hypot(
            pinchTouches.touch2.touchStartX - touchMove2.clientX,
            pinchTouches.touch2.touchStartY - touchMove2.clientY
          );
          if (
            pinchTouches.touch1.touchStartX - touchMove1.clientX > 0 ||
            pinchTouches.touch2.touchStartX - touchMove2.clientX < 0
          ) {
            if (size.height >= 150 || size.width >= 150) {
              return;
            }
            setSize((prevSize) => {
              return {
                width: prevSize.width + (offsetTouch1 + offsetTouch2) / 10,
                height: prevSize.height + (offsetTouch1 + offsetTouch2) / 10,
              };
            });
          } else {
            if (size.height <= 90 || size.width <= 90) {
              return;
            }
            setSize((prevSize) => {
              return {
                width: prevSize.width - (offsetTouch1 + offsetTouch2) / 10,
                height: prevSize.height - (offsetTouch1 + offsetTouch2) / 10,
              };
            });
          }
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
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        setPosition({
          x: position.x,
          y: position.y,
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
        }}
      >
        <div className={styles.frame__top_left} />
        <div className={styles.frame__top_right} />
        <div className={styles.frame__bottom_left} />
        <div className={styles.frame__bottom_right} />
      </div>
      {/* <p>
        {position.x}, {position.y}
        <br />
        {pinchTouches.touch1.touchStartX}, {pinchTouches.touch1.touchStartY}
        <br />
        {pinchTouches.touch2.touchStartX}, {pinchTouches.touch2.touchStartY}
      </p> */}
    </div>
  );
}

export default Frame;
