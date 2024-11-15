import 'dotenv/config';

export default {
  "expo": {
    "name": "cabrera autos",
    "slug": "Loquiereslotenemos",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "plugins": [
      [
        "expo-asset", // Agrega el plugin expo-asset para la gestión de imágenes
        {
          "platforms": ["ios", "android", "web"]
        }
      ]
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.alexcode.org.cabrera"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.alexcode.org.cabrera"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "cabreraautos",
    "extra": {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      eas: {
        projectId: "7f47da0d-53ef-4b77-88bd-0bdd2d66afd8"
      }
    }
  }
}
