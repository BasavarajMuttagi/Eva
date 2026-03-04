import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { authClient } from "../lib/auth-client";

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
    <View className="flex-1 bg-screen-light dark:bg-screen-dark px-6 pt-16 pb-8">
      {/* Main content vertically centered */}
      <View className="flex-1 items-center justify-center">
        {/* Logo mark */}
        <View className="w-12 h-12 rounded-full bg-card-light dark:bg-card-dark items-center justify-center mb-8">
          <Text className="text-xl">🌱</Text>
        </View>

        {/* Text block */}
        <View className="items-center">
          <Text className="tracking-[0.22em] text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
            WELCOME BACK TO
          </Text>

          <Text className="mt-3 text-5xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
            Eva
          </Text>

          <Text className="mt-8 text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark text-center">
            Just you, remembered.
          </Text>

          <Text className="mt-5 text-base leading-6 text-text-secondary-light dark:text-text-secondary-dark text-center">
            Sign in to pick up right where{"\n"}you left off.
          </Text>
        </View>
      </View>

      {/* Bottom CTAs */}
      <View className="gap-3">
        {/* Google sign in */}
        <Pressable
          onPress={handleLogin}
          className="self-stretch rounded-full bg-text-primary-light dark:bg-text-primary-dark py-4 px-6 flex-row items-center justify-center gap-3"
        >
          {/* Google G mark */}
          <View className="w-5 h-5 items-center justify-center">
            <Text className="text-sm font-bold text-screen-light dark:text-screen-dark">
              G
            </Text>
          </View>
          <Text className="text-base font-semibold text-screen-light dark:text-screen-dark">
            Continue with Google
          </Text>
        </Pressable>

        {/* Privacy note */}
        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center mt-1">
          Eva never shares your data. Ever.
        </Text>
      </View>
    </View>
  );
}
