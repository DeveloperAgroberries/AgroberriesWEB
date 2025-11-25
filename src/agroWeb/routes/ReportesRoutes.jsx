import { Navigate, Route, Routes } from 'react-router-dom';
import { CostoxRutayKm, AnalisisTransportes, RegistrosTransportes, VehiculosPorProveedor, ReporteBaseTransportes, PruebaRH, ExistenciasME, DashboardTransportes, ReporteMonitoreo, ReporteUsoAppComedor, ReporteComedorGeneral, ReporteAccesoVehicular, ReporteChecadorFacial } from '../pages/Reports';

export const ReportesRoutes = () => {
	return (
		<Routes>
			{/* Reportes Acceso Vehicular */}
			<Route path="reporteaccesovehicular" element={<ReporteAccesoVehicular/>}/>

			{/* Reportes Almacen empaque */}
			<Route path="reporteexistencias" element={<ExistenciasME />} />

			{/* Reportes Comedores */}
			<Route path="reporteusoapp" element={<ReporteUsoAppComedor />} />
			<Route path="reportecomedorgeneral" element={<ReporteComedorGeneral />} />

			{/* Reportes Fitosanidad */}
			<Route path="reportemonitoreo" element={<ReporteMonitoreo />} />

			{/* Reportes Recursos Humanos */}
			<Route path="reportepruebarh" element={<PruebaRH />} />
			
			{/* Reportes Transportes */}
			<Route path="analisistransportes" element={<AnalisisTransportes />}/>
			<Route path="costoxRutayKm" element={<CostoxRutayKm />} />
			<Route path="registrostransportes" element={<RegistrosTransportes />} />
			<Route path="vehiculosporproveedor" element={<VehiculosPorProveedor />} />
			<Route path="reportebasetransportes" element={<ReporteBaseTransportes />} />
			<Route path="dashboardtransportes" element={<DashboardTransportes />} />

			<Route path="reportechecadorfacial" element={<ReporteChecadorFacial />} />


			<Route path="/*" element={<Navigate to="/reportes" />} />
		</Routes>
	)
}
