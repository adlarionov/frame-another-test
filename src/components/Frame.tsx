import { useEffect, useRef, useState } from "react";

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
    touchStartX: {
      touch1: number;
      touch2: number;
    };
    touchStartY: {
      touch1: number;
      touch2: number;
    };
  }>({
    touchStartX: {
      touch1: 0,
      touch2: 0,
    },
    touchStartY: {
      touch1: 0,
      touch2: 0,
    },
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 120,
    height: 120,
  });

  useEffect(() => {
    if (containerRef.current) {
      setPosition({
        x: (containerRef.current.offsetWidth - size.width) / 2,
        y: (containerRef.current.offsetHeight - size.height) / 2,
      });
    }
  }, [size]);

  return (
    <div
      ref={containerRef}
      style={{
        top: 0,
        left: 0,
        width: "99vw",
        height: "50vh",
        border: "1px solid blue",
      }}
      onTouchStart={(event) => {
        console.log(event);
        if (event.targetTouches.length === 2) {
          event.preventDefault();
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          setPinchTouches(() => {
            return {
              touchStartX: {
                touch1: touch1.clientX,
                touch2: touch2.clientY,
              },
              touchStartY: {
                touch1: touch1.clientY,
                touch2: touch2.clientY,
              },
            };
          });
        } else {
          setTouchPosition({
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          });
        }
      }}
      onTouchMove={(event) => {
        if (event.touches.length === 2) {
          event.preventDefault();
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          setSize((prevSize) => {
            return {
              width:
                prevSize.width +
                (pinchTouches.touchStartX.touch1 -
                  touch1.clientX +
                  pinchTouches.touchStartX.touch2 -
                  touch2.clientX) /
                  10,
              height:
                prevSize.height +
                (pinchTouches.touchStartY.touch1 -
                  touch1.clientY +
                  pinchTouches.touchStartY.touch2 -
                  touch2.clientY) /
                  10,
            };
          });
        } else {
          const offsetX = touchPosition.x - event.touches[0].clientX;
          const offsetY = touchPosition.y - event.touches[0].clientY;
          if (
            position.x - offsetX < 0 ||
            position.y - offsetY < 0 ||
            position.x - offsetX >
              containerRef.current!.offsetWidth - size.width ||
            position.y - offsetY >
              containerRef.current!.offsetHeight - size.height
          ) {
            return;
          } else {
            setPosition((prevPosition) => {
              return {
                x: prevPosition.x - offsetX,
                y: prevPosition.y - offsetY,
              };
            });
            setTouchPosition({
              x: event.touches[0].clientX,
              y: event.touches[0].clientY,
            });
          }
        }
      }}
      onTouchEnd={(event) => console.log(event)}
    >
      <div
        style={{
          border: "2px solid red",
          position: "absolute",
          top: position.y,
          left: position.x,
          width: size.width,
          height: size.height,
        }}
      />
      <p>
        {pinchTouches.touchStartX.touch1}, {pinchTouches.touchStartX.touch2}
        <br />
        {pinchTouches.touchStartY.touch1}, {pinchTouches.touchStartY.touch2}
      </p>
    </div>
  );
}

export default Frame;
