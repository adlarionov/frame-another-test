import { useState } from "react";
import { TouchEvent } from "react";

const Frame = () => {
  const [divScale, setDivScale] = useState<number>(1);
  const [options, setOptions] = useState<{
    x: number;
    y: number;
    distance: number;
  }>({
    distance: 0,
    x: 0,
    y: 0,
  });
  const [divOptions, setDivOptions] = useState<{
    transform: string;
    webkitTransform: string;
    zIndex: number;
  }>({
    transform: "",
    webkitTransform: "",
    zIndex: 0,
  });

  const distance = (event: TouchEvent) => {
    return Math.hypot(
      event.touches[0].pageX - event.touches[1].pageX,
      event.touches[0].pageY - event.touches[1].pageY
    );
  };

  const onStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      setOptions({
        distance: distance(event),
        y: (event.touches[0].pageY + event.touches[1].pageY) / 2,
        x: (event.touches[0].pageX + event.touches[1].pageX) / 2,
      });
    }
  };

  const onMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault();

      const deltaDistance = distance(event);
      const scale = deltaDistance / options.distance;

      const deltaX =
        ((event.touches[0].pageX + event.touches[1].pageX) / 2 - options.x) * 2; // x2 for accelarated movement
      const deltaY =
        ((event.touches[0].pageY + event.touches[1].pageY) / 2 - options.y) * 2; // x2 for accelarated movement

      setDivScale(Math.min(Math.max(1, scale), 4));
      const transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
      setDivOptions({
        transform: transform,
        webkitTransform: transform,
        zIndex: 9999,
      });
    }
  };

  const onEnd = () => {
    setDivOptions({
      transform: "",
      webkitTransform: "",
      zIndex: 0,
    });
  };

  return (
    <div
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      style={{
        border: "2px black solid",
        width: 120,
        height: 120,
        position: "absolute",
        top: 0,
        left: 0,
        scale: divScale,
        transform: divOptions.transform,
        WebkitTransform: divOptions.webkitTransform,
        zIndex: divOptions.zIndex,
      }}
    >
      Frame
    </div>
  );
};

export default Frame;
