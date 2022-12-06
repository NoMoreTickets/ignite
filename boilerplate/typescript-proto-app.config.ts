import { ExpoConfig, ConfigContext } from "@expo/config"
import { get } from "lodash"
import * as fs from "fs"
import chalk from "chalk"
import { proc } from "react-native-reanimated"

class AppConfigurator {
  public env: any
  public fallbacks: any

  constructor(processEnv: any, localEnvironmentVars: any) {
    this.env = processEnv
    this.fallbacks = localEnvironmentVars
  }

  public getEnvFilePath(): string {

  }

  public getBundleIdentifier(): string {
    let bundleID = ""

    if (this.env.USE_APP_STORE_APPID) {
      bundleID = "com.orgname.appname"
    } else {
      bundleID = "com.orgname.appname-test"
    }

    return bundleID
  }

  public getAppName(): string {
    let appName = ""
    let buildName = ""

    if (this.env.USE_APP_STORE_APPID) {
      appName = "TheAppName"
    } else {
      appName = "TheAppTest-Test"
    }

    let appPrefix

    if (this.env.BUILDENV === "dev") {
      appPrefix = "Dev"
    } else if (this.env.BUILDENV == "staging") {
      appPrefix = "Staging"
    } else {
      appPrefix = ""
    }

    return `${appPrefix} ${appName}`
  }

  /**
   * Gets a environment value either from expo secrets or a fallback
   * value provided by the enviornment varibles file from the previous ionic app.
   * @param val The name of the value being retrieved (e.g. "ENV_PROD_MY_PUBLIC_KEY")
   * @param fallback A lodash.get() compatible dot-seperated key path. Note that this is relative to the parent build enviornment objects in the environment variables structure. e.g. You pass in 'my.publicKey' for the parameter and it will return a value from dev.my.publicKey, qa.my.publicKey, etc.
   * @param buildConfig A build configuration (e.g.)
   * @returns The configuration value
   */
  public getConfigValue(varname: string, fallback: string, buildConfig = ""): string {
    let returnConfigString = ""

    // If it's a build environment specific value then use the convention we've adopted for
    // build environment-specific variables in expo secrets.
    const envVarName = buildConfig ? `ENV_${buildConfig.toUpperCase()}_${varname}` : varname

    // Create a fallback path for just in case
    // e.g.
    // prod.foo.bar.etc if it's a build environment-specific variable
    // foo.bar.etc if it's not build environment-specific variable
    const fallbackPath = "environment." + (buildConfig ? `${buildConfig}.${fallback}` : fallback)


    // Check to see if what we get from secrets exists
    const envVarValue = this.env[envVarName]
    if (envVarValue) {
      returnConfigString = envVarValue
    } else if (this.fallbacks) {
      // Otherwise, hit up configuration we have left over from the ionic project
      const fallbackValue = get(this.fallbacks, fallbackPath)

      if (!fallbackValue) {
        console.warn(`environment variable fallback ${fallbackPath} does not exist`)
      } else {
        returnConfigString = fallbackValue
      }
    }

    return returnConfigString
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  let appConfig
  let local_app_env_vars = null
  let buildEnv

  if (process.env.EAS_BUILD && process.env.EAS_BUILD === "true") {
    appConfig = new AppConfigurator(process.env, null)
  } else {
    if(!process.env.BUILD_ENV) {
      console.error(
        chalk.red(
          "\nError: A BUILD_ENV environment variable specifying the build configuration must be passed in to run the app locally. Please make sure that this is specified in any package.json scripts that are run. Exiting...\n",
        ),
      )

      process.exit(1)
    }

    // TODO: Fix this
    const envFilePath = appConfig.getEnvFilePath()
    const envFileExists = fs.existsSync(envFilePath)


    if (!envFileExists) {
      console.error(
        chalk.red(
          "\nError: The local environment variables needs to be added" +
          "to the project root directory to run the app locally using \"yarn expo:start\" commands." +
          "\n\nExiting...\n"
        ),
      )
      process.exit(1)
    }

    local_app_env_vars = require("./environment-vars")
    appConfig = new AppConfigurator(process.env, local_app_env_vars)
  }

  const configObject: ExpoConfig = {
    ...config,
    name: appConfig.getAppName(),
    slug: "NameOfTheApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/app-icon-all.png",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#fff"
    },
    updates: {
      "fallbackToCacheTimeout": 0
    },
    jsEngine: "hermes",
    assetBundlePatterns: ["**/*"],
    android: {
      icon: "./assets/images/app-icon-android-legacy.png",
      package: appConfig.getBundleIdentifier(),
      adaptiveIcon: {
        foregroundImage: "./assets/images/app-icon-android-adaptive-foreground.png",
        backgroundImage: "./assets/images/app-icon-android-adaptive-background.png"
      },
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#fff"
      }
    },
    ios: {
      icon: "./assets/images/app-icon-ios.png",
      supportsTablet: true,
      bundleIdentifier: appConfig.getBundleIdentifier(),
      splash: {
        image: "./assets/images/splash.png",
        tabletImage: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#fff"
      }
    },
    web: {
      favicon: "./assets/images/app-icon-web-favicon.png",
      splash: {
        image: "./assets/images/splash-logo-web.png",
        resizeMode: "contain",
        backgroundColor: "#fff"
      }
    },
    extra: {
      buildID: process.env?.EAS_BUILD_ID || "",
      buildEnv: process.env.BUILDENV,

      // Services settings
      firebase: {
        apiKey: appConfig.getConfigValue("FIREBASE_API_KEY", "firebase.apiKey"),
        authDomain: appConfig.getConfigValue("FIREBASE_AUTH_DOMAIN", "firebase.authDomain"),
        databaseURL: appConfig.getConfigValue("FIREBASE_DATABASE_URL", "firebase.databaseURL"),
        projectId: appConfig.getConfigValue("FIREBASE_PROJECT_ID", "firebase.projectId"),
        storageBucket: appConfig.getConfigValue(
          "FIREBASE_STORAGE_BUCKET",
          "firebase.storageBucket",
        ),
        messagingSenderId: appConfig.getConfigValue(
          "FIREBASE_MESSAGING_SENDER_ID",
          "firebase.messagingSenderId",
        ),
      },
      apiURL: appConfig.getConfigValue("API_URL", "apiUrl", process.env.BUILD_ENV),
      testEasEnvVar: appConfig.getConfigValue("EAS_TEST_VAR", "whatever", process.env.BUILD_ENV),

      // Content/misc settings
      app: appConfig.getConfigValue("app", "app") || "TheAppNae",
      company: appConfig.getConfigValue("company", "company") || "TheCompanyName",
      version: appConfig.getConfigValue("version", "version") || "1.2.3",
      buildNumber: 42,
      entityModelVersion: appConfig.getConfigValue("entityVersion", "entityVersion") || 1,
      primaryColor: appConfig.getConfigValue("primaryColor", "primaryColor") || "12cdef",
    },
  }

  return configObject
}
