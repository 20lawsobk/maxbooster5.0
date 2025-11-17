import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2019",
    minify: "esbuild",
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('wouter')) {
              return 'vendor';
            }
            if (id.includes('recharts') || id.includes('victory')) {
              return 'charts';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
          }
          if (id.includes('/components/studio/') || id.includes('/lib/audioEngine') || id.includes('/lib/studioStore')) {
            return 'studio';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: process.env.REPLIT_DEV_DOMAIN || (process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : undefined),
      clientPort: 443,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
