import { useEffect, useRef } from 'react';
import styles from './Wave.module.scss';

type Props = {
  animate?: boolean; // start/stop motion
  width?: number; // px
  height?: number; // px
  amplitude?: number; // px
  frequency?: number; // waves across width (e.g. 2 = two hills)
  speed?: number; // phase speed (radians per second)
  stroke?: string; // CSS color
};

export default function Wave({
  animate = true,
  width = 500,
  height = 108,
  amplitude = 50,
  frequency = 6,
  speed = 6, // radians/sec
  stroke,
}: Props) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const node = pathRef.current;
    if (!node) return;

    // draw once or animate
    const draw = (phase: number) => {
      const points: string[] = [];
      const midY = height / 2;
      const steps = Math.max(120, Math.floor(width / 4)); // resolution

      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const y = midY + Math.sin((i / steps) * frequency * Math.PI * 2 + phase) * amplitude;
        points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
      }
      node.setAttribute('d', points.join(' '));
    };

    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      phaseRef.current += speed * dt;
      draw(phaseRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    // first paint
    draw(phaseRef.current);

    if (animate) {
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    // if paused, ensure any running loop stops
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [animate, width, height, amplitude, frequency, speed]);

  return (
    <svg
      className={styles.wave}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={stroke ? ({ ['--primary-color' as any]: stroke } as React.CSSProperties) : undefined}
    >
      <path ref={pathRef} className={styles.path} />
    </svg>
  );
}
