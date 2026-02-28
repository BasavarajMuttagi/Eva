import { Button } from "react-native";
import { authClient } from "../lib/auth-client";

export function SignOutButton() {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return <Button title="Sign out" onPress={handleSignOut} />;
}
