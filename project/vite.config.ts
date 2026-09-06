import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Reconstructed config — the original build config (vite.config.ts) was not
// publicly served, so this is a standard Vite + React setup inferred from the
// bundle's output shape (single JS entry + single CSS file, esbuild-minified,
// asset hashing pattern "name-HASH.ext").
export default defineConfig({
  plugins: [react()],
});
