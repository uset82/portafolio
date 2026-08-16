"use client";

import { useEffect, useRef } from "react";

/**
 * Cosmos mark: ASTROEA's natal-chart wheel holding Pináculo's rising triangle.
 *
 * 24 ticks = Pináculo positions. Every second tick is longer = 12 houses.
 * The triangle is the pinnacle, rising from the horizon (ASC–DSC) toward MC.
 * The line below the base is IC / the unpublished side. No zodiac glyphs.
 *
 * Gyroscope / Compass: Rotates dynamically with phone orientation, gravity tilt,
 * touch-drag, and scroll momentum on iOS & Android like a compass.
 */
const CX = 50;
const CY = 50;

const ticks = Array.from({ length: 24 }, (_, index) => {
  const angle = ((index * 15 - 90) * Math.PI) / 180;
  const isHouse = index % 2 === 0;
  const inner = isHouse ? 37.2 : 40.4;
  const outer = 44.6;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    key: index,
    x1: CX + cos * inner,
    y1: CY + sin * inner,
    x2: CX + cos * outer,
    y2: CY + sin * outer,
  };
});

type CosmosMarkProps = {
  className?: string;
  enableCompass?: boolean;
};

export function CosmosMark({ className, enableCompass = true }: CosmosMarkProps) {
  const containerRef = useRef<SVGSVGElement | null>(null);
  const dialRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!enableCompass || typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let animId: number;
    let currentAngle = 0;
    let targetAngle = 0;
    let currentTiltX = 0;
    let targetTiltX = 0;
    let currentTiltY = 0;
    let targetTiltY = 0;
    let isTouching = false;
    let hasMotionSource = false;

    const updateFrame = () => {
      // Shortest path interpolation for circular compass angle
      let diff = (targetAngle - currentAngle) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      currentAngle += diff * 0.1;

      currentTiltX += (targetTiltX - currentTiltX) * 0.1;
      currentTiltY += (targetTiltY - currentTiltY) * 0.1;

      if (dialRef.current) {
        dialRef.current.style.transform = `rotate(${currentAngle.toFixed(2)}deg)`;
      }
      if (containerRef.current) {
        containerRef.current.style.transform = `perspective(600px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
      }

      animId = requestAnimationFrame(updateFrame);
    };

    // 1. Device Orientation (Magnetic / Compass Heading)
    const handleOrientation = (event: DeviceOrientationEvent) => {
      hasMotionSource = true;
      const iosHeading = (event as unknown as { webkitCompassHeading?: number })
        .webkitCompassHeading;
      if (typeof iosHeading === "number" && !isNaN(iosHeading)) {
        targetAngle = -iosHeading;
      } else if (event.alpha !== null && !isNaN(event.alpha)) {
        targetAngle = -event.alpha;
      }

      if (event.beta !== null && event.gamma !== null) {
        targetTiltX = Math.max(-15, Math.min(15, (event.beta - 45) * 0.3));
        targetTiltY = Math.max(-15, Math.min(15, event.gamma * 0.3));
      }
    };

    // 2. Device Motion / Gravity Sensor (Fallback for all mobile devices)
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (acc && acc.x !== null && acc.y !== null) {
        hasMotionSource = true;
        const x = acc.x;
        const y = acc.y;
        if (Math.abs(x) > 0.3 || Math.abs(y) > 0.3) {
          // Angle of device in hand relative to gravity
          const gravityAngle = Math.atan2(x, y) * (180 / Math.PI);
          targetAngle = -gravityAngle;
          targetTiltX = Math.max(-15, Math.min(15, (y - 5) * 1.5));
          targetTiltY = Math.max(-15, Math.min(15, x * 1.5));
        }
      }
    };

    // 3. Pointer / Mouse Interaction (Desktop & touch drag)
    const handlePointerMove = (event: PointerEvent) => {
      if (isTouching) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angleRad = Math.atan2(event.clientY - centerY, event.clientX - centerX);
        targetAngle = (angleRad * 180) / Math.PI + 90;
        return;
      }

      if (hasMotionSource) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (event.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (event.clientY - centerY) / (window.innerHeight / 2);

      targetAngle = deltaX * 24;
      targetTiltX = -deltaY * 12;
      targetTiltY = deltaX * 12;
    };

    const handlePointerDown = (event: PointerEvent) => {
      isTouching = true;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angleRad = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      targetAngle = (angleRad * 180) / Math.PI + 90;
    };

    const handlePointerUp = () => {
      isTouching = false;
    };

    // 4. Scroll Momentum reaction
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = (currentScrollY - lastScrollY) * 0.15;
      lastScrollY = currentScrollY;
      if (!isTouching && !hasMotionSource) {
        targetAngle += velocity;
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    window.addEventListener(
      "deviceorientationabsolute" as unknown as keyof WindowEventMap,
      handleOrientation as unknown as EventListener,
      { passive: true },
    );
    window.addEventListener("devicemotion", handleMotion, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    animId = requestAnimationFrame(updateFrame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener(
        "deviceorientationabsolute" as unknown as keyof WindowEventMap,
        handleOrientation as unknown as EventListener,
      );
      window.removeEventListener("devicemotion", handleMotion);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [enableCompass]);

  const requestGyroPermission = async () => {
    if (
      typeof window !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === "function"
    ) {
      try {
        await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
      } catch {
        // Fallback to devicemotion / touch interaction
      }
    }
  };

  return (
    <svg
      ref={containerRef}
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      onClick={requestGyroPermission}
      onTouchStart={requestGyroPermission}
      style={{ touchAction: "none" }}
    >
      <g ref={dialRef} className="cosmos-mark__dial" style={{ transformOrigin: "50px 50px" }}>
        <circle className="cosmos-mark__ring" cx={CX} cy={CY} r="44.6" />
        <circle className="cosmos-mark__ring cosmos-mark__ring--inner" cx={CX} cy={CY} r="28.5" />
        {ticks.map((tick) => (
          <line
            key={tick.key}
            className="cosmos-mark__tick"
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
          />
        ))}
        <line className="cosmos-mark__axis" x1="18" y1="58" x2="82" y2="58" />
        <line className="cosmos-mark__axis" x1="50" y1="22" x2="50" y2="78" />
        <polygon className="cosmos-mark__peak" points="50,24 32,58 68,58" />
        <polygon className="cosmos-mark__diamond" points="50,20.4 53.4,24 50,27.6 46.6,24" />
      </g>
    </svg>
  );
}
