/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 4px)",
          sm: "calc(var(--radius) - 8px)",
        },
        fontFamily: {
          display: ["'Sora'", "sans-serif"],
          body: ["'Sora'", "sans-serif"],
        },
        keyframes: {
          "aurora-drift-1": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "33%": { transform: "translate(15px, -10px) scale(1.05)" },
            "66%": { transform: "translate(-10px, 8px) scale(0.95)" },
          },
          "aurora-drift-2": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "33%": { transform: "translate(-12px, 12px) scale(1.08)" },
            "66%": { transform: "translate(10px, -8px) scale(0.92)" },
          },
          "aurora-drift-3": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "33%": { transform: "translate(8px, 15px) scale(0.95)" },
            "66%": { transform: "translate(-15px, -5px) scale(1.05)" },
          },
          "pulse-slow": {
            "0%, 100%": { opacity: "1" },
            "50%": { opacity: "0.4" },
          },
          "fade-in-up": {
            "0%": { opacity: "0", transform: "translateY(10px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
        },
        animation: {
          "aurora-1": "aurora-drift-1 12s ease-in-out infinite",
          "aurora-2": "aurora-drift-2 15s ease-in-out infinite",
          "aurora-3": "aurora-drift-3 18s ease-in-out infinite",
          "pulse-slow": "pulse-slow 3s ease-in-out infinite",
          "fade-in-up": "fade-in-up 0.5s ease-out both",
        },
      },
    },
    plugins: [],
  }
