import androidIcon from "@assets/icons/Android.svg"
import angularIcon from "@assets/icons/Angular.svg"
import appleIcon from "@assets/icons/Apple.svg"
import astroIcon from "@assets/icons/Astro.svg"
import cloudIcon from "@assets/icons/Cloud.svg"
import extensionIcon from "@assets/icons/Extension.svg"
import flutterIcon from "@assets/icons/Flutter.svg"
import openAIIcon from "@assets/icons/OpenAI.svg"
import reactIcon from "@assets/icons/React.svg"
import typescriptIcon from "@assets/icons/TypeScript.svg"
import nextIcon from "@assets/icons/Next.svg"
import swiftIcon from "@assets/icons/Swift.svg"
import figmaIcon from "@assets/icons/Figma.svg"
import notionIcon from "@assets/icons/Notion.svg"
import javascriptIcon from "@assets/icons/JavaScript.svg"
import playwrightIcon from "@assets/icons/Playwright.svg"
import agentIcon from "@assets/icons/Agent.svg"
import visionOSIcon from "@assets/icons/VisionOS.svg"

export const ProjectIcons = {
    android: androidIcon,
    angular: angularIcon,
    ios: appleIcon,
    astro: astroIcon,
    cloud: cloudIcon,
    extension: extensionIcon,
    flutter: flutterIcon,
    openAI: openAIIcon,
    react: reactIcon,
    typescript: typescriptIcon,
    next: nextIcon,
    swift: swiftIcon,
    figma: figmaIcon,
    notion: notionIcon,
    javascript: javascriptIcon,
    playwright: playwrightIcon,
    agent: agentIcon,
    visionOS: visionOSIcon,
}

export type TProjectIcon = keyof typeof ProjectIcons
