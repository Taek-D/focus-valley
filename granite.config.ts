import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "focus-valley",
  brand: {
    displayName: "Focus Valley",
    primaryColor: "#6366f1",
    icon: "https://focus-valley.vercel.app/pwa-512x512.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite",
      build: "vite build",
    },
  },
  permissions: [],
});
