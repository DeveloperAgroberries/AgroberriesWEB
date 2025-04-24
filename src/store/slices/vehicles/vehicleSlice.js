import { createSlice } from '@reduxjs/toolkit';

export const vehicleSlice = createSlice({
	name: 'vehicle',
	initialState: {
			vehicles:[],
			isLoading: false,
			errorMessage: null,
	},
	reducers: {
		setVehicles: (state, action) =>{
			state.vehicles = action.payload.vehicles;
			state.isLoading = false;
			state.errorMessage = null;
		},
		addNewVehicle: (state, action) => {
			state.vehicles.push(action.payload.vehicle);
			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
		},
		updateVehicle: (state, action) => {
			const updateVehicle = action.payload.vehicle;
			state.vehicles = state.vehicles.map(vehicle =>
				vehicle.cControlVeh === updateVehicle.cControlVeh ? updateVehicle : vehicle
			);
			if (state.selVehicles?.cControlVeh === updateVehicle.cControlVeh) {
                state.selVehicles = updateVehicle;
            }

			state.isLoading = false;
			state.errorMessage = action.payload?.errorMessage || null;
		},
		deleteVehicleById: (state, action) => {
			const vehicleId = action.payload.id;
			state.vehicles = state.vehicles.filter(vehicle => vehicle.cControlVeh !== vehicleId);
			state.isLoading = false;
			state.errorMessage = null;
		},
		checkingIsLoading: (state) => {
			state.isLoading = true;
		}
	}
});

// Action creators are generated for each case reducer function
export const { setVehicles, addNewVehicle, updateVehicle, deleteVehicleById, checkingIsLoading } = vehicleSlice.actions;