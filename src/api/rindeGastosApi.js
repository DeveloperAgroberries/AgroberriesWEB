// import axios from 'axios';

// // ... tus variables de entorno existentes
// const RINDEGASTOS_ACCESS_TOKEN = import.meta.env.VITE_RINDEGASTOS_ACCESS_TOKEN;
// // const RINDEGASTOS_BASE_URL = import.meta.env.VITE_API_URL_RINDEGASTOS; // <-- ¡YA NO NECESITAS ESTA!

// // Crea una instancia de Axios para la API de Rindegastos
// export const rindegastosApi = axios.create({
//     // CAMBIO CLAVE: Apunta al proxy que configuraste en vite.config.js
//     // Ahora las peticiones irán de tu navegador -> Vite Dev Server -> api.rindegastos.com
//     baseURL: '/api-rindegastos/v1', // <-- ¡NUEVA BASE URL!
//     timeout: 30000,
//     headers: {
//         'Authorization': `Bearer ${RINDEGASTOS_ACCESS_TOKEN}`,
//         'Content-Type': 'application/json'
//     }
// });

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("Error: VITE_API_URL no está definida.");
}

export const RindeGastosApi = axios.create({
    baseURL: `${baseURL}/RindeGastos`,
    timeout: 120000 // Mantener los 2 minutos está perfecto para los SPs de sincronización pesados
});

// 🚀 1. INTERCEPTOR DE PETICIÓN (El que te hacía falta)
// Este código se ejecuta JUSTO ANTES de que la petición viaje a tu API en .NET
RindeGastosApi.interceptors.request.use(
    (config) => {
        // Jalamos el token dinámicamente del localStorage en el milisegundo del click
        const token = localStorage.getItem('token'); 
        
        if (token) {
            // Inyectamos el header de autorización que tu backend de .NET espera
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. INTERCEPTOR DE RESPUESTA (El que ya tenías)
RindeGastosApi.interceptors.response.use(
    response => response,
    error => {
        // Tip extra: Si tu API devuelve un 401 (Token expirado), podrías limpiar el estado aquí
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o token no válido.");
        }
        return Promise.reject(error);
    }
);