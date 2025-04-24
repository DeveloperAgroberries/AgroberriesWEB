import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth';

export const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        // Realiza el logout
        logout();
        // Redirige a la página de inicio de sesión
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    return (
        <>
            <div>
                <h1>Acceso No Autorizado</h1>
                <p>Redirigiendo...</p>
            </div>
        </>
    )
}
