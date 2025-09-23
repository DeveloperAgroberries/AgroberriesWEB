import axios from 'axios';

// ... tus variables de entorno existentes
const RINDEGASTOS_ACCESS_TOKEN = import.meta.env.VITE_RINDEGASTOS_ACCESS_TOKEN;
// const RINDEGASTOS_BASE_URL = import.meta.env.VITE_API_URL_RINDEGASTOS; // <-- ¡YA NO NECESITAS ESTA!

// Crea una instancia de Axios para la API de Rindegastos
export const rindegastosApi = axios.create({
    // CAMBIO CLAVE: Apunta al proxy que configuraste en vite.config.js
    // Ahora las peticiones irán de tu navegador -> Vite Dev Server -> api.rindegastos.com
    baseURL: '/api-rindegastos/v1', // <-- ¡NUEVA BASE URL!
    timeout: 30000,
    headers: {
        'Authorization': `Bearer ${RINDEGASTOS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});