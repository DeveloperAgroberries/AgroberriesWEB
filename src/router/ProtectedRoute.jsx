import { useContext } from "react";
import { AuthContext } from "../auth";
import { Navigate } from "react-router-dom";


export const ProtectedRoute = ({ children, requiredPermission }) => {
    const { user } = useContext(AuthContext); // Asegúrate de tener acceso al contexto que contiene el usuario
    // Verifica si el usuario tiene el permiso requerido
    let hasPermission = false;
    if(requiredPermission === "00000" || requiredPermission === "00001"){
        hasPermission = true;
    }else{
        hasPermission = user?.permissions?.includes(requiredPermission);
    }
    
    return hasPermission ? children : <Navigate to="/unauthorized" />;
};