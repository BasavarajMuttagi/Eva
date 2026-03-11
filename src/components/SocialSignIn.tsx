import Icon, { Phosphor } from "@/src/components/Icon";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { authClient } from "../lib/auth-client";

cssInterop(Image, {
  className: {
    target: "style",
  },
});

export default function SocialSignIn() {
  const router = useRouter();

  const handleLogin = async () => {
    await authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/today",
      })
      .then((res) => {
        console.log(res);
      });
  };

  return (
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-8 pt-16 pb-10">
      {/* Center: Logo + App name */}
      <View className="flex-1 items-center justify-center gap-6">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-28 h-28"
        />

        <View className="items-center gap-3">
          <Text
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              letterSpacing: -1,
            }}
            className="text-5xl text-text-primary-light dark:text-text-primary-dark"
          >
            Eva
          </Text>
          <Text className="text-base text-text-secondary-light dark:text-text-secondary-dark text-center">
            Just you, remembered.
          </Text>
        </View>
      </View>

      {/* Bottom: CTA */}
      <View className="gap-3">
        {/* Divider */}
        <View className="flex-row items-center gap-4 mb-1">
          <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
          <Text className="text-[10px] tracking-[0.2em] text-text-secondary-light dark:text-text-secondary-dark">
            SIGN IN TO CONTINUE
          </Text>
          <View className="flex-1 h-[1px] bg-border-light dark:bg-border-dark" />
        </View>

        {/* Card-style button */}
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="flex-row items-center gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl py-4 px-5"
        >
          <Image source={require("@/assets/google.svg")} className="w-5 h-5" />
          <Text className="text-[15px] font-semibold text-text-primary-light dark:text-text-primary-dark flex-1">
            Continue with Google
          </Text>
          <Icon
            icon={Phosphor.ArrowRightIcon}
            size={18}
            weight="regular"
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>

        <Text className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-1">
          Eva never shares your data. Ever.
        </Text>
      </View>
    </View>
  );
}
