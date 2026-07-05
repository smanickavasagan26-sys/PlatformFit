// Platform presets for V1

export const PRESETS = [
  {
    id: "og-share-card",
    label: "OG Share Card",
    aspect: 1200 / 630,
    width: 1200,
    height: 630,
    icon: "🌐",
    description: "Open Graph / Link Preview",
  },
  {
    id: "x-twitter-post",
    label: "X / Twitter Post",
    aspect: 1200 / 675,
    width: 1200,
    height: 675,
    icon: "𝕏",
    description: "Twitter / X In-feed Post",
  },
  {
    id: "x-twitter-header",
    label: "X / Twitter Header",
    aspect: 1500 / 500,
    width: 1500,
    height: 500,
    icon: "𝕏",
    description: "Twitter / X Profile Banner",
  },
  {
    id: "linkedin-banner",
    label: "LinkedIn Banner",
    aspect: 1584 / 396,
    width: 1584,
    height: 396,
    icon: "in",
    description: "LinkedIn Profile Background",
  },
  {
    id: "linkedin-post",
    label: "LinkedIn Post",
    aspect: 1200 / 1200,
    width: 1200,
    height: 1200,
    icon: "in",
    description: "LinkedIn Square Post",
  },
  {
    id: "app-store-screenshot",
    label: "App Store Screenshot",
    aspect: 1280 / 800,
    width: 1280,
    height: 800,
    icon: "📱",
    description: "App Store / Play Store Preview",
  },
  {
    id: "square-generic",
    label: "Square (Generic)",
    aspect: 1080 / 1080,
    width: 1080,
    height: 1080,
    icon: "⬛",
    description: "Instagram / Generic Square",
  },
];

export const DEFAULT_PRESET_ID = "og-share-card";
export const DEFAULT_QUALITY = 80;

export const LS_PRESET_KEY = "platformfit_last_preset";
export const LS_QUALITY_KEY = "platformfit_last_quality";
