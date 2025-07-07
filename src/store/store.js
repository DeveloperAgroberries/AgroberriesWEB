import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './auth/authSlice';
import { selVehicleSlice, vehicleSlice } from './slices/vehicles';
import { providerSlice, selProviderSlice } from './slices/vehicleProviders';
import { routeSlice, selRouteSlice } from './slices/rutas';
import { zoneSlice, selZoneSlice } from './slices/zones';
import { editingTransportRecordsSlice, registrosTransporteSlice, reporteBaseSlice, reportSlice, transportAnalysisSlice } from './slices/reports';
import { fieldSlice } from './slices/fields';
import { userSlice } from './slices/users';
import { workerSlice } from './slices/workers/workerSlice';
import { nomWeekSlice } from './slices/nomWeeks';
import { phytosanitarySlice } from './slices/phytosanitary/phytosanitarySlice';
import { diningRoomSlice } from './slices/diningRoom/diningRoomSlice';
import { routeBudgetSlice, selRouteBudgetSlice } from './slices/routesBudget';
import { vehicleAccessSlice } from './slices/vehicleAccess/vehicleAccessSlice';
import { combustiblesSlice } from './slices/combustibles'; // Asegúrate de que la ruta sea correcta
import { combustibleModSlice } from './slices/combustiblesMod'; // Asegúrate de que la ruta sea correcta
import { nominaCampoSlice, selNominaSlice } from './slices/nominaCampo'; // Asegúrate de que la ruta sea correcta


export const store = configureStore({
	reducer: {
    	auth: authSlice.reducer,
    	vehicles: vehicleSlice.reducer,
    	selVehicles: selVehicleSlice.reducer,
    	providers: providerSlice.reducer,
    	selProviders: selProviderSlice.reducer,
    	routes: routeSlice.reducer,
    	selRoutes: selRouteSlice.reducer,
		routesBudget: routeBudgetSlice.reducer,
		selRoutesBudget: selRouteBudgetSlice.reducer,
    	zones: zoneSlice.reducer,
    	selZones: selZoneSlice.reducer,
    	reports: reportSlice.reducer,
    	fields: fieldSlice.reducer,
    	users: userSlice.reducer,
		workers: workerSlice.reducer,
    	nomWeeks: nomWeekSlice.reducer,
		phytosanitary: phytosanitarySlice.reducer,
		diningRoom: diningRoomSlice.reducer,
		editingTransportRecords: editingTransportRecordsSlice.reducer,
		transportAnalysis: transportAnalysisSlice.reducer,
		registrosTransporte: registrosTransporteSlice.reducer,
		transportBaseReport: reporteBaseSlice.reducer,
		vehicleAccess: vehicleAccessSlice.reducer,
		combustibles: combustiblesSlice.reducer,  // Añade esto para el nuevo slice de combustibles
		combustiblesMod: combustibleModSlice.reducer,  // Añade esto para el nuevo slice de combustibles
		registrosNomina: nominaCampoSlice.reducer,  // Añade esto para el nuevo slice de registrosNomina
		selNomina: selNominaSlice.reducer
  	},
})