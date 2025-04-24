import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '../../ui';
import { HomePage, RutasPage, VehiculosPage, ProveedoresPage, ReportesRoutes, AcercaDePage, PresupuestoRutasPage, EdicionRegistrosPage, PagoComplementarioPage } from '../pages';

export const AgroWebRoutes = () => {
	return (
		<>
			<NavBar/>

			<div className="container">
				<Routes>
					<Route path="home" element={<HomePage/>} />
					<Route path="rutas" element={<RutasPage/>} />
					<Route path="edicionRegistros" element={<EdicionRegistrosPage/>} />
					<Route path="complementorutas" element={<PagoComplementarioPage/>}/>
					<Route path="presupuestoRutas" element={<PresupuestoRutasPage/>} />
					<Route path="vehiculos" element={<VehiculosPage/>} />
					<Route path="proveedores" element={<ProveedoresPage/>} />
					<Route path="reportes/*" element={<ReportesRoutes/>} />
					<Route path="acercade" element={<AcercaDePage/>} />

					<Route path="/" element={<Navigate to="/home"/>} />
				</Routes>
			</div>
		</>
	)
}
