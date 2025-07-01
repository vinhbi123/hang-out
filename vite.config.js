import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Thêm plugin React
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(), // Cần thiết cho ứng dụng React
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/osm/tiles': {
        target: 'https://tile.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/osm\/tiles/, ''),
      },
      '/api/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
      },
    },
  },
});