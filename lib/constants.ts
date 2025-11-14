export const BREAKPOINTS = {
  MOBILE: 1024,
} as const;

export const PAGINATION = {
  ITEMS_PER_PAGE: 20,
} as const;

export const ANIMATION = {
  DURATION_SHORT: 0.3,
  DURATION_MEDIUM: 0.4,
  DURATION_LONG: 0.5,
  FOCUS_DELAY: 100,
  ANNOUNCEMENT_DURATION: 1000,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

// Category icon configuration
// Maps category names to their corresponding Lucide icon names
export const CATEGORY_ICONS = {
  Home: "Home",
  Productivity: "Sparkles",
  AI: "Sparkles",
  Career: "Briefcase",
  "Job Search": "Search",
  Gear: "ShoppingBag",
  Templates: "FileText",
} as const;

// Default icon for categories without a specific icon
export const DEFAULT_CATEGORY_ICON = "BookOpen" as const;

