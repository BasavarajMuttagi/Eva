import { Text } from "react-native";

export default function HeaderTitle({ title }: { title: string }) {
  return (
    <Text
      style={{ fontFamily: "LibreBaskerville_700Bold", fontSize: 20 }}
      className="text-text-primary-light dark:text-text-primary-dark"
    >
      {title}
    </Text>
  );
}
