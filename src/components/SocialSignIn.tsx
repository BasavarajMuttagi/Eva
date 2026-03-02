import { Button, Text, View } from "react-native";
import { authClient } from "../lib/auth-client";
import { API_BASE_URL } from "../lib/constants";

export default function SocialSignIn() {
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
    <View className="flex-1 justify-center items-center">
      <Text>{API_BASE_URL}</Text>
      <Button title="Login with Google" onPress={handleLogin} />
    </View>
  );
}
