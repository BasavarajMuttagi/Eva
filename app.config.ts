import { ConfigContext, ExpoConfig } from "expo/config";

const appVariant = process.env.APP_VARIANT;
const bundleId = process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER;
const appName = process.env.EXPO_PUBLIC_APP_NAME as string;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: "Eva",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "eva",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  platforms: ["ios"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    infoPlist: {
      UIDesignRequiresCompatibility: true,
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-font",
    "expo-secure-store",
    "@react-native-community/datetimepicker",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appVariant,
    apiBaseUrl,
  },
});
