import { Button, View } from "react-native";
import { authClient } from "../lib/auth-client";

export default function SocialSignIn() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/today",
    });
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Button title="Login with Google" onPress={handleLogin} />
    </View>
  );
}
