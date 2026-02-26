// useSwipeOpacity.ts
import { useTabAnimation } from "@react-navigation/material-top-tabs";

export function useSwipeOpacity(index: number) {
  const { position } = useTabAnimation();

  return position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0.94, 1, 0.94],
    extrapolate: "clamp",
  });
}
