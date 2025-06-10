import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("Error: VITE_API_URL no está definida.");
}

export const activosApi = axios.create({
    baseURL: `${baseURL}/CombustiblesApp`,
    timeout: 120000
    //baseURL: 'http://54.165.41.23:5053/api/CombustiblesApp'
});

activosApi.interceptors.response.use(
    response => response,
    error => {
        //console.error('Error en la solicitud:', error);
        return Promise.reject(error);
    }
);