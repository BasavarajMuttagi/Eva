import Icon, { Phosphor } from "@/src/components/Icon";
import { Image } from "expo-image";
import { MeshGradientView } from "expo-mesh-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { authClient } from "../lib/auth-client";

cssInterop(Image, {
  className: {
    target: "style",
  },
});

// Mesh gradient palette
const PALETTE = ["#6367FF", "#8494FF", "#C9BEFF", "#FFDBFD", "#F5F4EF"];

function lerpColor(a: string, b: string, t: number): string {
  const h = (s: string) => parseInt(s.slice(1), 16);
  const ar = (h(a) >> 16) & 0xff,
    ag = (h(a) >> 8) & 0xff,
    ab = h(a) & 0xff;
  const br = (h(b) >> 16) & 0xff,
    bg = (h(b) >> 8) & 0xff,
    bb = h(b) & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

const PHASE_OFFSETS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
const CYCLE_SPEED = 0.35;

function getColors(t: number): string[] {
  const n = PALETTE.length;
  return PHASE_OFFSETS.map((offset) => {
    const phase = (t * CYCLE_SPEED + offset) % n;
    const idx = Math.floor(phase);
    const frac = phase - idx;

    const a = PALETTE[idx];
    const b = PALETTE[(idx + 1) % n];
    return lerpColor(a, b, frac);
  });
}

function getPoints(t: number): number[][] {
  return [
    [0.0, 0.0],
    [0.5 + 0.35 * Math.sin(t * 0.4), 0.0],
    [1.0, 0.0],
    [0.0, 0.5 + 0.2 * Math.sin(t * 0.3)],
    [0.5 + 0.3 * Math.sin(t * 0.5), 0.5 + 0.3 * Math.cos(t * 0.37)],
    [1.0, 0.5 + 0.2 * Math.cos(t * 0.27)],
    [0.0, 1.0],
    [0.5 + 0.35 * Math.cos(t * 0.45), 1.0],
    [1.0, 1.0],
  ];
}

export default function SocialSignIn() {
  const router = useRouter();

  const [points, setPoints] = useState<number[][]>(getPoints(0));
  const [colors, setColors] = useState<string[]>(getColors(0));
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const FPS = 60;
    const dt = 1 / FPS;

    frameRef.current = setInterval(() => {
      tRef.current += dt;
      const t = tRef.current;
      setPoints(getPoints(t));
      setColors(getColors(t));
    }, 1000 / FPS);

    return () => {
      if (frameRef.current) clearInterval(frameRef.current);
    };
  }, []);

  const handleGoogleLogin = async () => {
    await authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/today",
      })
      .then((res) => {
        console.log(res);
      });
  };
  const handleAppleLogin = async () => {
    await authClient.signIn.social({
      provider: "apple",
      callbackURL: "/today",
    });
  };

  return (
    <MeshGradientView
      columns={3}
      rows={3}
      colors={colors}
      points={points}
      smoothsColors={true}
      style={{ flex: 1 }}
    >
      {/* Layout */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 32,
          paddingTop: 64,
          paddingBottom: 64,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Center: Logo + App name */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <Image
            source={require("@/assets/images/icon.png")}
            className="w-28 h-28"
          />

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "LibreBaskerville_700Bold",
                letterSpacing: -1,
              }}
              className="text-5xl text-text-primary-light"
            >
              Eva
            </Text>
            <Text className="text-base text-card-dark/80 text-center">
              Just you, remembered.
            </Text>
          </View>
        </View>

        {/* Bottom: CTA */}
        <View style={{ gap: 12 }}>
          <View className="flex-row items-center gap-4 mb-1">
            <View className="flex-1 h-[1px] bg-border-dark/60" />
            <Text className="text-[10px] tracking-[0.2em] text-card-dark/80">
              SIGN IN TO CONTINUE
            </Text>
            <View className="flex-1 h-[1px] bg-border-dark/60" />
          </View>
          {/* Apple */}
          <Pressable
            onPress={handleAppleLogin}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="flex-row items-center bg-card-dark border border-border-dark rounded-2xl py-4 px-5"
          >
            <View className="flex-1 flex-row items-center justify-center gap-2">
              <Icon
                icon={Phosphor.AppleLogoIcon}
                size={20}
                weight="fill"
                className="text-text-primary-dark"
              />
              <Text className="text-[15px] font-semibold text-text-primary-dark">
                Continue with Apple
              </Text>
            </View>
            <Icon
              icon={Phosphor.ArrowRightIcon}
              size={18}
              weight="regular"
              className="text-text-secondary-dark"
            />
          </Pressable>
          <Pressable
            onPress={handleGoogleLogin}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="flex-row items-center bg-card-dark border border-border-dark rounded-2xl py-4 px-5"
          >
            <View className="flex-1 flex-row items-center justify-center gap-2">
              <Image
                source={require("@/assets/google.svg")}
                className="w-5 h-5"
              />
              <Text className="text-[15px] font-semibold text-text-primary-dark">
                Continue with Google
              </Text>
            </View>

            <Icon
              icon={Phosphor.ArrowRightIcon}
              size={18}
              weight="regular"
              className="text-text-secondary-dark"
            />
          </Pressable>

          <Text className="text-xs text-center text-card-dark/80 mt-1">
            Eva never shares your data. Ever.
          </Text>
        </View>
      </View>
    </MeshGradientView>
  );
}
