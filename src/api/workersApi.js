import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if(!baseURL) {
    console.error("Error: VITE_API_URL no está definida.");
}

export const workersApi = axios.create({
    baseURL: `${baseURL}/Workers`,
    timeout: 12000
})

workersApi.interceptors.response.use(
    response => response,
    error => {
        return Promise.reject(error);
    }
)