import { createSlice } from '@reduxjs/toolkit';

export const vehicleAccessSlice = createSlice({
   name: 'vehicleAccess',
   initialState: {
      reports: [],
      vehicleAccessFilters: [],
      choferes: [],
      isLoading: false,
      showView: false,
      errorMessage: null
   },
   reducers: {
      setVehicleAccessReports: (state, action) => {
         state.reports = action.payload.reports;
         state.isLoading = false;
      },

      setVehicleAccessFilters: (state, action) => {
         state.vehicleAccessFilters = {
            ...state.vehicleAccessFilters,
            ...action.payload.vehicleAccessFilters
         };
         state.isLoading = false;
      },

      //Consulta choferes Ricardo Dimas - 07/06/2025
      setChoferes: (state, action) => {
         state.choferes = action.payload.choferes;
         state.isLoading = false;
      },

      checkingIsLoadingVehicleAccessSlice: (state) => {
         state.isLoading = true;
      },

      checkingShowViewVehicleAccess: (state) => {
         state.showView = true;
      },

      resetVehicleAccessFilters: (state) => {
         state.vehicleAccessFilters = [];
         state.isLoading = false;
      },

      resetVehicleAccessReports: (state) => {
         state.reports = [];
         state.isLoading = false;
      },

      //Consulta choferes Ricardo Dimas - 07/06/2025
      resetChoferes: (state) => {
         state.choferes = [];
         state.isLoading = false;
      },

      //Insert chofer Ricardo Dimas - 07/06/2025
      addNewRegistroChofer: (state, action) => {
         state.choferes.push(action.payload);
         state.isLoading = false;
      },
      checkingIsLoadingChofer: (state) => {
         state.isLoading = true;
      },

      //Editar Chofer
      updateChofer: (state, action) => {
         const updateChofer = action.payload.chofer;
         state.choferes = state.choferes.map(chofer =>
            chofer.cCodigoAfc === updateChofer.cCodigoAfc ? updateChofer : chofer
         );
         state.isLoading = false;
         state.errorMessage = action.payload?.errorMessage || null;
      },
      checkingIsLoading:(state)=>{
			state.isLoading = true;
		 }
   }
});

// Action creators are generated for each case reducer function
export const { setVehicleAccessReports, setVehicleAccessFilters, checkingIsLoadingVehicleAccessSlice, checkingShowViewVehicleAccess, resetVehicleAccessFilters, resetVehicleAccessReports, resetChoferes, setChoferes, addNewRegistroChofer, checkingIsLoadingChofer, updateChofer, checkingIsLoading } = vehicleAccessSlice.actions;