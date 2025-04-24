import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("Error: VITE_API_URL no está definida.");
}

export const authApi = axios.create({
    baseURL: `${baseURL}/Logins`,
    timeout: 120000
    // baseURL: 'http://54.165.41.23:5053/api/Logins'
});

authApi.interceptors.response.use(
    response => response,
    error => {
        //console.error('Error en la solicitud:', error);
        if (error.response) {
            // Puedes registrar el error para debug interno
            console.error('Error en la solicitud:', {
                status: error.response.status,
                data: error.response.data,
            });

            // Personaliza el mensaje del error
            const errorMessage = error.response.status === 400
                ? 'Credenciales inválidas. Verifica tu información.'
                : 'Ocurrió un problema con el servidor. Intenta más tarde.';

            return Promise.reject(new Error(errorMessage));
        }

        // Para errores sin respuesta (problemas de red, etc.)
        console.error('Error de red o sin respuesta del servidor.');
        return Promise.reject(new Error('No se pudo conectar al servidor. Verifica tu conexión.'));
    }
);