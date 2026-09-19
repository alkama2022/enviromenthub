import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      srcDirectory: "src",
      // Keep custom SSR entry that wraps the TanStack handler (src/server.ts)
      server: { entry: "server" },
    }),
    // Nitro handles SSR output. Cloudflare preset keeps previous Lovable output layout
    // (dist/server + dist/client) for compatibility with Wrangler.
    nitro({
      preset: "cloudflare-module",
      output: {
        dir: "dist",
        serverDir: "dist/server",
        publicDir: "dist/client",
      },
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Windows/OneDrive can lock locale JSON briefly, causing EBUSY watch crash (see dev log).
      // Ignore locales dir for FS watch; locale changes still trigger reload via HMR import.
      ignored: ["**/src/locales/**", "**/node_modules/**", "**/dist/**"],
    },
  },
});
