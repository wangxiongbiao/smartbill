require('dotenv').config();

const GOOGLE_IOS_CLIENT_ID_SUFFIX = '.apps.googleusercontent.com';

function buildGoogleIosUrlScheme(iosClientId) {
    const trimmed = iosClientId?.trim();

    if (!trimmed) {
        return null;
    }

    if (!trimmed.endsWith(GOOGLE_IOS_CLIENT_ID_SUFFIX)) {
        throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must end with .apps.googleusercontent.com.');
    }

    return `com.googleusercontent.apps.${trimmed.slice(0, -GOOGLE_IOS_CLIENT_ID_SUFFIX.length)}`;
}

const googleIosUrlScheme = buildGoogleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
const plugins = [
    "expo-router",
    "@react-native-community/datetimepicker",
    "expo-secure-store",
    googleIosUrlScheme && [
        "@react-native-google-signin/google-signin",
        {
            iosUrlScheme: googleIosUrlScheme
        }
    ],
    [
        "expo-build-properties",
        {
            android: {
                compileSdkVersion: 36,
                targetSdkVersion: 35,
                minSdkVersion: 26
            }
        }
    ]
].filter(Boolean);

module.exports = {
    name: "smartbill",
    slug: "smartbill",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.wangxiongbiao.smartbill",
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: "com.wangxiongbiao.smartbill"
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
    },
    plugins,
    experiments: {
        typedRoutes: true
    },
    extra: {
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        NODE_ENV: process.env.NODE_ENV || 'development',
        eas: {
            projectId: '4a5413aa-1eea-4e28-9a32-a259673f1afc'
        }
    }
};
