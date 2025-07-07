import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from '../../ui';
import { HomePage, RutasPage, VehiculosPage, ProveedoresPage, ReportesRoutes, AcercaDePage, PresupuestoRutasPage, EdicionRegistrosPage, PagoComplementarioPage, ActivosPage, CombustiblesPage, ReporteCombustibles, CatalogoChoferesPage, NominaPage } from '../pages';

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
					<Route path="activos" element={<ActivosPage/>} />
					<Route path="combustibles" element={<CombustiblesPage/>} />
					<Route path="reporteCombustibles" element={<ReporteCombustibles/>} />
					<Route path="catalogoChoferes" element={<CatalogoChoferesPage/>} />
					<Route path="nomina" element={<NominaPage/>} />

					<Route path="/" element={<Navigate to="/home"/>} />
				</Routes>
			</div>
		</>
	)
}
