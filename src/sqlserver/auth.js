import { authApi } from "../api/authApi";


export const loginWithUserPassword = async(userUpper, hashPassword) => {
    try {
        const {data} = await authApi.get(`/ObtainLogin/${userUpper}/${hashPassword}`);

        const {cCodigoUsu, vNombreUsu, vEmailUsu } = data.usuario;
        const Permissions = data.permissions;

        return{
            ok: true,
            cCodigoUsu, vNombreUsu, vEmailUsu, Permissions
        }
    } catch (error) {
        const isDevelopment = import.meta.env.MODE === 'development';

        if(isDevelopment){
            console.error('Error en el inicio de sesion: ', error);
        } else {
            console.error('Error en el inicio de sesión.');
        }

       let errorMessage = "Error en el inicio de sesión. Por favor, intenta nuevamente.";
        if (isDevelopment && error.response) {
            errorMessage = error.response.data || "Error desconocido.";
        }
   
        return {ok: false, errorMessage: errorMessage}
    }
}
