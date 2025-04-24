
import { AuthProvider } from './auth';
import { AppRouter } from './router/AppRouter';

export const AgroWebApp = () => {
    return (
        <>
            <AuthProvider>
                <AppRouter></AppRouter>
            </AuthProvider>
        </>
    )
}
