import axios from "axios";


const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("Error: VITE_API_URL no está definida.");
}

export const CoolerTrackAppApi = axios.create({
    baseURL: `${baseURL}/CoolerTrackApp`,
    timeout: 120000
    //baseURL: 'http://54.165.41.23:5053/api/FoodRecords',
});

CoolerTrackAppApi.interceptors.response.use(
    response => response,
    error => {
        //console.error('Error en la solicitud:', error);
        return Promise.reject(error);
    }
);