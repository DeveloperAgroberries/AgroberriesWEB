import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("Error: VITE_API_URL no está definida.");
}

export const zonesApi = axios.create({
    baseURL: `${baseURL}/Zone`,
    timeout: 120000
    //baseURL: 'http://54.165.41.23:5053/api/Zone'
});

zonesApi.interceptors.response.use(
    response => response,
    error => {
        //console.error('Error en la solicitud:', error);
        return Promise.reject(error);
    }
);