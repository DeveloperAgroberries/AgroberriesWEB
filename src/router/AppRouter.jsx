import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AgroWebRoutes } from '../agroWeb/routes/AgroWebRoutes';
import { AuthContext, LoginPage } from '../auth';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { CheckingAuth, NavBar } from '../ui/components';
import { useContext, useEffect } from 'react';
import { startLogout } from '../store/auth/thunks';
import { PrivacyPolicyPage } from '../auth/pages/PrivacyPolicyPage';
import { 
    AnalisisTransportes,
    DashboardTransportes,
    EdicionRegistrosPage,
    ExistenciasME,
    // PersonalQuincenalPage,
    PresupuestoRutasPage,
    ProveedoresPage,
    PruebaRH,
    RegistrosTransportes,
    ReporteBaseTransportes,
    ReporteBaseComplementario,
    ReporteAccesoVehicular,
    ReporteComedorGeneral,
    ReporteMonitoreo,
    ReporteUsoAppComedor,
    RutasPage,
    VehiculosPage,
    VehiculosPorProveedor,
    PagoComplementarioPage,
    HomePage,
    AcercaDePage
} from '../agroWeb/pages';

import { ProtectedRoute } from './ProtectedRoute';
import { UnauthorizedPage } from '../agroWeb/pages/UnauthorizedPage';

const events = [
    "load",
    "mousemove",
    "mousedown",
    "click",
    "scroll",
    "keypress",
  ];

export const AppRouter = () => {
        const {logout} = useContext(AuthContext);
        const navigate = useNavigate();
        const dispatch = useDispatch();

		const routes = [
			{ path: "/home", permission: "00000", component: HomePage },
			{ path: "/acercade", permission: "00001", component: AcercaDePage },
			{ path: "/edicionRegistros", permission: "01801", component: EdicionRegistrosPage },
			// { path: "/personalQuincenalTransportes", permission: "01806", component: PersonalQuincenalPage },
			{ path: "/presupuestoRutas", permission: "01802", component: PresupuestoRutasPage },
			{ path: "/complementorutas", permission: "01806", component: PagoComplementarioPage },
			{ path: "/proveedores", permission: "01803", component: ProveedoresPage },
			{ path: "/rutas", permission: "01804", component: RutasPage },
			{ path: "/vehiculos", permission: "01805", component: VehiculosPage },
			{ path: "/reportes/reporteaccesovehicular", permission: "02301", component: ReporteAccesoVehicular },
			{ path: "/reportes/reporteexistencias", permission: "01901", component: ExistenciasME },
			{ path: "/reportes/reporteusoapp", permission: "02001", component: ReporteUsoAppComedor },
			{ path: "/reportes/reportecomedorgeneral", permission: "02002", component: ReporteComedorGeneral },
			{ path: "/reportes/reportemonitoreo", permission: "91156", component: ReporteMonitoreo },
			{ path: "/reportes/reportepruebarh", permission: "02101", component: PruebaRH },
			{ path: "/reportes/analisistransportes", permission: "02201", component: AnalisisTransportes },
			{ path: "/reportes/dashboardtransportes", permission: "02202", component: DashboardTransportes },
			{ path: "/reportes/registrostransportes", permission: "02203", component: RegistrosTransportes },
			{ path: "/reportes/reportebasetransportes", permission: "02204", component: ReporteBaseTransportes },
			{ path: "/reportes/vehiculosporproveedor", permission: "02205", component: VehiculosPorProveedor },
			{ path: "/reportes/reportebasecomplementario", permission: "02206", component: ReporteBaseComplementario }
		];

        let timer;

        //SE COMENTA PARA EVITAR EL CIERRE DE SESION AUTOMATICO: RICARDO DIMAS - 23/04/2025
        // this function sets the timer that logs out the user after 10 secs
        // const handleLogoutTimer = () => {
        //   	timer = setTimeout(() => {
        //   	  // clears any pending timer.
        //   	  resetTimer();
        //   	  // Listener clean up. Removes the existing event listener from the window
        //   	  Object.values(events).forEach((item) => {
        //   	    window.removeEventListener(item, resetTimer);
        //   	  });
        //   	  // logs out user
        //   	  logoutAction();
        //   	}, 600000); // 10000ms = 10secs. You can change the time.
        // };

        // this resets the timer if it exists.
        const resetTimer = () => {
          if (timer) clearTimeout(timer);
        };

        // when component mounts, it adds an event listeners to the window
        // each time any of the event is triggered, i.e on mouse move, click, scroll, keypress etc, the timer to logout user after 10 secs of inactivity resets.
        // However, if none of the event is triggered within 10 secs, that is app is inactive, the app automatically logs out.
        useEffect(() => {
          Object.values(events).forEach((item) => {
            window.addEventListener(item, () => {
              resetTimer();
              //SE COMENTA PARA EVITAR EL CIERRE DE SESION AUTOMATICO: RICARDO DIMAS - 23/04/2025
              // handleLogoutTimer();
            });
          });
        }, []);

        // logs out user by clearing out auth token in localStorage and redirecting url to /signin page.
        const logoutAction = () => {
            logout();
            navigate('/login',{
                replace: true,
            });
            dispatch( startLogout() );
        };

  return (
    <>
        <Routes>
            <Route path="login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />

        	<Route path="privacy-policy" element={
        		<PublicRoute>
            		<PrivacyPolicyPage />
          		</PublicRoute>
        	} />


			{/* Esta parte del codigo es lo que hacia funcionar el ruteo antes de hacerlo seguro */}
            {/* <Route path="/*" element={
                <PrivateRoute>
                    <AgroWebRoutes/>
                </PrivateRoute>
            } /> */}

			<Route path="/" element={<Navigate to="/home" replace />} />

			{/* Rutas protegidas */}
			{routes.map(({ path, permission, component: Component }) => (
                <Route key={path} path={path} element={
                    <PrivateRoute>
                        <ProtectedRoute requiredPermission={permission}>
							<NavBar/>
							<Component/>
                        </ProtectedRoute>
                    </PrivateRoute>
                } />
            ))}

                {/* Ruta para acceso no autorizado */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
    </>
  )
}
