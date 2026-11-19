import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // './' = path relatif → hasil build (folder dist) bisa ditaruh di subfolder hosting / LMS mana pun.
  base: './',
  server: {
    // host: true → bisa dibuka dari HP di jaringan Wi-Fi yang sama (untuk tes layar sentuh).
    host: true,
  },
});
