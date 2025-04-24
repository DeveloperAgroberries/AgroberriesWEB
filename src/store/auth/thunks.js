import { loginWithUserPassword } from "../../sqlserver/auth";
import { checkingCredentials, login, logout } from "./authSlice";

 export const checkingAuthentication = () => {
    return async(dispatch) => {
        dispatch( checkingCredentials() );
    }
 }

 export const startLoginWithUserPassword = (userUpper, hashPassword) => {
    return async(dispatch) => {
        dispatch( checkingCredentials() );

        const result = await loginWithUserPassword(userUpper, hashPassword);
        
        if( !result.ok) return dispatch( logout( result ));
        dispatch(login( result ));
    }
 }

 export const startLogout = () => {
    return async(dispatch) => {
       
        dispatch(logout( ));
    }
 }