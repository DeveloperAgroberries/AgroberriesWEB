import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configuración del proxy
    proxy: {
      // Todas las peticiones que empiecen con '/api-rindegastos'
      // serán redirigidas a 'https://api.rindegastos.com'
      '/api-rindegastos': {
        target: 'https://api.rindegastos.com',
        changeOrigin: true, // Esto es importante para que el host de la petición sea 'api.rindegastos.com'
        rewrite: (path) => path.replace(/^\/api-rindegastos/, ''), // Elimina el prefijo '/api-rindegastos' de la URL real
        secure: true, // Si la API de destino es HTTPS (como Rindegastos), déjalo en true
        // ws: true, // Si usas WebSockets, descomenta esta línea
      },
      // Puedes tener otros proxies si los necesitas
      // '/otra-api': {
      //   target: 'http://otra-api.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/otra-api/, ''),
      // },
    },
  },
})
