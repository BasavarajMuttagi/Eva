import "dotenv/config";
import { ConfigContext, ExpoConfig } from "expo/config";
const appVariant = process.env.EXPO_PUBLIC_APP_VARIANT!;
const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME!;
const bundleId = process.env.EXPO_PUBLIC_BUNDLE_IDENTIFIER as string;
const appName = process.env.EXPO_PUBLIC_APP_NAME as string;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL!;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: "Eva",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: appScheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  platforms: ["ios"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
    infoPlist: {
      UIDesignRequiresCompatibility: true,
      CFBundleDisplayName: appName,
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
    ["expo-build-properties", { ios: { deploymentTarget: "18.6" } }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appVariant,
    appScheme,
    bundleId,
    appName,
    apiBaseUrl,
  },
});
