export type Career7Tier = "STARTER" | "GROWTH" | "PRO" | "ELITE";

export const career7Theme = {
  colors: {
    primary: {
      from: "from-indigo-600",
      to: "to-purple-600",
      light: "from-indigo-50",
      lightTo: "to-purple-50",
    },
    growth: {
      from: "from-cyan-400",
      to: "to-blue-500",
      light: "from-cyan-50",
      lightTo: "to-blue-50",
    },
    premium: {
      from: "from-purple-600",
      to: "to-pink-600",
      light: "from-purple-50",
      lightTo: "to-pink-50",
    },
    success: {
      from: "from-green-400",
      to: "to-emerald-500",
      light: "from-green-50",
      lightTo: "to-emerald-50",
    },
    sidebar: {
      bg: "from-slate-950 via-slate-900 to-indigo-950",
      text: "text-white",
      hover: "hover:bg-white/10",
    },
  },
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    card: "shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
    hover: "hover:shadow-[0_22px_55px_rgba(79,70,229,0.14)] transition-shadow",
  },
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  },
  typography: {
    heading1: "text-3xl font-bold",
    heading2: "text-2xl font-bold",
    heading3: "text-lg font-bold",
    heading4: "text-base font-bold",
    body: "text-sm",
    caption: "text-xs",
    label: "text-xs font-semibold uppercase",
  },
  sizing: {
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
    sidebarWidth: "w-64",
    maxWidth: "max-w-7xl",
  },
  transitions: {
    fast: "transition-colors duration-150",
    normal: "transition-all duration-200",
    slow: "transition-all duration-300",
  },
  patterns: {
    card: "rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]",
    cardHover: "transition-shadow hover:shadow-[0_22px_55px_rgba(79,70,229,0.14)]",
    gradientText: "bg-gradient-to-r bg-clip-text text-transparent",
    gradientButton: "rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white transition-opacity hover:opacity-90",
    premiumBadge: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
  },
};

export const tierColors: Record<
  Career7Tier,
  { bg: string; text: string; gradient: string; border: string }
> = {
  STARTER: {
    bg: "from-blue-50 to-cyan-50",
    text: "text-blue-600",
    gradient: "from-blue-400 to-cyan-400",
    border: "border-blue-100",
  },
  GROWTH: {
    bg: "from-indigo-50 to-purple-50",
    text: "text-indigo-600",
    gradient: "from-indigo-500 to-purple-500",
    border: "border-indigo-100",
  },
  PRO: {
    bg: "from-purple-50 to-pink-50",
    text: "text-purple-600",
    gradient: "from-purple-500 to-pink-500",
    border: "border-purple-100",
  },
  ELITE: {
    bg: "from-amber-50 to-yellow-50",
    text: "text-amber-600",
    gradient: "from-amber-400 to-yellow-500",
    border: "border-amber-100",
  },
};

export const priorityColors = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-green-100 text-green-700 border-green-200",
};
