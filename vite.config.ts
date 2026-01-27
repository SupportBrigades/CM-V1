import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Plugin para copiar .htaccess al build (necesario para CPanel)
    {
      name: 'copy-htaccess',
      closeBundle() {
        try {
          copyFileSync('.htaccess', 'dist/.htaccess');
          console.log('✅ .htaccess copiado a dist/');
        } catch (error) {
          console.warn('⚠️ No se pudo copiar .htaccess:', error);
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
