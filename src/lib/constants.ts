import Constants from "expo-constants";
const extra = Constants.expoConfig?.extra;

export const APP_VARIANT = extra?.appVariant;
export const APP_SCHEME = extra?.appScheme;
export const BUNDLE_ID = extra?.bundleId;
export const APP_NAME = extra?.appName;
export const API_BASE_URL = extra?.apiBaseUrl;
