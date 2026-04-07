import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export interface AudioWaveformProps {
  metering?: number;
  width?: number;
  height?: number;
  barCount?: number;
  barWidth?: number;
  barGap?: number;
  sensitivity?: number;
  overflow?: number;
  color?: string;
}

const DB_FLOOR = -65;
const DB_CEIL = -5;

function dbToAmplitude(db: number | undefined, sensitivity: number) {
  if (db == null) return 0;
  const clamped = Math.max(DB_FLOOR, Math.min(DB_CEIL, db));
  const norm = (clamped - DB_FLOOR) / (DB_CEIL - DB_FLOOR);
  return Math.min(1, Math.pow(norm, 0.6) * sensitivity);
}

function gaussianEnvelope(i: number, total: number) {
  const sigma = 0.4;
  const centre = (total - 1) / 2;
  const x = (i - centre) / centre;
  return Math.exp(-(x * x) / (2 * sigma * sigma));
}

export default function AudioWaveform({
  metering,
  width,
  height = 140,
  barCount = 7,
  barWidth = 16,
  barGap = 10,
  sensitivity = 1.6,
  overflow = 1,
  color = "#60A5FA",
}: AudioWaveformProps) {
  const BAR_RADIUS = barWidth / 2;
  const MIN_HALF_H = barWidth / 2;

  const totalWidth = width ?? barCount * barWidth + (barCount - 1) * barGap;

  const halfH = height / 2;
  const maxHalfH = halfH * overflow;

  const envelope = useMemo(() => {
    const raw = Array.from({ length: barCount }, (_, i) =>
      gaussianEnvelope(i, barCount),
    );
    return raw.map((v) => 0.2 + v * 0.8);
  }, [barCount]);

  const barHeights = useRef(new Float32Array(barCount).fill(MIN_HALF_H));
  const rafRef = useRef<number>(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const animate = () => {
      const amplitude = dbToAmplitude(metering, sensitivity);
      const h = barHeights.current;
      let dirty = false;

      for (let i = 0; i < barCount; i++) {
        const env = envelope[i];
        const dotHeight = MIN_HALF_H;

        const waveHeight =
          MIN_HALF_H + (maxHalfH - MIN_HALF_H) * env * amplitude;

        const target = dotHeight + (waveHeight - dotHeight) * amplitude;

        const prev = h[i];
        const lerp = target > prev ? 0.4 : 0.15;
        const next = prev + (target - prev) * lerp;

        h[i] = Math.abs(next - target) < 0.25 ? target : next;
        if (Math.abs(h[i] - prev) > 0.1) dirty = true;
      }

      if (dirty) setTick((n) => n + 1);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [metering, sensitivity, barCount, envelope, maxHalfH]);

  const h = barHeights.current;

  return (
    <View style={[styles.container, { width: totalWidth, height }]}>
      <Svg width={totalWidth} height={height}>
        {Array.from({ length: barCount }, (_, i) => {
          const halfHeight = h[i];
          const barH = halfHeight * 2;
          const x = i * (barWidth + barGap);
          const y = halfH - halfHeight;

          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              fill={color}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignSelf: "center",
  },
});
