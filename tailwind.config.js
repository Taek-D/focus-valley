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
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        fontFamily: {
          pixel: ["'Press Start 2P'", "cursive"],
          retro: ["'VT323'", "monospace"],
        },
        keyframes: {
          "bounce-slow": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-6px)" },
          },
          sway: {
            "0%, 100%": { transform: "rotate(0deg)" },
            "25%": { transform: "rotate(2deg)" },
            "75%": { transform: "rotate(-2deg)" },
          },
          "pulse-slow": {
            "0%, 100%": { opacity: "1" },
            "50%": { opacity: "0.7" },
          },
          "glow-pulse": {
            "0%, 100%": { textShadow: "0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.1)" },
            "50%": { textShadow: "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.2)" },
          },
          "float-up": {
            "0%": { opacity: "0", transform: "translateY(20px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          shimmer: {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
        },
        animation: {
          "bounce-slow": "bounce-slow 2s ease-in-out infinite",
          sway: "sway 4s ease-in-out infinite",
          "pulse-slow": "pulse-slow 3s ease-in-out infinite",
          "glow-pulse": "glow-pulse 2s ease-in-out infinite",
          "float-up": "float-up 0.6s ease-out both",
          shimmer: "shimmer 3s ease-in-out infinite",
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }
